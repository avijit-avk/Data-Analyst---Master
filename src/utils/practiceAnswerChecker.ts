import {
  PracticeAnswerValidationRule,
  PracticeCheckStatus,
  PracticeNumericTarget,
} from '../types/academy';

export interface PracticeEvaluationResult {
  status: PracticeCheckStatus;
  feedback: string;
}

function normalizeText(raw: string): string {
  return raw
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeForExactComparison(raw: string): string {
  return normalizeText(raw)
    .replace(/^=\s*/, '')
    .replace(/\s*,\s*/g, ',')
    .replace(/\s*;\s*/g, ';')
    .replace(/\.+$/, '');
}

/**
 * Extract numeric tokens from learner text (handling $, commas, %, negative numbers,
 * and common unit suffixes like "s", "d", "pp", "r").
 */
export function extractNumericValues(raw: string): number[] {
  const cleaned = raw.replace(/[’‘]/g, "'").replace(/[“”]/g, '"');
  // Match optional sign, optional $, digits with optional comma grouping and optional decimals
  const matches = cleaned.match(
    /(?<![a-z0-9_])[-+]?\$?\d{1,3}(?:,\d{3})+(?:\.\d+)?|(?<![a-z0-9_])[-+]?\$?\d+(?:\.\d+)?/gi
  );
  if (!matches) return [];

  const values: number[] = [];
  for (const token of matches) {
    const stripped = token.replace(/[$,]/g, '');
    const parsed = Number(stripped);
    if (Number.isFinite(parsed)) {
      values.push(parsed);
    }
  }
  return values;
}

function numberMatchesTarget(
  extracted: number[],
  target: PracticeNumericTarget
): boolean {
  const tolerance = target.tolerance ?? (Number.isInteger(target.value) ? 0.01 : 0.25);

  for (const candidate of extracted) {
    if (Math.abs(candidate - target.value) <= tolerance) {
      return true;
    }
    if (target.allowPercentRatio) {
      // Allow e.g. 0.417 when target is 41.7, or 41.7 when target is 0.417
      if (target.value > 1 && Math.abs(candidate * 100 - target.value) <= tolerance) {
        return true;
      }
      if (target.value > 0 && target.value <= 1 && Math.abs(candidate / 100 - target.value) <= tolerance) {
        return true;
      }
    }
  }

  return false;
}

function keywordMatchesText(normalizedText: string, compactText: string, keyword: string): boolean {
  const normKeyword = normalizeText(keyword);
  if (!normKeyword) return false;

  // If keyword contains punctuation/operators/SQL/formula syntax, check substring directly
  if (/[^a-z0-9\s]/.test(normKeyword) || normKeyword.includes(' ')) {
    if (normalizedText.includes(normKeyword)) return true;
    const compactKeyword = normKeyword.replace(/\s+/g, '');
    return compactKeyword.length >= 3 && compactText.includes(compactKeyword);
  }

  // Single alphanumeric word: match word boundary or identifier boundary
  const escaped = normKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const wordRegex = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'i');
  return wordRegex.test(normalizedText) || normalizedText.includes(normKeyword);
}

export function evaluatePracticeAnswer(
  rawAnswer: string,
  rule: PracticeAnswerValidationRule
): PracticeEvaluationResult {
  const trimmed = rawAnswer.trim();
  if (!trimmed) {
    return {
      status: 'needs_review',
      feedback:
        'Paste your metric, formula, query, or observation from the sample CSV before clicking Check Answer.',
    };
  }

  const normalized = normalizeText(trimmed);
  const compact = normalized.replace(/\s+/g, '');
  const exactNorm = normalizeForExactComparison(trimmed);

  // 1. Check accepted exact short-form values if provided
  if (rule.acceptedExactValues && rule.acceptedExactValues.length > 0) {
    const matchedExact = rule.acceptedExactValues.some((accepted) => {
      const target = normalizeForExactComparison(accepted);
      return exactNorm === target || exactNorm.includes(target);
    });
    if (matchedExact) {
      return {
        status: 'verified',
        feedback:
          'Verified Correct — your result matches the expected value from the sample CSV.',
      };
    }
  }

  // 2. Evaluate expected numeric targets
  const extractedNumbers = extractNumericValues(trimmed);
  const numberTargets = rule.expectedNumbers ?? [];
  let numbersMatched = 0;
  for (const target of numberTargets) {
    if (numberMatchesTarget(extractedNumbers, target)) {
      numbersMatched += 1;
    }
  }
  const allNumbersOk =
    numberTargets.length === 0 || numbersMatched === numberTargets.length;

  // 3. Evaluate required keyword/concept groups
  const keywordGroups = rule.requiredKeywordGroups ?? [];
  let groupsMatched = 0;
  for (const group of keywordGroups) {
    if (group.some((kw) => keywordMatchesText(normalized, compact, kw))) {
      groupsMatched += 1;
    }
  }
  const allKeywordsOk =
    keywordGroups.length === 0 || groupsMatched === keywordGroups.length;

  if (allNumbersOk && allKeywordsOk && (numberTargets.length > 0 || keywordGroups.length > 0)) {
    return {
      status: 'verified',
      feedback:
        'Verified Correct — your answer captures the expected figures and logic for this sample dataset.',
    };
  }

  // Build informative diagnostic without giving away the complete reference solution
  const totalChecks = numberTargets.length + keywordGroups.length;
  const totalPassed = numbersMatched + groupsMatched;

  if (totalChecks > 0 && totalPassed > 0) {
    return {
      status: 'needs_review',
      feedback: `Needs Review (${totalPassed}/${totalChecks} checks matched). ${rule.nudge}`,
    };
  }

  return {
    status: 'needs_review',
    feedback: `Needs Review. ${rule.nudge}`,
  };
}
