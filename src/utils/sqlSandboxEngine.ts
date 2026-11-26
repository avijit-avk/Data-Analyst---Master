import { DatasetRow, DatasetRowValue, EmbeddedTable } from '../types/academy';

export interface SqlQueryResult {
  ok: true;
  columns: string[];
  rows: DatasetRow[];
  executionMs: number;
}

export interface SqlQueryError {
  ok: false;
  error: string;
}

export type SqlExecutionResponse = SqlQueryResult | SqlQueryError;

type TokenType =
  | 'keyword'
  | 'ident'
  | 'number'
  | 'string'
  | 'operator'
  | 'paren'
  | 'comma'
  | 'dot'
  | 'star'
  | 'semicolon'
  | 'eof';

interface Token {
  type: TokenType;
  value: string;
  upper: string;
}

const KEYWORDS = new Set([
  'WITH',
  'AS',
  'SELECT',
  'DISTINCT',
  'FROM',
  'INNER',
  'LEFT',
  'OUTER',
  'JOIN',
  'ON',
  'WHERE',
  'GROUP',
  'BY',
  'HAVING',
  'ORDER',
  'ASC',
  'DESC',
  'LIMIT',
  'AND',
  'OR',
  'NOT',
  'IN',
  'IS',
  'NULL',
  'LIKE',
  'ILIKE',
  'BETWEEN',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
  'OVER',
  'PARTITION',
  'TRUE',
  'FALSE',
  'CAST',
]);

function tokenize(sql: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const len = sql.length;

  while (i < len) {
    const ch = sql[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }

    // Single-line comment
    if (ch === '-' && sql[i + 1] === '-') {
      i += 2;
      while (i < len && sql[i] !== '\n') i += 1;
      continue;
    }

    // Block comment
    if (ch === '/' && sql[i + 1] === '*') {
      i += 2;
      while (i < len && !(sql[i] === '*' && sql[i + 1] === '/')) i += 1;
      i += 2;
      continue;
    }

    // Single-quoted string
    if (ch === "'") {
      i += 1;
      let str = '';
      while (i < len) {
        if (sql[i] === "'" && sql[i + 1] === "'") {
          str += "'";
          i += 2;
        } else if (sql[i] === "'") {
          i += 1;
          break;
        } else {
          str += sql[i];
          i += 1;
        }
      }
      tokens.push({ type: 'string', value: str, upper: str });
      continue;
    }

    // Double-quoted identifier
    if (ch === '"') {
      i += 1;
      let ident = '';
      while (i < len && sql[i] !== '"') {
        ident += sql[i];
        i += 1;
      }
      i += 1;
      tokens.push({ type: 'ident', value: ident, upper: ident.toUpperCase() });
      continue;
    }

    // Number
    if (/[0-9]/.test(ch)) {
      let num = '';
      while (i < len && /[0-9.]/.test(sql[i])) {
        num += sql[i];
        i += 1;
      }
      tokens.push({ type: 'number', value: num, upper: num });
      continue;
    }

    // Multi-char operators
    const two = sql.slice(i, i + 2);
    if (['<=', '>=', '<>', '!=', '||'].includes(two)) {
      tokens.push({ type: 'operator', value: two, upper: two });
      i += 2;
      continue;
    }

    if (['=', '<', '>', '+', '-', '/', '%'].includes(ch)) {
      tokens.push({ type: 'operator', value: ch, upper: ch });
      i += 1;
      continue;
    }

    if (ch === '(' || ch === ')') {
      tokens.push({ type: 'paren', value: ch, upper: ch });
      i += 1;
      continue;
    }

    if (ch === ',') {
      tokens.push({ type: 'comma', value: ch, upper: ch });
      i += 1;
      continue;
    }

    if (ch === '.') {
      tokens.push({ type: 'dot', value: ch, upper: ch });
      i += 1;
      continue;
    }

    if (ch === '*') {
      tokens.push({ type: 'star', value: ch, upper: ch });
      i += 1;
      continue;
    }

    if (ch === ';') {
      tokens.push({ type: 'semicolon', value: ch, upper: ch });
      i += 1;
      continue;
    }

    if (/[a-zA-Z_]/.test(ch)) {
      let word = '';
      while (i < len && /[a-zA-Z0-9_]/.test(sql[i])) {
        word += sql[i];
        i += 1;
      }
      const upper = word.toUpperCase();
      tokens.push({
        type: KEYWORDS.has(upper) ? 'keyword' : 'ident',
        value: word,
        upper,
      });
      continue;
    }

    throw new Error(`Unexpected character "${ch}" in SQL query.`);
  }

  tokens.push({ type: 'eof', value: '', upper: '' });
  return tokens;
}

// AST Nodes
type ExprNode =
  | { kind: 'literal'; value: DatasetRowValue }
  | { kind: 'column'; table?: string; name: string }
  | { kind: 'star'; table?: string }
  | { kind: 'unary'; op: '-' | 'NOT'; arg: ExprNode }
  | { kind: 'binary'; op: string; left: ExprNode; right: ExprNode }
  | { kind: 'isNull'; expr: ExprNode; negated: boolean }
  | { kind: 'inList'; expr: ExprNode; list: ExprNode[]; negated: boolean }
  | { kind: 'between'; expr: ExprNode; low: ExprNode; high: ExprNode; negated: boolean }
  | { kind: 'like'; expr: ExprNode; pattern: ExprNode; negated: boolean; caseInsensitive: boolean }
  | {
      kind: 'case';
      operand?: ExprNode;
      branches: { when: ExprNode; then: ExprNode }[];
      elseExpr?: ExprNode;
    }
  | {
      kind: 'call';
      name: string;
      args: ExprNode[];
      distinct?: boolean;
      over?: {
        partitionBy: ExprNode[];
        orderBy: { expr: ExprNode; dir: 'ASC' | 'DESC' }[];
      };
    };

interface SelectItem {
  expr: ExprNode;
  alias?: string;
}

interface JoinClause {
  type: 'INNER' | 'LEFT';
  table: string;
  alias: string;
  on: ExprNode;
}

interface SelectQuery {
  distinct: boolean;
  items: SelectItem[];
  fromTable: string;
  fromAlias: string;
  joins: JoinClause[];
  where?: ExprNode;
  groupBy: ExprNode[];
  having?: ExprNode;
  orderBy: { expr: ExprNode; dir: 'ASC' | 'DESC' }[];
  limit?: number;
}

class Parser {
  private pos = 0;

  constructor(private readonly tokens: Token[]) {}

  private peek(offset = 0): Token {
    return this.tokens[this.pos + offset] ?? this.tokens[this.tokens.length - 1];
  }

  private consume(): Token {
    const tok = this.peek();
    this.pos += 1;
    return tok;
  }

  private matchKeyword(kw: string): boolean {
    const t = this.peek();
    if ((t.type === 'keyword' || t.type === 'ident') && t.upper === kw) {
      this.pos += 1;
      return true;
    }
    return false;
  }

  private isKeyword(kw: string, offset = 0): boolean {
    const t = this.peek(offset);
    return (t.type === 'keyword' || t.type === 'ident') && t.upper === kw;
  }

  private expectKeyword(kw: string): void {
    if (!this.matchKeyword(kw)) {
      throw new Error(`Expected "${kw}" near "${this.peek().value || 'end of query'}".`);
    }
  }

  private expectParen(val: '(' | ')'): void {
    const t = this.peek();
    if (t.type !== 'paren' || t.value !== val) {
      throw new Error(`Expected "${val}" near "${t.value || 'end of query'}".`);
    }
    this.consume();
  }

  private parseIdentName(): string {
    const t = this.peek();
    if (t.type === 'ident' || t.type === 'keyword') {
      this.consume();
      return t.value;
    }
    throw new Error(`Expected identifier near "${t.value || 'end of query'}".`);
  }

  parseStatement(): { ctes: { name: string; query: SelectQuery }[]; main: SelectQuery } {
    const ctes: { name: string; query: SelectQuery }[] = [];

    if (this.matchKeyword('WITH')) {
      while (true) {
        const name = this.parseIdentName();
        this.expectKeyword('AS');
        this.expectParen('(');
        const query = this.parseSelect();
        this.expectParen(')');
        ctes.push({ name, query });
        if (this.peek().type === 'comma') {
          this.consume();
        } else {
          break;
        }
      }
    }

    const main = this.parseSelect();
    while (this.peek().type === 'semicolon') this.consume();
    if (this.peek().type !== 'eof') {
      throw new Error(`Unexpected trailing token "${this.peek().value}". Only single SELECT queries are supported.`);
    }

    return { ctes, main };
  }

  private parseSelect(): SelectQuery {
    this.expectKeyword('SELECT');
    const distinct = this.matchKeyword('DISTINCT');

    const items: SelectItem[] = [];
    while (true) {
      const expr = this.parseExpr();
      let alias: string | undefined;
      if (this.matchKeyword('AS')) {
        alias = this.parseIdentName();
      } else if (
        this.peek().type === 'ident' &&
        !this.isKeyword('FROM') &&
        !this.isKeyword('WHERE')
      ) {
        alias = this.consume().value;
      }
      items.push({ expr, alias });
      if (this.peek().type === 'comma') {
        this.consume();
      } else {
        break;
      }
    }

    this.expectKeyword('FROM');
    const fromTable = this.parseIdentName();
    let fromAlias = fromTable;
    if (this.matchKeyword('AS')) {
      fromAlias = this.parseIdentName();
    } else if (
      this.peek().type === 'ident' &&
      !this.isKeyword('JOIN') &&
      !this.isKeyword('INNER') &&
      !this.isKeyword('LEFT') &&
      !this.isKeyword('WHERE') &&
      !this.isKeyword('GROUP') &&
      !this.isKeyword('ORDER') &&
      !this.isKeyword('LIMIT')
    ) {
      fromAlias = this.consume().value;
    }

    const joins: JoinClause[] = [];
    while (
      this.isKeyword('INNER') ||
      this.isKeyword('LEFT') ||
      this.isKeyword('JOIN')
    ) {
      let joinType: 'INNER' | 'LEFT' = 'INNER';
      if (this.matchKeyword('LEFT')) {
        joinType = 'LEFT';
        this.matchKeyword('OUTER');
      } else {
        this.matchKeyword('INNER');
      }
      this.expectKeyword('JOIN');
      const table = this.parseIdentName();
      let alias = table;
      if (this.matchKeyword('AS')) {
        alias = this.parseIdentName();
      } else if (
        this.peek().type === 'ident' &&
        !this.isKeyword('ON')
      ) {
        alias = this.consume().value;
      }
      this.expectKeyword('ON');
      const on = this.parseExpr();
      joins.push({ type: joinType, table, alias, on });
    }

    let where: ExprNode | undefined;
    if (this.matchKeyword('WHERE')) {
      where = this.parseExpr();
    }

    const groupBy: ExprNode[] = [];
    if (this.matchKeyword('GROUP')) {
      this.expectKeyword('BY');
      while (true) {
        groupBy.push(this.parseExpr());
        if (this.peek().type === 'comma') {
          this.consume();
        } else {
          break;
        }
      }
    }

    let having: ExprNode | undefined;
    if (this.matchKeyword('HAVING')) {
      having = this.parseExpr();
    }

    const orderBy: { expr: ExprNode; dir: 'ASC' | 'DESC' }[] = [];
    if (this.matchKeyword('ORDER')) {
      this.expectKeyword('BY');
      while (true) {
        const expr = this.parseExpr();
        let dir: 'ASC' | 'DESC' = 'ASC';
        if (this.matchKeyword('DESC')) {
          dir = 'DESC';
        } else {
          this.matchKeyword('ASC');
        }
        orderBy.push({ expr, dir });
        if (this.peek().type === 'comma') {
          this.consume();
        } else {
          break;
        }
      }
    }

    let limit: number | undefined;
    if (this.matchKeyword('LIMIT')) {
      const tok = this.consume();
      if (tok.type !== 'number') {
        throw new Error(`Expected integer after LIMIT, got "${tok.value}".`);
      }
      limit = Math.max(0, parseInt(tok.value, 10));
    }

    return {
      distinct,
      items,
      fromTable,
      fromAlias,
      joins,
      where,
      groupBy,
      having,
      orderBy,
      limit,
    };
  }

  private parseExpr(): ExprNode {
    return this.parseOr();
  }

  private parseOr(): ExprNode {
    let left = this.parseAnd();
    while (this.matchKeyword('OR')) {
      const right = this.parseAnd();
      left = { kind: 'binary', op: 'OR', left, right };
    }
    return left;
  }

  private parseAnd(): ExprNode {
    let left = this.parseNot();
    while (this.matchKeyword('AND')) {
      const right = this.parseNot();
      left = { kind: 'binary', op: 'AND', left, right };
    }
    return left;
  }

  private parseNot(): ExprNode {
    if (this.matchKeyword('NOT')) {
      return { kind: 'unary', op: 'NOT', arg: this.parseNot() };
    }
    return this.parseComparison();
  }

  private parseComparison(): ExprNode {
    let left = this.parseAdditive();

    // IS [NOT] NULL
    if (this.matchKeyword('IS')) {
      const negated = this.matchKeyword('NOT');
      this.expectKeyword('NULL');
      return { kind: 'isNull', expr: left, negated };
    }

    // [NOT] IN / BETWEEN / LIKE / ILIKE
    let negated = false;
    if (this.isKeyword('NOT') && (this.isKeyword('IN', 1) || this.isKeyword('BETWEEN', 1) || this.isKeyword('LIKE', 1) || this.isKeyword('ILIKE', 1))) {
      this.consume();
      negated = true;
    }

    if (this.matchKeyword('IN')) {
      this.expectParen('(');
      const list: ExprNode[] = [];
      while (true) {
        list.push(this.parseExpr());
        if (this.peek().type === 'comma') {
          this.consume();
        } else {
          break;
        }
      }
      this.expectParen(')');
      return { kind: 'inList', expr: left, list, negated };
    }

    if (this.matchKeyword('BETWEEN')) {
      const low = this.parseAdditive();
      this.expectKeyword('AND');
      const high = this.parseAdditive();
      return { kind: 'between', expr: left, low, high, negated };
    }

    if (this.matchKeyword('LIKE')) {
      const pattern = this.parseAdditive();
      return { kind: 'like', expr: left, pattern, negated, caseInsensitive: false };
    }

    if (this.matchKeyword('ILIKE')) {
      const pattern = this.parseAdditive();
      return { kind: 'like', expr: left, pattern, negated, caseInsensitive: true };
    }

    const opTok = this.peek();
    if (
      opTok.type === 'operator' &&
      ['=', '!=', '<>', '<', '<=', '>', '>='].includes(opTok.value)
    ) {
      this.consume();
      const right = this.parseAdditive();
      left = { kind: 'binary', op: opTok.value, left, right };
    }

    return left;
  }

  private parseAdditive(): ExprNode {
    let left = this.parseMultiplicative();
    while (
      this.peek().type === 'operator' &&
      ['+', '-', '||'].includes(this.peek().value)
    ) {
      const op = this.consume().value;
      const right = this.parseMultiplicative();
      left = { kind: 'binary', op, left, right };
    }
    return left;
  }

  private parseMultiplicative(): ExprNode {
    let left = this.parseUnary();
    while (
      (this.peek().type === 'operator' && ['/', '%'].includes(this.peek().value)) ||
      this.peek().type === 'star'
    ) {
      const op = this.consume().value;
      const right = this.parseUnary();
      left = { kind: 'binary', op, left, right };
    }
    return left;
  }

  private parseUnary(): ExprNode {
    if (this.peek().type === 'operator' && this.peek().value === '-') {
      this.consume();
      return { kind: 'unary', op: '-', arg: this.parseUnary() };
    }
    if (this.peek().type === 'operator' && this.peek().value === '+') {
      this.consume();
      return this.parseUnary();
    }
    return this.parsePrimary();
  }

  private parsePrimary(): ExprNode {
    const tok = this.peek();

    if (tok.type === 'star') {
      this.consume();
      return { kind: 'star' };
    }

    if (tok.type === 'number') {
      this.consume();
      return { kind: 'literal', value: Number(tok.value) };
    }

    if (tok.type === 'string') {
      this.consume();
      return { kind: 'literal', value: tok.value };
    }

    if (this.matchKeyword('NULL')) {
      return { kind: 'literal', value: null };
    }

    if (this.matchKeyword('TRUE')) {
      return { kind: 'literal', value: 1 };
    }

    if (this.matchKeyword('FALSE')) {
      return { kind: 'literal', value: 0 };
    }

    if (this.matchKeyword('CASE')) {
      let operand: ExprNode | undefined;
      if (!this.isKeyword('WHEN')) {
        operand = this.parseExpr();
      }
      const branches: { when: ExprNode; then: ExprNode }[] = [];
      while (this.matchKeyword('WHEN')) {
        const when = this.parseExpr();
        this.expectKeyword('THEN');
        const then = this.parseExpr();
        branches.push({ when, then });
      }
      let elseExpr: ExprNode | undefined;
      if (this.matchKeyword('ELSE')) {
        elseExpr = this.parseExpr();
      }
      this.expectKeyword('END');
      return { kind: 'case', operand, branches, elseExpr };
    }

    if (tok.type === 'paren' && tok.value === '(') {
      this.consume();
      const expr = this.parseExpr();
      this.expectParen(')');
      return expr;
    }

    if (tok.type === 'ident' || tok.type === 'keyword') {
      const name = this.consume().value;

      // Function call
      if (this.peek().type === 'paren' && this.peek().value === '(') {
        this.consume();
        const fnUpper = name.toUpperCase();
        if (fnUpper === 'CAST') {
          const inner = this.parseExpr();
          this.expectKeyword('AS');
          const targetType = this.parseIdentName();
          this.expectParen(')');
          return {
            kind: 'call',
            name: 'CAST',
            args: [inner, { kind: 'literal', value: targetType.toUpperCase() }],
          };
        }

        const distinct = this.matchKeyword('DISTINCT');
        const args: ExprNode[] = [];
        if (!(this.peek().type === 'paren' && this.peek().value === ')')) {
          while (true) {
            args.push(this.parseExpr());
            if (this.peek().type === 'comma') {
              this.consume();
            } else {
              break;
            }
          }
        }
        this.expectParen(')');

        let over:
          | {
              partitionBy: ExprNode[];
              orderBy: { expr: ExprNode; dir: 'ASC' | 'DESC' }[];
            }
          | undefined;

        if (this.matchKeyword('OVER')) {
          this.expectParen('(');
          const partitionBy: ExprNode[] = [];
          const orderBy: { expr: ExprNode; dir: 'ASC' | 'DESC' }[] = [];

          if (this.matchKeyword('PARTITION')) {
            this.expectKeyword('BY');
            while (true) {
              partitionBy.push(this.parseExpr());
              if (this.peek().type === 'comma') {
                this.consume();
              } else {
                break;
              }
            }
          }

          if (this.matchKeyword('ORDER')) {
            this.expectKeyword('BY');
            while (true) {
              const expr = this.parseExpr();
              let dir: 'ASC' | 'DESC' = 'ASC';
              if (this.matchKeyword('DESC')) {
                dir = 'DESC';
              } else {
                this.matchKeyword('ASC');
              }
              orderBy.push({ expr, dir });
              if (this.peek().type === 'comma') {
                this.consume();
              } else {
                break;
              }
            }
          }

          this.expectParen(')');
          over = { partitionBy, orderBy };
        }

        return { kind: 'call', name: fnUpper, args, distinct, over };
      }

      // table.col or table.*
      if (this.peek().type === 'dot') {
        this.consume();
        if (this.peek().type === 'star') {
          this.consume();
          return { kind: 'star', table: name };
        }
        const colName = this.parseIdentName();
        return { kind: 'column', table: name, name: colName };
      }

      return { kind: 'column', name };
    }

    throw new Error(`Unexpected token "${tok.value || tok.type}" in expression.`);
  }
}

type ScopedRow = {
  // Exact alias-qualified lookup: alias.col -> value
  qualified: Record<string, DatasetRowValue>;
  // Table aliases in order for SELECT alias.* expansion
  aliasColumns: Record<string, string[]>;
  // Computed alias values (for ORDER BY / post-projection)
  computed?: Record<string, DatasetRowValue>;
};

const AGGREGATE_FUNCS = new Set(['COUNT', 'SUM', 'AVG', 'MIN', 'MAX']);
const WINDOW_FUNCS = new Set([
  'ROW_NUMBER',
  'RANK',
  'DENSE_RANK',
  'COUNT',
  'SUM',
  'AVG',
  'MIN',
  'MAX',
]);

function hasAggregate(expr: ExprNode): boolean {
  switch (expr.kind) {
    case 'call':
      if (expr.over) return false;
      if (AGGREGATE_FUNCS.has(expr.name)) return true;
      return expr.args.some(hasAggregate);
    case 'unary':
      return hasAggregate(expr.arg);
    case 'binary':
      return hasAggregate(expr.left) || hasAggregate(expr.right);
    case 'isNull':
      return hasAggregate(expr.expr);
    case 'inList':
      return hasAggregate(expr.expr) || expr.list.some(hasAggregate);
    case 'between':
      return hasAggregate(expr.expr) || hasAggregate(expr.low) || hasAggregate(expr.high);
    case 'like':
      return hasAggregate(expr.expr) || hasAggregate(expr.pattern);
    case 'case':
      return (
        Boolean(expr.operand && hasAggregate(expr.operand)) ||
        expr.branches.some((b) => hasAggregate(b.when) || hasAggregate(b.then)) ||
        Boolean(expr.elseExpr && hasAggregate(expr.elseExpr))
      );
    default:
      return false;
  }
}

function collectWindowCalls(expr: ExprNode, out: Extract<ExprNode, { kind: 'call' }>[]): void {
  switch (expr.kind) {
    case 'call':
      if (expr.over) out.push(expr);
      expr.args.forEach((a) => collectWindowCalls(a, out));
      break;
    case 'unary':
      collectWindowCalls(expr.arg, out);
      break;
    case 'binary':
      collectWindowCalls(expr.left, out);
      collectWindowCalls(expr.right, out);
      break;
    case 'isNull':
      collectWindowCalls(expr.expr, out);
      break;
    case 'inList':
      collectWindowCalls(expr.expr, out);
      expr.list.forEach((a) => collectWindowCalls(a, out));
      break;
    case 'between':
      collectWindowCalls(expr.expr, out);
      collectWindowCalls(expr.low, out);
      collectWindowCalls(expr.high, out);
      break;
    case 'like':
      collectWindowCalls(expr.expr, out);
      collectWindowCalls(expr.pattern, out);
      break;
    case 'case':
      if (expr.operand) collectWindowCalls(expr.operand, out);
      expr.branches.forEach((b) => {
        collectWindowCalls(b.when, out);
        collectWindowCalls(b.then, out);
      });
      if (expr.elseExpr) collectWindowCalls(expr.elseExpr, out);
      break;
    default:
      break;
  }
}

function compareValues(a: DatasetRowValue, b: DatasetRowValue): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  return String(a).localeCompare(String(b));
}

function isTruthy(v: DatasetRowValue): boolean {
  if (v === null || v === undefined || v === 0 || v === '') return false;
  return true;
}

function likeToRegex(pattern: string, caseInsensitive: boolean): RegExp {
  let regexStr = '^';
  for (let i = 0; i < pattern.length; i += 1) {
    const ch = pattern[i];
    if (ch === '%') regexStr += '.*';
    else if (ch === '_') regexStr += '.';
    else regexStr += ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  regexStr += '$';
  return new RegExp(regexStr, caseInsensitive ? 'i' : '');
}

function resolveColumn(row: ScopedRow, table: string | undefined, name: string): DatasetRowValue {
  const nameLower = name.toLowerCase();
  if (table) {
    const prefix = `${table.toLowerCase()}.`;
    for (const [k, v] of Object.entries(row.qualified)) {
      if (k.toLowerCase() === `${prefix}${nameLower}`) return v;
    }
    throw new Error(`Unknown column "${table}.${name}".`);
  }

  if (row.computed) {
    for (const [k, v] of Object.entries(row.computed)) {
      if (k.toLowerCase() === nameLower) return v;
    }
  }

  const matches: DatasetRowValue[] = [];
  for (const [k, v] of Object.entries(row.qualified)) {
    const dotIdx = k.indexOf('.');
    const colPart = dotIdx >= 0 ? k.slice(dotIdx + 1) : k;
    if (colPart.toLowerCase() === nameLower) {
      matches.push(v);
    }
  }

  if (matches.length === 1) return matches[0];
  if (matches.length > 1) {
    throw new Error(`Column "${name}" is ambiguous across joined tables. Qualify it with a table alias.`);
  }
  throw new Error(`Unknown column "${name}".`);
}

function evalScalar(
  expr: ExprNode,
  row: ScopedRow,
  groupRows?: ScopedRow[],
  windowMap?: WeakMap<object, DatasetRowValue>
): DatasetRowValue {
  if (expr.kind === 'call' && expr.over) {
    if (!windowMap || !windowMap.has(expr)) {
      throw new Error(`Window function "${expr.name}" could not be resolved in this context.`);
    }
    return windowMap.get(expr) ?? null;
  }

  if (expr.kind === 'call' && AGGREGATE_FUNCS.has(expr.name)) {
    const rows = groupRows ?? [row];
    return evalAggregate(expr.name, expr.args, Boolean(expr.distinct), rows);
  }

  switch (expr.kind) {
    case 'literal':
      return expr.value;
    case 'column':
      return resolveColumn(row, expr.table, expr.name);
    case 'star':
      return '*';
    case 'unary': {
      const val = evalScalar(expr.arg, row, groupRows, windowMap);
      if (expr.op === 'NOT') return isTruthy(val) ? 0 : 1;
      if (val === null) return null;
      return -Number(val);
    }
    case 'binary': {
      if (expr.op === 'AND') {
        const l = evalScalar(expr.left, row, groupRows, windowMap);
        if (!isTruthy(l)) return 0;
        const r = evalScalar(expr.right, row, groupRows, windowMap);
        return isTruthy(r) ? 1 : 0;
      }
      if (expr.op === 'OR') {
        const l = evalScalar(expr.left, row, groupRows, windowMap);
        if (isTruthy(l)) return 1;
        const r = evalScalar(expr.right, row, groupRows, windowMap);
        return isTruthy(r) ? 1 : 0;
      }

      const l = evalScalar(expr.left, row, groupRows, windowMap);
      const r = evalScalar(expr.right, row, groupRows, windowMap);

      if (expr.op === '||') {
        if (l === null || r === null) return null;
        return `${l}${r}`;
      }

      if (l === null || r === null) {
        return ['=', '!=', '<>', '<', '<=', '>', '>='].includes(expr.op) ? 0 : null;
      }

      switch (expr.op) {
        case '+':
          return Number(l) + Number(r);
        case '-':
          return Number(l) - Number(r);
        case '*':
          return Number(l) * Number(r);
        case '/':
          return Number(r) === 0 ? null : Number(l) / Number(r);
        case '%':
          return Number(r) === 0 ? null : Number(l) % Number(r);
        case '=':
          return l === r || (typeof l === 'string' && typeof r === 'string' && l === r) ? 1 : 0;
        case '!=':
        case '<>':
          return l !== r ? 1 : 0;
        case '<':
          return compareValues(l, r) < 0 ? 1 : 0;
        case '<=':
          return compareValues(l, r) <= 0 ? 1 : 0;
        case '>':
          return compareValues(l, r) > 0 ? 1 : 0;
        case '>=':
          return compareValues(l, r) >= 0 ? 1 : 0;
        default:
          throw new Error(`Unsupported operator "${expr.op}".`);
      }
    }
    case 'isNull': {
      const val = evalScalar(expr.expr, row, groupRows, windowMap);
      const isNull = val === null || val === undefined;
      return (expr.negated ? !isNull : isNull) ? 1 : 0;
    }
    case 'inList': {
      const val = evalScalar(expr.expr, row, groupRows, windowMap);
      if (val === null) return 0;
      const found = expr.list.some((item) => evalScalar(item, row, groupRows, windowMap) === val);
      return (expr.negated ? !found : found) ? 1 : 0;
    }
    case 'between': {
      const val = evalScalar(expr.expr, row, groupRows, windowMap);
      const low = evalScalar(expr.low, row, groupRows, windowMap);
      const high = evalScalar(expr.high, row, groupRows, windowMap);
      if (val === null || low === null || high === null) return 0;
      const inside = compareValues(val, low) >= 0 && compareValues(val, high) <= 0;
      return (expr.negated ? !inside : inside) ? 1 : 0;
    }
    case 'like': {
      const val = evalScalar(expr.expr, row, groupRows, windowMap);
      const pat = evalScalar(expr.pattern, row, groupRows, windowMap);
      if (val === null || pat === null) return 0;
      const matched = likeToRegex(String(pat), expr.caseInsensitive).test(String(val));
      return (expr.negated ? !matched : matched) ? 1 : 0;
    }
    case 'case': {
      if (expr.operand) {
        const base = evalScalar(expr.operand, row, groupRows, windowMap);
        for (const b of expr.branches) {
          const condVal = evalScalar(b.when, row, groupRows, windowMap);
          if (base === condVal) {
            return evalScalar(b.then, row, groupRows, windowMap);
          }
        }
      } else {
        for (const b of expr.branches) {
          if (isTruthy(evalScalar(b.when, row, groupRows, windowMap))) {
            return evalScalar(b.then, row, groupRows, windowMap);
          }
        }
      }
      return expr.elseExpr ? evalScalar(expr.elseExpr, row, groupRows, windowMap) : null;
    }
    case 'call': {
      const vals = expr.args.map((a) => evalScalar(a, row, groupRows, windowMap));
      switch (expr.name) {
        case 'COALESCE':
          return vals.find((v) => v !== null && v !== undefined) ?? null;
        case 'NULLIF':
          return vals[0] === vals[1] ? null : (vals[0] ?? null);
        case 'ROUND': {
          if (vals[0] === null) return null;
          const decimals = typeof vals[1] === 'number' ? vals[1] : 0;
          const factor = 10 ** decimals;
          return Math.round(Number(vals[0]) * factor) / factor;
        }
        case 'ABS':
          return vals[0] === null ? null : Math.abs(Number(vals[0]));
        case 'FLOOR':
          return vals[0] === null ? null : Math.floor(Number(vals[0]));
        case 'CEIL':
        case 'CEILING':
          return vals[0] === null ? null : Math.ceil(Number(vals[0]));
        case 'LOWER':
          return vals[0] === null ? null : String(vals[0]).toLowerCase();
        case 'UPPER':
          return vals[0] === null ? null : String(vals[0]).toUpperCase();
        case 'TRIM':
          return vals[0] === null ? null : String(vals[0]).trim();
        case 'LENGTH':
          return vals[0] === null ? null : String(vals[0]).length;
        case 'SUBSTR':
        case 'SUBSTRING': {
          if (vals[0] === null) return null;
          const s = String(vals[0]);
          const start = Math.max(0, Number(vals[1] ?? 1) - 1);
          const len = vals[2] !== undefined ? Number(vals[2]) : undefined;
          return len !== undefined ? s.slice(start, start + len) : s.slice(start);
        }
        case 'CAST': {
          const val = vals[0];
          const target = String(vals[1] ?? 'TEXT');
          if (val === null) return null;
          if (target === 'INT' || target === 'INTEGER') return parseInt(String(val), 10);
          if (target === 'FLOAT' || target === 'REAL' || target === 'NUMERIC') return Number(val);
          return String(val);
        }
        default:
          throw new Error(`Unsupported SQL function "${expr.name}()".`);
      }
    }
  }
}

function evalAggregate(
  name: string,
  args: ExprNode[],
  distinct: boolean,
  rows: ScopedRow[]
): DatasetRowValue {
  if (name === 'COUNT') {
    if (args.length === 1 && args[0].kind === 'star') {
      return rows.length;
    }
    const values = rows
      .map((r) => evalScalar(args[0], r))
      .filter((v) => v !== null && v !== undefined);
    if (distinct) {
      return new Set(values.map((v) => `${typeof v}:${String(v)}`)).size;
    }
    return values.length;
  }

  const expr = args[0];
  if (!expr) throw new Error(`${name}() requires an argument.`);
  const rawVals = rows
    .map((r) => evalScalar(expr, r))
    .filter((v): v is string | number => v !== null && v !== undefined);

  if (rawVals.length === 0) return null;
  const values = distinct
    ? Array.from(new Map(rawVals.map((v) => [`${typeof v}:${String(v)}`, v])).values())
    : rawVals;

  if (name === 'SUM') {
    const sum = values.reduce<number>((acc, v) => acc + Number(v), 0);
    return Math.round(sum * 1e6) / 1e6;
  }
  if (name === 'AVG') {
    const sum = values.reduce<number>((acc, v) => acc + Number(v), 0);
    return Math.round((sum / values.length) * 1e6) / 1e6;
  }
  if (name === 'MIN') {
    return values.reduce((min, v) => (compareValues(v, min) < 0 ? v : min), values[0]);
  }
  if (name === 'MAX') {
    return values.reduce((max, v) => (compareValues(v, max) > 0 ? v : max), values[0]);
  }
  return null;
}

function buildScopedRow(tableAlias: string, columns: string[], row: DatasetRow): ScopedRow {
  const qualified: Record<string, DatasetRowValue> = {};
  for (const col of columns) {
    qualified[`${tableAlias}.${col}`] = row[col] ?? null;
  }
  return {
    qualified,
    aliasColumns: { [tableAlias]: [...columns] },
  };
}

function mergeScopedRows(left: ScopedRow, right: ScopedRow): ScopedRow {
  return {
    qualified: { ...left.qualified, ...right.qualified },
    aliasColumns: { ...left.aliasColumns, ...right.aliasColumns },
  };
}

function buildNullScopedRow(tableAlias: string, columns: string[]): ScopedRow {
  const qualified: Record<string, DatasetRowValue> = {};
  for (const col of columns) {
    qualified[`${tableAlias}.${col}`] = null;
  }
  return {
    qualified,
    aliasColumns: { [tableAlias]: [...columns] },
  };
}

function inferSelectColumnName(item: SelectItem, idx: number): string {
  if (item.alias) return item.alias;
  if (item.expr.kind === 'column') return item.expr.name;
  if (item.expr.kind === 'call') return item.expr.name.toLowerCase();
  return `col_${idx + 1}`;
}

function executeSelect(
  query: SelectQuery,
  tableMap: Map<string, { columns: string[]; rows: DatasetRow[] }>
): { columns: string[]; rows: DatasetRow[] } {
  const base = tableMap.get(query.fromTable.toLowerCase());
  if (!base) {
    throw new Error(
      `Unknown table "${query.fromTable}". Available tables: ${Array.from(tableMap.keys()).join(', ')}.`
    );
  }

  let workingRows: ScopedRow[] = base.rows.map((r) =>
    buildScopedRow(query.fromAlias, base.columns, r)
  );

  // Apply JOINs
  for (const join of query.joins) {
    const rightTable = tableMap.get(join.table.toLowerCase());
    if (!rightTable) {
      throw new Error(`Unknown joined table "${join.table}".`);
    }
    const nextRows: ScopedRow[] = [];
    for (const leftRow of workingRows) {
      let matchedAny = false;
      for (const rightRaw of rightTable.rows) {
        const rightRow = buildScopedRow(join.alias, rightTable.columns, rightRaw);
        const combined = mergeScopedRows(leftRow, rightRow);
        if (isTruthy(evalScalar(join.on, combined))) {
          matchedAny = true;
          nextRows.push(combined);
        }
      }
      if (!matchedAny && join.type === 'LEFT') {
        const nullRight = buildNullScopedRow(join.alias, rightTable.columns);
        nextRows.push(mergeScopedRows(leftRow, nullRight));
      }
    }
    workingRows = nextRows;
  }

  // Apply WHERE
  if (query.where) {
    workingRows = workingRows.filter((r) => isTruthy(evalScalar(query.where!, r)));
  }

  // Determine grouping
  const anyAggregateInSelect = query.items.some((it) => hasAggregate(it.expr));
  const isGrouped = query.groupBy.length > 0 || anyAggregateInSelect || Boolean(query.having);

  type GroupEntry = { representative: ScopedRow; rows: ScopedRow[] };
  let groups: GroupEntry[];

  if (isGrouped) {
    if (query.groupBy.length === 0) {
      groups = [{ representative: workingRows[0] ?? { qualified: {}, aliasColumns: {} }, rows: workingRows }];
    } else {
      const buckets = new Map<string, GroupEntry>();
      for (const r of workingRows) {
        const keyVals = query.groupBy.map((g) => evalScalar(g, r));
        const key = JSON.stringify(keyVals);
        const existing = buckets.get(key);
        if (existing) {
          existing.rows.push(r);
        } else {
          buckets.set(key, { representative: r, rows: [r] });
        }
      }
      groups = Array.from(buckets.values());
    }

    if (query.having) {
      groups = groups.filter((g) => isTruthy(evalScalar(query.having!, g.representative, g.rows)));
    }
  } else {
    groups = workingRows.map((r) => ({ representative: r, rows: [r] }));
  }

  // Evaluate Window Functions across the grouped/filtered entries
  const windowCalls: Extract<ExprNode, { kind: 'call' }>[] = [];
  query.items.forEach((it) => collectWindowCalls(it.expr, windowCalls));
  query.orderBy.forEach((ob) => collectWindowCalls(ob.expr, windowCalls));

  const rowWindowMaps = new WeakMap<GroupEntry, WeakMap<object, DatasetRowValue>>();
  groups.forEach((g) => rowWindowMaps.set(g, new WeakMap()));

  for (const wCall of windowCalls) {
    if (!WINDOW_FUNCS.has(wCall.name)) {
      throw new Error(`Unsupported window function "${wCall.name}()".`);
    }
    const over = wCall.over!;
    const partitions = new Map<string, GroupEntry[]>();

    for (const g of groups) {
      const partKey =
        over.partitionBy.length > 0
          ? JSON.stringify(over.partitionBy.map((p) => evalScalar(p, g.representative, g.rows)))
          : '__ALL__';
      const list = partitions.get(partKey);
      if (list) list.push(g);
      else partitions.set(partKey, [g]);
    }

    for (const partEntries of partitions.values()) {
      const sorted = [...partEntries];
      if (over.orderBy.length > 0) {
        sorted.sort((a, b) => {
          for (const ob of over.orderBy) {
            const va = evalScalar(ob.expr, a.representative, a.rows);
            const vb = evalScalar(ob.expr, b.representative, b.rows);
            const cmp = compareValues(va, vb);
            if (cmp !== 0) return ob.dir === 'DESC' ? -cmp : cmp;
          }
          return 0;
        });
      }

      if (wCall.name === 'ROW_NUMBER') {
        sorted.forEach((entry, idx) => {
          rowWindowMaps.get(entry)!.set(wCall, idx + 1);
        });
      } else if (wCall.name === 'RANK' || wCall.name === 'DENSE_RANK') {
        let currentRank = 1;
        let prevKey: string | null = null;
        sorted.forEach((entry, idx) => {
          const orderKey = JSON.stringify(
            over.orderBy.map((ob) => evalScalar(ob.expr, entry.representative, entry.rows))
          );
          if (idx > 0 && orderKey !== prevKey) {
            currentRank = wCall.name === 'RANK' ? idx + 1 : currentRank + 1;
          }
          prevKey = orderKey;
          rowWindowMaps.get(entry)!.set(wCall, currentRank);
        });
      } else {
        // Window aggregate (SUM/AVG/COUNT/MIN/MAX)
        if (over.orderBy.length > 0) {
          // Running window frame up to current peer group
          for (let idx = 0; idx < sorted.length; idx += 1) {
            const sliceRows = sorted.slice(0, idx + 1).flatMap((e) => e.rows);
            const val = evalAggregate(wCall.name, wCall.args, false, sliceRows);
            rowWindowMaps.get(sorted[idx])!.set(wCall, val);
          }
        } else {
          const allPartRows = sorted.flatMap((e) => e.rows);
          const val = evalAggregate(wCall.name, wCall.args, false, allPartRows);
          sorted.forEach((entry) => {
            rowWindowMaps.get(entry)!.set(wCall, val);
          });
        }
      }
    }
  }

  // Expand SELECT columns & compute output rows
  const expandedColumns: string[] = [];
  const rowEntries = groups.map((g) => {
    const out: DatasetRow = {};
    const computed: Record<string, DatasetRowValue> = {};
    const wMap = rowWindowMaps.get(g);

    query.items.forEach((item, idx) => {
      if (item.expr.kind === 'star') {
        const targetAlias = item.expr.table;
        if (targetAlias) {
          const aliasKey = Object.keys(g.representative.aliasColumns).find(
            (k) => k.toLowerCase() === targetAlias.toLowerCase()
          );
          if (!aliasKey) {
            throw new Error(`Unknown table alias "${targetAlias}" in SELECT ${targetAlias}.*`);
          }
          for (const col of g.representative.aliasColumns[aliasKey]) {
            if (!expandedColumns.includes(col)) expandedColumns.push(col);
            out[col] = g.representative.qualified[`${aliasKey}.${col}`] ?? null;
          }
        } else {
          for (const [aliasKey, cols] of Object.entries(g.representative.aliasColumns)) {
            for (const col of cols) {
              const outName = col in out ? `${aliasKey}_${col}` : col;
              if (!expandedColumns.includes(outName)) expandedColumns.push(outName);
              out[outName] = g.representative.qualified[`${aliasKey}.${col}`] ?? null;
            }
          }
        }
        return;
      }

      const colName = inferSelectColumnName(item, idx);
      if (!expandedColumns.includes(colName)) expandedColumns.push(colName);
      const val = evalScalar(item.expr, g.representative, g.rows, wMap);
      out[colName] = val;
      computed[colName] = val;
    });

    return {
      out,
      group: g,
      wMap,
      scopedWithComputed: {
        ...g.representative,
        computed,
      } as ScopedRow,
    };
  });

  // Handle empty result columns if 0 rows returned and SELECT *
  if (expandedColumns.length === 0 && rowEntries.length === 0) {
    for (const item of query.items) {
      if (item.expr.kind === 'star') {
        if (item.expr.table) {
          const tName = item.expr.table.toLowerCase() === query.fromAlias.toLowerCase() ? query.fromTable : item.expr.table;
          const t = tableMap.get(tName.toLowerCase());
          if (t) expandedColumns.push(...t.columns);
        } else {
          expandedColumns.push(...base.columns);
          for (const j of query.joins) {
            const jt = tableMap.get(j.table.toLowerCase());
            if (jt) expandedColumns.push(...jt.columns);
          }
        }
      } else {
        expandedColumns.push(inferSelectColumnName(item, expandedColumns.length));
      }
    }
  }

  // DISTINCT
  let finalEntries = rowEntries;
  if (query.distinct) {
    const seen = new Set<string>();
    finalEntries = finalEntries.filter((entry) => {
      const key = JSON.stringify(expandedColumns.map((c) => entry.out[c]));
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // ORDER BY
  if (query.orderBy.length > 0) {
    finalEntries = [...finalEntries].sort((a, b) => {
      for (const ob of query.orderBy) {
        const va = evalScalar(ob.expr, a.scopedWithComputed, a.group.rows, a.wMap);
        const vb = evalScalar(ob.expr, b.scopedWithComputed, b.group.rows, b.wMap);
        const cmp = compareValues(va, vb);
        if (cmp !== 0) return ob.dir === 'DESC' ? -cmp : cmp;
      }
      return 0;
    });
  }

  // LIMIT
  if (query.limit !== undefined) {
    finalEntries = finalEntries.slice(0, query.limit);
  }

  return {
    columns: expandedColumns,
    rows: finalEntries.map((e) => e.out),
  };
}

export function executeSqlQuery(
  sql: string,
  availableTables: EmbeddedTable[]
): SqlExecutionResponse {
  const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
  try {
    const trimmed = sql.trim();
    if (!trimmed) {
      return { ok: false, error: 'Enter a SELECT query before running the SQL sandbox.' };
    }

    const tokens = tokenize(trimmed);
    const parser = new Parser(tokens);
    const { ctes, main } = parser.parseStatement();

    const tableMap = new Map<string, { columns: string[]; rows: DatasetRow[] }>();
    for (const tbl of availableTables) {
      tableMap.set(tbl.name.toLowerCase(), {
        columns: tbl.columns.map((c) => c.name),
        rows: tbl.rows,
      });
    }

    for (const cte of ctes) {
      const cteResult = executeSelect(cte.query, tableMap);
      tableMap.set(cte.name.toLowerCase(), cteResult);
    }

    const result = executeSelect(main, tableMap);
    const end = typeof performance !== 'undefined' ? performance.now() : Date.now();

    return {
      ok: true,
      columns: result.columns,
      rows: result.rows,
      executionMs: Math.max(0.1, Math.round((end - start) * 10) / 10),
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unable to parse or execute SQL query.',
    };
  }
}
