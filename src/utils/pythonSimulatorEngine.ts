import { DatasetRow, DatasetRowValue, EmbeddedTable } from '../types/academy';

export interface PythonSimulationSuccess {
  ok: true;
  modeLabel: 'Constrained Python & pandas Simulator';
  outputLines: string[];
  resultTable?: {
    columns: string[];
    rows: DatasetRow[];
  };
  scalarResult?: string | number | null;
  warnings: string[];
}

export interface PythonSimulationError {
  ok: false;
  modeLabel: 'Constrained Python & pandas Simulator';
  error: string;
}

export type PythonSimulationResponse =
  | PythonSimulationSuccess
  | PythonSimulationError;

export const PYTHON_SIMULATOR_SCOPE = {
  supported:
    'pd.read_csv(), boolean masks, .str.lower/.strip(), .merge(), .groupby().agg(), .describe(), .value_counts(), np.mean/median/std/percentile, print()',
  unsupported:
    'custom def functions or classes, for/while loops, multi-line expression chaining, matplotlib/seaborn/scikit-learn, and external network or file I/O',
};

type SimFrame = {
  kind: 'dataframe';
  columns: string[];
  rows: DatasetRow[];
};

type SimSeries = {
  kind: 'series';
  name: string;
  values: DatasetRowValue[];
};

type SimValue =
  | SimFrame
  | SimSeries
  | number
  | string
  | boolean
  | null
  | DatasetRowValue[]
  | Record<string, DatasetRowValue>;

function isFrame(v: SimValue | undefined): v is SimFrame {
  return Boolean(v && typeof v === 'object' && !Array.isArray(v) && (v as SimFrame).kind === 'dataframe');
}

function isSeries(v: SimValue | undefined): v is SimSeries {
  return Boolean(v && typeof v === 'object' && !Array.isArray(v) && (v as SimSeries).kind === 'series');
}

function cloneFrame(frame: SimFrame): SimFrame {
  return {
    kind: 'dataframe',
    columns: [...frame.columns],
    rows: frame.rows.map((r) => ({ ...r })),
  };
}

function numericList(vals: DatasetRowValue[]): number[] {
  return vals
    .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function parseLiteralOrVar(
  token: string,
  env: Map<string, SimValue>
): SimValue {
  const t = token.trim();
  if (t === 'None') return null;
  if (t === 'True') return true;
  if (t === 'False') return false;
  if (/^-?\d+(?:\.\d+)?$/.test(t)) return Number(t);
  if (
    (t.startsWith("'") && t.endsWith("'")) ||
    (t.startsWith('"') && t.endsWith('"'))
  ) {
    return t.slice(1, -1);
  }
  if (env.has(t)) return env.get(t)!;

  // Simple list literal [1, 2, 3]
  if (t.startsWith('[') && t.endsWith(']')) {
    const inner = t.slice(1, -1).trim();
    if (!inner) return [];
    return splitTopLevelArgs(inner).map((part) => {
      const v = parseLiteralOrVar(part, env);
      return typeof v === 'string' || typeof v === 'number' || v === null ? v : String(v);
    });
  }

  throw new Error(`Unsupported expression or undefined variable "${t}".`);
}

function splitTopLevelArgs(raw: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let curr = '';
  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i];
    if (quote) {
      curr += ch;
      if (ch === quote && raw[i - 1] !== '\\') quote = null;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      curr += ch;
      continue;
    }
    if (ch === '(' || ch === '[' || ch === '{') depth += 1;
    else if (ch === ')' || ch === ']' || ch === '}') depth -= 1;
    else if (ch === ',' && depth === 0) {
      parts.push(curr.trim());
      curr = '';
      continue;
    }
    curr += ch;
  }
  if (curr.trim()) parts.push(curr.trim());
  return parts;
}

function stripOuterParens(expr: string): string {
  let s = expr.trim();
  while (s.startsWith('(') && s.endsWith(')')) {
    let depth = 0;
    let balanced = true;
    for (let i = 0; i < s.length - 1; i += 1) {
      if (s[i] === '(') depth += 1;
      else if (s[i] === ')') {
        depth -= 1;
        if (depth === 0) {
          balanced = false;
          break;
        }
      }
    }
    if (!balanced) break;
    s = s.slice(1, -1).trim();
  }
  return s;
}

function evalRowCondition(condRaw: string, row: DatasetRow, dfName: string): boolean {
  const cond = stripOuterParens(condRaw);

  // Split top-level & or |
  let depth = 0;
  let quote: string | null = null;
  for (let i = 0; i < cond.length; i += 1) {
    const ch = cond[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"') quote = ch;
    else if (ch === '(' || ch === '[') depth += 1;
    else if (ch === ')' || ch === ']') depth -= 1;
    else if (depth === 0 && (ch === '&' || ch === '|')) {
      const left = evalRowCondition(cond.slice(0, i), row, dfName);
      const right = evalRowCondition(cond.slice(i + 1), row, dfName);
      return ch === '&' ? left && right : left || right;
    }
  }

  // Unary ~
  if (cond.startsWith('~')) {
    return !evalRowCondition(cond.slice(1), row, dfName);
  }

  // df['col'].isna() / notna()
  const nullMatch = cond.match(
    new RegExp(`^${dfName}\\[['"]([a-zA-Z0-9_]+)['"]\\]\\.(isna|isnull|notna|notnull)\\(\\)$`)
  );
  if (nullMatch) {
    const val = row[nullMatch[1]];
    const isNull = val === null || val === undefined || val === '';
    return nullMatch[2] === 'isna' || nullMatch[2] === 'isnull' ? isNull : !isNull;
  }

  // df['col'].isin([...])
  const isinMatch = cond.match(
    new RegExp(`^${dfName}\\[['"]([a-zA-Z0-9_]+)['"]\\]\\.isin\\(\\[(.*)\\]\\)$`)
  );
  if (isinMatch) {
    const val = row[isinMatch[1]];
    const items = splitTopLevelArgs(isinMatch[2]).map((s) =>
      s.replace(/^['"]|['"]$/g, '')
    );
    return val !== null && items.includes(String(val));
  }

  // Comparison df['col'] op literal
  const cmpMatch = cond.match(
    new RegExp(
      `^${dfName}\\[['"]([a-zA-Z0-9_]+)['"]\\](?:\\.str\\.(lower|upper|strip)\\(\\))?\\s*(==|!=|>=|<=|>|<)\\s*(.+)$`
    )
  );
  if (cmpMatch) {
    const [, col, strOp, op, rhsRaw] = cmpMatch;
    let lhs = row[col];
    if (lhs !== null && lhs !== undefined && strOp) {
      const s = String(lhs);
      lhs = strOp === 'lower' ? s.toLowerCase() : strOp === 'upper' ? s.toUpperCase() : s.trim();
    }
    const rhsTrim = rhsRaw.trim();
    const rhs =
      (rhsTrim.startsWith("'") && rhsTrim.endsWith("'")) ||
      (rhsTrim.startsWith('"') && rhsTrim.endsWith('"'))
        ? rhsTrim.slice(1, -1)
        : /^-?\d+(?:\.\d+)?$/.test(rhsTrim)
          ? Number(rhsTrim)
          : rhsTrim;

    if (lhs === null || lhs === undefined) return false;
    switch (op) {
      case '==':
        return lhs === rhs || String(lhs) === String(rhs);
      case '!=':
        return lhs !== rhs && String(lhs) !== String(rhs);
      case '>':
        return Number(lhs) > Number(rhs);
      case '>=':
        return Number(lhs) >= Number(rhs);
      case '<':
        return Number(lhs) < Number(rhs);
      case '<=':
        return Number(lhs) <= Number(rhs);
    }
  }

  throw new Error(`Could not evaluate filter condition "${cond}" in simulator.`);
}

function evalSeriesArithmetic(expr: string, frame: SimFrame, dfName: string): DatasetRowValue[] {
  const cleaned = expr.trim();

  // Check df['col'].str.lower() / upper() / strip()
  const strChain = cleaned.match(
    new RegExp(`^${dfName}\\[['"]([a-zA-Z0-9_]+)['"]\\]((?:\\.str\\.[a-z]+\\(\\))+)$`)
  );
  if (strChain) {
    const [, col, chain] = strChain;
    const ops = Array.from(chain.matchAll(/\.str\.([a-z]+)\(\)/g)).map((m) => m[1]);
    return frame.rows.map((r) => {
      const v = r[col];
      if (v === null || v === undefined) return null;
      let s = String(v);
      for (const op of ops) {
        if (op === 'strip') s = s.trim();
        else if (op === 'lower') s = s.toLowerCase();
        else if (op === 'upper') s = s.toUpperCase();
        else if (op === 'title') {
          s = s.replace(/\b\w/g, (c) => c.toUpperCase());
        }
      }
      return s;
    });
  }

  // Evaluate per-row arithmetic expression containing df['col'] tokens
  const colRefs = new Set<string>();
  const refRegex = new RegExp(`${dfName}\\[['"]([a-zA-Z0-9_]+)['"]\\]`, 'g');
  let m: RegExpExecArray | null;
  while ((m = refRegex.exec(cleaned)) !== null) {
    colRefs.add(m[1]);
  }
  if (colRefs.size === 0) {
    throw new Error(`Unsupported column expression "${cleaned}".`);
  }

  // Support trailing .round(n)
  let roundDecimals: number | null = null;
  let coreExpr = cleaned;
  const roundMatch = coreExpr.match(/^\((.+)\)\.round\((\d+)\)$/);
  if (roundMatch) {
    coreExpr = roundMatch[1];
    roundDecimals = parseInt(roundMatch[2], 10);
  }

  return frame.rows.map((row) => {
    let jsExpr = coreExpr;
    let hasNull = false;
    for (const col of colRefs) {
      const val = row[col];
      if (val === null || val === undefined || typeof val !== 'number') {
        hasNull = true;
      }
      const tokenRegex = new RegExp(`${dfName}\\[['"]${col}['"]\\]`, 'g');
      jsExpr = jsExpr.replace(tokenRegex, String(Number(val ?? 0)));
    }
    if (hasNull) return null;
    if (!/^[0-9+\-*/().\s]+$/.test(jsExpr)) {
      throw new Error(`Unsupported arithmetic in "${cleaned}".`);
    }
    // Safe arithmetic evaluator using Function on strictly validated numeric tokens
    const val = Function(`"use strict"; return (${jsExpr});`)() as number;
    if (!Number.isFinite(val)) return null;
    if (roundDecimals !== null) {
      const f = 10 ** roundDecimals;
      return Math.round(val * f) / f;
    }
    return Math.round(val * 1e6) / 1e6;
  });
}

function evalExpression(
  rawExpr: string,
  env: Map<string, SimValue>,
  tableByName: Map<string, EmbeddedTable>,
  tableByCsv: Map<string, EmbeddedTable>
): SimValue {
  const expr = rawExpr.trim();

  if (expr.endsWith('.copy()')) {
    const inner = evalExpression(expr.slice(0, -'.copy()'.length), env, tableByName, tableByCsv);
    return isFrame(inner) ? cloneFrame(inner) : inner;
  }

  // Chained DataFrame tail methods: .sort_values(...), .head(...), .dropna(...), .drop_duplicates(...)
  const chainedSort = expr.match(/^(.+)\.sort_values\(([^()]*)\)$/);
  if (chainedSort) {
    const inner = evalExpression(chainedSort[1], env, tableByName, tableByCsv);
    if (isFrame(inner)) {
      const args = splitTopLevelArgs(chainedSort[2]);
      const col = (args[0] ?? '').replace(/^['"]|['"]$/g, '').replace(/^by\s*=\s*['"]|['"]$/g, '');
      const ascArg = args.find((a) => a.startsWith('ascending'));
      const ascending = ascArg ? !ascArg.includes('False') : true;
      const sorted = [...inner.rows].sort((a, b) => {
        const va = a[col];
        const vb = b[col];
        if (va === null || va === undefined) return 1;
        if (vb === null || vb === undefined) return -1;
        const cmp =
          typeof va === 'number' && typeof vb === 'number'
            ? va - vb
            : String(va).localeCompare(String(vb));
        return ascending ? cmp : -cmp;
      });
      return { kind: 'dataframe', columns: [...inner.columns], rows: sorted };
    }
  }

  const chainedHead = expr.match(/^(.+)\.head\((\d*)\)$/);
  if (chainedHead) {
    const inner = evalExpression(chainedHead[1], env, tableByName, tableByCsv);
    if (isFrame(inner)) {
      const n = chainedHead[2] ? parseInt(chainedHead[2], 10) : 5;
      return { kind: 'dataframe', columns: [...inner.columns], rows: inner.rows.slice(0, n) };
    }
  }

  const chainedDropna = expr.match(/^(.+)\.dropna\(([^()]*)\)$/);
  if (chainedDropna) {
    const inner = evalExpression(chainedDropna[1], env, tableByName, tableByCsv);
    if (isFrame(inner)) {
      const subsetM = chainedDropna[2].match(/subset\s*=\s*\[(.*?)\]/);
      const cols = subsetM
        ? splitTopLevelArgs(subsetM[1]).map((s) => s.replace(/^['"]|['"]$/g, ''))
        : inner.columns;
      return {
        kind: 'dataframe',
        columns: [...inner.columns],
        rows: inner.rows.filter((r) =>
          cols.every((c) => r[c] !== null && r[c] !== undefined && r[c] !== '')
        ),
      };
    }
  }

  const chainedDedup = expr.match(/^(.+)\.drop_duplicates\(([^()]*)\)$/);
  if (chainedDedup) {
    const inner = evalExpression(chainedDedup[1], env, tableByName, tableByCsv);
    if (isFrame(inner)) {
      const subsetM = chainedDedup[2].match(/subset\s*=\s*\[(.*?)\]/);
      const cols = subsetM
        ? splitTopLevelArgs(subsetM[1]).map((s) => s.replace(/^['"]|['"]$/g, ''))
        : inner.columns;
      const seen = new Set<string>();
      const deduped = inner.rows.filter((r) => {
        const key = JSON.stringify(cols.map((c) => r[c]));
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return { kind: 'dataframe', columns: [...inner.columns], rows: deduped };
    }
  }

  // pd.read_csv('file.csv')
  const readCsv = expr.match(/^pd\.read_csv\(\s*['"]([^'"]+)['"]\s*\)$/);
  if (readCsv) {
    const filename = readCsv[1].split('/').pop() ?? readCsv[1];
    const tbl = tableByCsv.get(filename.toLowerCase()) ?? tableByName.get(filename.replace(/\.csv$/i, '').toLowerCase());
    if (!tbl) {
      throw new Error(`Dataset "${readCsv[1]}" not found in embedded datasets.`);
    }
    return {
      kind: 'dataframe',
      columns: tbl.columns.map((c) => c.name),
      rows: tbl.rows.map((r) => ({ ...r })),
    };
  }

  // pd.merge(left, right, on='key', how='inner')
  const pdMerge = expr.match(/^pd\.merge\((.+)\)$/);
  if (pdMerge) {
    const args = splitTopLevelArgs(pdMerge[1]);
    if (args.length < 2) throw new Error('pd.merge() requires at least 2 DataFrames.');
    const left = evalExpression(args[0], env, tableByName, tableByCsv);
    const right = evalExpression(args[1], env, tableByName, tableByCsv);
    if (!isFrame(left) || !isFrame(right)) throw new Error('pd.merge() arguments must be DataFrames.');
    let onKey = '';
    let how: 'inner' | 'left' = 'inner';
    for (const arg of args.slice(2)) {
      const onM = arg.match(/^on\s*=\s*['"]([^'"]+)['"]$/);
      if (onM) onKey = onM[1];
      const howM = arg.match(/^how\s*=\s*['"]([^'"]+)['"]$/);
      if (howM && (howM[1] === 'left' || howM[1] === 'inner')) how = howM[1];
    }
    if (!onKey) {
      onKey = left.columns.find((c) => right.columns.includes(c)) ?? '';
    }
    if (!onKey) throw new Error('Specify on="key_column" for pd.merge().');
    return performMerge(left, right, onKey, how);
  }

  // Chained or single left.merge(right, on='key', how='inner')
  const dfMerge = expr.match(/^(.+)\.merge\(([^()]*)\)$/);
  if (dfMerge) {
    const left = evalExpression(dfMerge[1], env, tableByName, tableByCsv);
    if (!isFrame(left)) throw new Error(`Left side of .merge() is not a DataFrame.`);
    const args = splitTopLevelArgs(dfMerge[2]);
    const right = evalExpression(args[0], env, tableByName, tableByCsv);
    if (!isFrame(right)) throw new Error('Right argument to .merge() must be a DataFrame.');
    let onKey = '';
    let how: 'inner' | 'left' = 'inner';
    for (const arg of args.slice(1)) {
      const onM = arg.match(/^on\s*=\s*['"]([^'"]+)['"]$/);
      if (onM) onKey = onM[1];
      const howM = arg.match(/^how\s*=\s*['"]([^'"]+)['"]$/);
      if (howM && (howM[1] === 'left' || howM[1] === 'inner')) how = howM[1];
    }
    if (!onKey) onKey = left.columns.find((c) => right.columns.includes(c)) ?? '';
    return performMerge(left, right, onKey, how);
  }

  // df.groupby(...)
  const gbMatch = expr.match(
    /^([a-zA-Z_][a-zA-Z0-9_]*)\.groupby\(\s*(?:\[(.*?)\]|['"]([^'"]+)['"])\s*\)(?:\[['"]([^'"]+)['"]\])?\.(sum|mean|count|nunique|median|min|max)\(\)(?:\.reset_index\(\))?(?:\.round\((\d+)\))?$/
  );
  if (gbMatch) {
    const [, dfName, multiCols, singleCol, targetCol, aggFn, roundDec] = gbMatch;
    const frame = env.get(dfName);
    if (!isFrame(frame)) throw new Error(`"${dfName}" is not a DataFrame.`);
    const groupCols = multiCols
      ? splitTopLevelArgs(multiCols).map((s) => s.replace(/^['"]|['"]$/g, ''))
      : [singleCol];
    return performGroupBy(frame, groupCols, targetCol, aggFn, roundDec ? parseInt(roundDec, 10) : 2);
  }

  // df.groupby(...).agg({...}).reset_index()
  const gbAggMatch = expr.match(
    /^([a-zA-Z_][a-zA-Z0-9_]*)\.groupby\(\s*(?:\[(.*?)\]|['"]([^'"]+)['"])\s*\)\.agg\(\s*\{(.*)\}\s*\)(?:\.reset_index\(\))?$/
  );
  if (gbAggMatch) {
    const [, dfName, multiCols, singleCol, aggSpecRaw] = gbAggMatch;
    const frame = env.get(dfName);
    if (!isFrame(frame)) throw new Error(`"${dfName}" is not a DataFrame.`);
    const groupCols = multiCols
      ? splitTopLevelArgs(multiCols).map((s) => s.replace(/^['"]|['"]$/g, ''))
      : [singleCol];
    const specs: { col: string; fn: string }[] = [];
    for (const part of splitTopLevelArgs(aggSpecRaw)) {
      const kv = part.split(':');
      if (kv.length === 2) {
        specs.push({
          col: kv[0].trim().replace(/^['"]|['"]$/g, ''),
          fn: kv[1].trim().replace(/^['"]|['"]$/g, ''),
        });
      }
    }
    return performMultiAgg(frame, groupCols, specs);
  }

  // df[condition] filtering
  const filterMatch = expr.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\[(.+)\]$/);
  if (filterMatch && env.has(filterMatch[1]) && isFrame(env.get(filterMatch[1]))) {
    const [, dfName, inner] = filterMatch;
    const frame = env.get(dfName) as SimFrame;

    // Column projection df[['a', 'b']]
    if (inner.trim().startsWith('[') && inner.trim().endsWith(']')) {
      const cols = splitTopLevelArgs(inner.trim().slice(1, -1)).map((s) =>
        s.replace(/^['"]|['"]$/g, '')
      );
      return {
        kind: 'dataframe',
        columns: cols,
        rows: frame.rows.map((r) => {
          const out: DatasetRow = {};
          for (const c of cols) out[c] = r[c] ?? null;
          return out;
        }),
      };
    }

    // Single column Series df['col']
    if (
      (inner.trim().startsWith("'") && inner.trim().endsWith("'")) ||
      (inner.trim().startsWith('"') && inner.trim().endsWith('"'))
    ) {
      const col = inner.trim().slice(1, -1);
      if (!frame.columns.includes(col)) {
        throw new Error(`Column "${col}" not found in "${dfName}".`);
      }
      return {
        kind: 'series',
        name: col,
        values: frame.rows.map((r) => r[col] ?? null),
      };
    }

    // Boolean mask filter
    const filtered = frame.rows.filter((row) => evalRowCondition(inner, row, dfName));
    return {
      kind: 'dataframe',
      columns: [...frame.columns],
      rows: filtered.map((r) => ({ ...r })),
    };
  }

  // df.dropna(...) / df.drop_duplicates(...) / df.sort_values(...) / df.head(...) / df.copy()
  const dfMethod = expr.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\.(copy|dropna|drop_duplicates|sort_values|head|isna|shape)\b(.*)$/);
  if (dfMethod && isFrame(env.get(dfMethod[1]))) {
    const frame = env.get(dfMethod[1]) as SimFrame;
    const method = dfMethod[2];
    const tail = dfMethod[3].trim();

    if (method === 'copy') return cloneFrame(frame);
    if (method === 'shape') return `(${frame.rows.length}, ${frame.columns.length})`;
    if (method === 'isna' && tail === '().sum()') {
      const rows = frame.columns.map((c) => ({
        column: c,
        null_count: frame.rows.filter((r) => r[c] === null || r[c] === undefined || r[c] === '').length,
      }));
      return { kind: 'dataframe', columns: ['column', 'null_count'], rows };
    }
    if (method === 'dropna') {
      const subsetM = tail.match(/subset\s*=\s*\[(.*?)\]/);
      const cols = subsetM
        ? splitTopLevelArgs(subsetM[1]).map((s) => s.replace(/^['"]|['"]$/g, ''))
        : frame.columns;
      return {
        kind: 'dataframe',
        columns: [...frame.columns],
        rows: frame.rows.filter((r) => cols.every((c) => r[c] !== null && r[c] !== undefined && r[c] !== '')),
      };
    }
    if (method === 'drop_duplicates') {
      const subsetM = tail.match(/subset\s*=\s*\[(.*?)\]/);
      const cols = subsetM
        ? splitTopLevelArgs(subsetM[1]).map((s) => s.replace(/^['"]|['"]$/g, ''))
        : frame.columns;
      const seen = new Set<string>();
      const deduped = frame.rows.filter((r) => {
        const key = JSON.stringify(cols.map((c) => r[c]));
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return { kind: 'dataframe', columns: [...frame.columns], rows: deduped };
    }
    if (method === 'sort_values') {
      const argsM = tail.match(/^\((.*)\)$/);
      const args = argsM ? splitTopLevelArgs(argsM[1]) : [];
      const col = (args[0] ?? '').replace(/^['"]|['"]$/g, '');
      const ascArg = args.find((a) => a.startsWith('ascending'));
      const ascending = ascArg ? !ascArg.includes('False') : true;
      const sorted = [...frame.rows].sort((a, b) => {
        const va = a[col];
        const vb = b[col];
        if (va === null) return 1;
        if (vb === null) return -1;
        const cmp =
          typeof va === 'number' && typeof vb === 'number'
            ? va - vb
            : String(va).localeCompare(String(vb));
        return ascending ? cmp : -cmp;
      });
      return { kind: 'dataframe', columns: [...frame.columns], rows: sorted };
    }
    if (method === 'head') {
      const nM = tail.match(/^\((\d*)\)$/);
      const n = nM && nM[1] ? parseInt(nM[1], 10) : 5;
      return { kind: 'dataframe', columns: [...frame.columns], rows: frame.rows.slice(0, n) };
    }
  }

  // Series reductions: df['col'].mean() / sum() / median() / std() / count() / nunique() / value_counts() / describe()
  const seriesMethod = expr.match(
    /^([a-zA-Z_][a-zA-Z0-9_]*)\[['"]([a-zA-Z0-9_]+)['"]\]\.(mean|sum|median|std|min|max|count|nunique|value_counts|describe)\(\)(?:\.round\((\d+)\))?$/
  );
  if (seriesMethod && isFrame(env.get(seriesMethod[1]))) {
    const [, dfName, col, fn, roundStr] = seriesMethod;
    const frame = env.get(dfName) as SimFrame;
    if (!frame.columns.includes(col)) throw new Error(`Column "${col}" not found in "${dfName}".`);
    const raw = frame.rows.map((r) => r[col]).filter((v) => v !== null && v !== undefined);
    const nums = numericList(raw).sort((a, b) => a - b);
    const dec = roundStr ? parseInt(roundStr, 10) : 2;
    const roundVal = (n: number) => Math.round(n * 10 ** dec) / 10 ** dec;

    if (fn === 'count') return raw.length;
    if (fn === 'nunique') return new Set(raw.map(String)).size;
    if (fn === 'sum') return roundVal(nums.reduce((a, b) => a + b, 0));
    if (fn === 'mean') return nums.length ? roundVal(nums.reduce((a, b) => a + b, 0) / nums.length) : 0;
    if (fn === 'median') return nums.length ? roundVal(percentile(nums, 50)) : 0;
    if (fn === 'min') return nums.length ? nums[0] : null;
    if (fn === 'max') return nums.length ? nums[nums.length - 1] : null;
    if (fn === 'std') {
      if (nums.length < 2) return 0;
      const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
      const variance = nums.reduce((a, x) => a + (x - mean) ** 2, 0) / (nums.length - 1);
      return roundVal(Math.sqrt(variance));
    }
    if (fn === 'value_counts') {
      const counts = new Map<string, number>();
      raw.forEach((v) => counts.set(String(v), (counts.get(String(v)) ?? 0) + 1));
      const rows = Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([val, count]) => ({ [col]: val, count }));
      return { kind: 'dataframe', columns: [col, 'count'], rows };
    }
    if (fn === 'describe') {
      const mean = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
      const variance =
        nums.length > 1
          ? nums.reduce((a, x) => a + (x - mean) ** 2, 0) / (nums.length - 1)
          : 0;
      return {
        kind: 'dataframe',
        columns: ['stat', col],
        rows: [
          { stat: 'count', [col]: nums.length },
          { stat: 'mean', [col]: roundVal(mean) },
          { stat: 'std', [col]: roundVal(Math.sqrt(variance)) },
          { stat: 'min', [col]: nums[0] ?? null },
          { stat: '25%', [col]: roundVal(percentile(nums, 25)) },
          { stat: '50% (median)', [col]: roundVal(percentile(nums, 50)) },
          { stat: '75%', [col]: roundVal(percentile(nums, 75)) },
          { stat: 'max', [col]: nums[nums.length - 1] ?? null },
        ],
      };
    }
  }

  // NumPy functions: np.mean / np.median / np.std / np.percentile
  const npMatch = expr.match(/^np\.(mean|median|std|sum|min|max|percentile)\((.+)\)$/);
  if (npMatch) {
    const [, fn, argsRaw] = npMatch;
    const args = splitTopLevelArgs(argsRaw);
    const target = evalExpression(args[0], env, tableByName, tableByCsv);
    const rawVals = isSeries(target)
      ? target.values
      : Array.isArray(target)
        ? target
        : [];
    const nums = numericList(rawVals).sort((a, b) => a - b);
    if (nums.length === 0) return 0;
    const round2 = (n: number) => Math.round(n * 100) / 100;
    if (fn === 'mean') return round2(nums.reduce((a, b) => a + b, 0) / nums.length);
    if (fn === 'median') return round2(percentile(nums, 50));
    if (fn === 'sum') return round2(nums.reduce((a, b) => a + b, 0));
    if (fn === 'min') return nums[0];
    if (fn === 'max') return nums[nums.length - 1];
    if (fn === 'std') {
      const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
      return round2(Math.sqrt(nums.reduce((a, x) => a + (x - mean) ** 2, 0) / nums.length));
    }
    if (fn === 'percentile') {
      const q = Number(args[1] ?? 50);
      return round2(percentile(nums, q));
    }
  }

  // len(df) or len(list)
  const lenMatch = expr.match(/^len\((.+)\)$/);
  if (lenMatch) {
    const inner = evalExpression(lenMatch[1], env, tableByName, tableByCsv);
    if (isFrame(inner)) return inner.rows.length;
    if (isSeries(inner)) return inner.values.length;
    if (Array.isArray(inner) || typeof inner === 'string') return inner.length;
  }

  // round(expr, n)
  const roundCall = expr.match(/^round\((.+),\s*(\d+)\)$/);
  if (roundCall) {
    const val = evalExpression(roundCall[1], env, tableByName, tableByCsv);
    const d = parseInt(roundCall[2], 10);
    if (typeof val === 'number') {
      const f = 10 ** d;
      return Math.round(val * f) / f;
    }
  }

  // Arithmetic involving env variables (e.g. a + b, (x - y) / x)
  if (/[+\-*/%]/.test(expr) && !expr.includes("'") && !expr.includes('"')) {
    let replaced = expr;
    for (const [k, v] of env.entries()) {
      if (typeof v === 'number') {
        replaced = replaced.replace(new RegExp(`\\b${k}\\b`, 'g'), String(v));
      }
    }
    if (/^[0-9+\-*/().\s]+$/.test(replaced)) {
      const res = Function(`"use strict"; return (${replaced});`)() as number;
      if (Number.isFinite(res)) return Math.round(res * 1e6) / 1e6;
    }
  }

  return parseLiteralOrVar(expr, env);
}

function performMerge(left: SimFrame, right: SimFrame, onKey: string, how: 'inner' | 'left'): SimFrame {
  const mergedCols = [...left.columns];
  for (const c of right.columns) {
    if (c !== onKey && !mergedCols.includes(c)) mergedCols.push(c);
  }
  const rows: DatasetRow[] = [];
  for (const lr of left.rows) {
    const matches = right.rows.filter((rr) => rr[onKey] === lr[onKey]);
    if (matches.length > 0) {
      for (const rr of matches) {
        const out: DatasetRow = { ...lr };
        for (const c of right.columns) {
          if (c !== onKey) out[c] = rr[c] ?? null;
        }
        rows.push(out);
      }
    } else if (how === 'left') {
      const out: DatasetRow = { ...lr };
      for (const c of right.columns) {
        if (c !== onKey) out[c] = null;
      }
      rows.push(out);
    }
  }
  return { kind: 'dataframe', columns: mergedCols, rows };
}

function computeAggVal(rows: DatasetRow[], col: string | undefined, fn: string, dec = 2): DatasetRowValue {
  if (!col || fn === 'count') {
    if (!col) return rows.length;
    return rows.filter((r) => r[col] !== null && r[col] !== undefined).length;
  }
  const raw = rows.map((r) => r[col]).filter((v) => v !== null && v !== undefined);
  if (fn === 'nunique') return new Set(raw.map(String)).size;
  const nums = numericList(raw).sort((a, b) => a - b);
  if (nums.length === 0) return null;
  const factor = 10 ** dec;
  const r = (n: number) => Math.round(n * factor) / factor;
  if (fn === 'sum') return r(nums.reduce((a, b) => a + b, 0));
  if (fn === 'mean') return r(nums.reduce((a, b) => a + b, 0) / nums.length);
  if (fn === 'median') return r(percentile(nums, 50));
  if (fn === 'min') return nums[0];
  if (fn === 'max') return nums[nums.length - 1];
  return null;
}

function performGroupBy(
  frame: SimFrame,
  groupCols: string[],
  targetCol: string | undefined,
  fn: string,
  dec: number
): SimFrame {
  const buckets = new Map<string, { keys: Record<string, DatasetRowValue>; rows: DatasetRow[] }>();
  for (const r of frame.rows) {
    const keyObj: Record<string, DatasetRowValue> = {};
    for (const g of groupCols) keyObj[g] = r[g] ?? null;
    const key = JSON.stringify(groupCols.map((g) => keyObj[g]));
    const existing = buckets.get(key);
    if (existing) existing.rows.push(r);
    else buckets.set(key, { keys: keyObj, rows: [r] });
  }
  const metricCol = targetCol ? `${targetCol}_${fn}` : fn;
  const outRows: DatasetRow[] = Array.from(buckets.values()).map((b) => ({
    ...b.keys,
    [metricCol]: computeAggVal(b.rows, targetCol, fn, dec),
  }));
  return {
    kind: 'dataframe',
    columns: [...groupCols, metricCol],
    rows: outRows,
  };
}

function performMultiAgg(
  frame: SimFrame,
  groupCols: string[],
  specs: { col: string; fn: string }[]
): SimFrame {
  const buckets = new Map<string, { keys: Record<string, DatasetRowValue>; rows: DatasetRow[] }>();
  for (const r of frame.rows) {
    const keyObj: Record<string, DatasetRowValue> = {};
    for (const g of groupCols) keyObj[g] = r[g] ?? null;
    const key = JSON.stringify(groupCols.map((g) => keyObj[g]));
    const existing = buckets.get(key);
    if (existing) existing.rows.push(r);
    else buckets.set(key, { keys: keyObj, rows: [r] });
  }
  const colCounts = new Map<string, number>();
  specs.forEach((s) => colCounts.set(s.col, (colCounts.get(s.col) ?? 0) + 1));
  const outName = (s: { col: string; fn: string }) =>
    (colCounts.get(s.col) ?? 0) > 1 ? `${s.col}_${s.fn}` : s.col;

  const metricCols = specs.map(outName);
  const outRows: DatasetRow[] = Array.from(buckets.values()).map((b) => {
    const out: DatasetRow = { ...b.keys };
    specs.forEach((s) => {
      out[outName(s)] = computeAggVal(b.rows, s.col, s.fn, 2);
    });
    return out;
  });
  return {
    kind: 'dataframe',
    columns: [...groupCols, ...metricCols],
    rows: outRows,
  };
}

export function simulatePythonCode(
  code: string,
  availableTables: EmbeddedTable[]
): PythonSimulationResponse {
  const modeLabel = 'Constrained Python & pandas Simulator' as const;
  try {
    const lines = code.split(/\r?\n/);
    const tableByName = new Map<string, EmbeddedTable>();
    const tableByCsv = new Map<string, EmbeddedTable>();
    const env = new Map<string, SimValue>();

    for (const tbl of availableTables) {
      tableByName.set(tbl.name.toLowerCase(), tbl);
      tableByCsv.set(tbl.csvFilename.toLowerCase(), tbl);
      env.set(tbl.name, {
        kind: 'dataframe',
        columns: tbl.columns.map((c) => c.name),
        rows: tbl.rows.map((r) => ({ ...r })),
      });
    }

    // Convenience aliases matching the domain tables
    if (tableByName.has('operations_shipments')) env.set('shipments', env.get('operations_shipments')!);
    if (tableByName.has('warehouse_hubs')) env.set('hubs', env.get('warehouse_hubs')!);
    if (tableByName.has('retail_orders')) env.set('orders', env.get('retail_orders')!);
    if (tableByName.has('retail_customers')) env.set('customers', env.get('retail_customers')!);
    if (tableByName.has('retail_products')) env.set('products', env.get('retail_products')!);
    if (tableByName.has('credit_card_transactions')) env.set('txns', env.get('credit_card_transactions')!);
    if (tableByName.has('cardholder_accounts')) env.set('accounts', env.get('cardholder_accounts')!);
    if (tableByName.has('hr_employees')) env.set('employees', env.get('hr_employees')!);
    if (tableByName.has('hr_department_budgets')) env.set('budgets', env.get('hr_department_budgets')!);

    const outputLines: string[] = [];
    const warnings: string[] = [];
    let lastTable: { columns: string[]; rows: DatasetRow[] } | undefined;
    let lastScalar: string | number | null | undefined;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      if (/^(import|from)\s+/.test(line)) continue;

      // print(...)
      const printMatch = line.match(/^print\((.+)\)$/);
      if (printMatch) {
        const args = splitTopLevelArgs(printMatch[1]);
        const rendered = args.map((a) => {
          const val = evalExpression(a, env, tableByName, tableByCsv);
          if (isFrame(val)) {
            lastTable = { columns: val.columns, rows: val.rows };
            return `[DataFrame ${val.rows.length} rows × ${val.columns.length} cols]`;
          }
          if (isSeries(val)) {
            return `[Series ${val.name} (${val.values.length})]`;
          }
          if (Array.isArray(val)) return JSON.stringify(val);
          return String(val);
        });
        outputLines.push(rendered.join(' '));
        continue;
      }

      // Column assignment: df['new_col'] = ...
      const colAssign = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\[['"]([a-zA-Z0-9_]+)['"]\]\s*=\s*(.+)$/);
      if (colAssign) {
        const [, dfName, newCol, rhs] = colAssign;
        const frame = env.get(dfName);
        if (!isFrame(frame)) throw new Error(`"${dfName}" is not a DataFrame.`);
        const values = evalSeriesArithmetic(rhs, frame, dfName);
        if (!frame.columns.includes(newCol)) frame.columns.push(newCol);
        frame.rows.forEach((row, idx) => {
          row[newCol] = values[idx] ?? null;
        });
        lastTable = { columns: frame.columns, rows: frame.rows };
        continue;
      }

      // Variable assignment: var = expr
      const varAssign = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
      if (varAssign) {
        const [, varName, rhs] = varAssign;
        const val = evalExpression(rhs, env, tableByName, tableByCsv);
        env.set(varName, val);
        if (isFrame(val)) {
          lastTable = { columns: val.columns, rows: val.rows };
        } else if (typeof val === 'number' || typeof val === 'string' || val === null) {
          lastScalar = val;
        }
        continue;
      }

      // Bare expression (notebook cell final line)
      const val = evalExpression(line, env, tableByName, tableByCsv);
      if (isFrame(val)) {
        lastTable = { columns: val.columns, rows: val.rows };
      } else if (isSeries(val)) {
        lastTable = {
          columns: [val.name],
          rows: val.values.map((v) => ({ [val.name]: v })),
        };
      } else if (Array.isArray(val)) {
        outputLines.push(JSON.stringify(val));
      } else {
        lastScalar = val as string | number | null;
        outputLines.push(String(val));
      }
    }

    if (!lastTable && outputLines.length === 0 && lastScalar === undefined) {
      warnings.push('No output expression evaluated. End your script with a DataFrame variable name or print(...) statement.');
    }

    return {
      ok: true,
      modeLabel,
      outputLines,
      resultTable: lastTable,
      scalarResult: lastScalar,
      warnings,
    };
  } catch (err) {
    return {
      ok: false,
      modeLabel,
      error: err instanceof Error ? err.message : 'Unable to simulate Python expression.',
    };
  }
}
