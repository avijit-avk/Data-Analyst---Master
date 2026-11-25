export interface ParsedChapterLine {
  id: string;
  rawTimestamp: string;
  seconds: number;
  title: string;
}

export function isYouTubeUrl(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;

  const candidate =
    /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    return (
      host === 'youtu.be' ||
      host === 'youtube.com' ||
      host.endsWith('.youtube.com')
    );
  } catch {
    return false;
  }
}

export function extractYouTubeVideoId(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  const candidate =
    /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    const host = parsed.hostname.toLowerCase();

    if (host === 'youtu.be') {
      const seg = parsed.pathname.split('/').filter(Boolean)[0];
      return seg && /^[a-zA-Z0-9_-]{6,}$/.test(seg) ? seg : null;
    }

    if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
      const vParam = parsed.searchParams.get('v');
      if (vParam && /^[a-zA-Z0-9_-]{6,}$/.test(vParam)) {
        return vParam;
      }
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (
        parts.length >= 2 &&
        (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') &&
        /^[a-zA-Z0-9_-]{6,}$/.test(parts[1])
      ) {
        return parts[1];
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function parseTimestampToSeconds(raw: string): number | null {
  const cleaned = raw.trim().replace(/^[\[(]+|[\])]+$/g, '');
  if (!cleaned) return null;

  // Support plain numeric seconds with optional trailing 's' (e.g., "90" or "90s")
  const plainSecondsMatch = /^(\d+)s?$/i.exec(cleaned);
  if (plainSecondsMatch) {
    const secs = Number(plainSecondsMatch[1]);
    return Number.isFinite(secs) && secs >= 0 ? secs : null;
  }

  // Support HH:MM:SS or MM:SS
  const parts = cleaned.split(':');
  if (parts.length !== 2 && parts.length !== 3) return null;
  if (!parts.every((p) => /^\d{1,3}$/.test(p))) return null;

  if (parts.length === 2) {
    const minutes = Number(parts[0]);
    const seconds = Number(parts[1]);
    if (seconds >= 60) return null;
    return minutes * 60 + seconds;
  }

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  const seconds = Number(parts[2]);
  if (minutes >= 60 || seconds >= 60) return null;
  return hours * 3600 + minutes * 60 + seconds;
}

export function formatSecondsToTimestamp(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  const ss = String(seconds).padStart(2, '0');
  if (hours > 0) {
    const mm = String(minutes).padStart(2, '0');
    return `${hours}:${mm}:${ss}`;
  }
  return `${minutes}:${ss}`;
}

export function extractTimestampFromYouTubeUrl(rawUrl: string): number | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  const candidate =
    /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    const tParam = parsed.searchParams.get('t') ?? parsed.searchParams.get('start');
    if (!tParam) return null;

    // Handle 1h15m30s / 45m10s / 90s / 90
    const hmsMatch = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/i.exec(tParam.trim());
    if (hmsMatch && (hmsMatch[1] || hmsMatch[2] || hmsMatch[3])) {
      const h = Number(hmsMatch[1] ?? 0);
      const m = Number(hmsMatch[2] ?? 0);
      const s = Number(hmsMatch[3] ?? 0);
      return h * 3600 + m * 60 + s;
    }

    return parseTimestampToSeconds(tParam);
  } catch {
    return null;
  }
}

export function buildYouTubeTimestampUrl(
  rawUrl: string,
  seconds: number | null
): string {
  const trimmed = rawUrl.trim();
  const candidate =
    /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  const videoId = extractYouTubeVideoId(candidate);
  try {
    const parsed = new URL(candidate);
    const host = parsed.hostname.toLowerCase();

    if (videoId) {
      if (host === 'youtu.be') {
        const out = new URL(`https://youtu.be/${videoId}`);
        if (seconds !== null && seconds >= 0) {
          out.searchParams.set('t', String(Math.floor(seconds)));
        }
        return out.toString();
      }

      const out = new URL(`https://www.youtube.com/watch`);
      out.searchParams.set('v', videoId);
      if (seconds !== null && seconds >= 0) {
        out.searchParams.set('t', String(Math.floor(seconds)));
      }
      return out.toString();
    }

    // Fallback for non-standard YouTube links (e.g., playlists)
    if (seconds !== null && seconds >= 0) {
      parsed.searchParams.set('t', String(Math.floor(seconds)));
    } else {
      parsed.searchParams.delete('t');
      parsed.searchParams.delete('start');
    }
    return parsed.toString();
  } catch {
    return trimmed;
  }
}

export function parseYouTubeChapters(rawText: string): ParsedChapterLine[] {
  if (!rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/);
  const chapters: ParsedChapterLine[] = [];
  const timestampPattern =
    /(?:^|[\s[(])((?:\d{1,2}:)?\d{1,2}:\d{2})(?=[\])\s\-–—:|]|$)/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const match = timestampPattern.exec(line);
    if (!match) continue;

    const rawTs = match[1];
    const seconds = parseTimestampToSeconds(rawTs);
    if (seconds === null) continue;

    // Remove the matched timestamp token (and optional wrapping brackets/parens)
    const matchStart = match.index + (match[0].length - rawTs.length);
    const before = line.slice(0, matchStart);
    const after = line.slice(matchStart + rawTs.length);

    const title = `${before} ${after}`
      .replace(/^[\s\-–—|:•*\[\]()]+/, '')
      .replace(/[\s\-–—|:[\]()]+$/, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (!title) continue;

    chapters.push({
      id: `ch-${i}-${seconds}`,
      rawTimestamp: formatSecondsToTimestamp(seconds),
      seconds,
      title,
    });
  }

  return chapters;
}

export async function fetchYouTubeTitle(
  rawUrl: string,
  signal?: AbortSignal
): Promise<string | null> {
  const trimmed = rawUrl.trim();
  const normalized =
    /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    normalized
  )}&format=json`;

  try {
    const response = await fetch(endpoint, { signal });
    if (!response.ok) return null;
    const data = (await response.json()) as { title?: unknown };
    if (typeof data.title === 'string' && data.title.trim()) {
      return data.title.trim();
    }
    return null;
  } catch {
    return null;
  }
}
