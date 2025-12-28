import type { Expr } from "./expr"

/**
 * Compile an Expr AST node into a MongoDB-compatible match (filter) object.
 *
 * This function maps small, composable expression kinds to the corresponding
 * MongoDB query operators. It is intended for use when generating filters for
 * collection.find(...) or aggregation $match stages from a lightweight query
 * AST.
 *
 * Supported kinds and their mappings:
 * - "eq"   : equality -> { "<path>": <value> }
 * - "gt"   : greater-than -> { "<path>": { $gt: <value> } }
 * - "gte"  : greater-than-or-equal -> { "<path>": { $gte: <value> } }
 * - "lt"   : less-than -> { "<path>": { $lt: <value> } }
 * - "lte"  : less-than-or-equal -> { "<path>": { $lte: <value> } }
 * - "in"   : inclusion -> { "<path>": { $in: <array> } } (expects expr.val to be an array)
 * - "and"  : logical AND -> { $and: [ ...compiled sub-exprs ] }
 * - "or"   : logical OR  -> { $or:  [ ...compiled sub-exprs ] }
 *
 * @param expr - Expression node to compile. Expected shape varies by kind but
 *               generally includes:
 *               - kind: "eq" | "gt" | "gte" | "lt" | "lte" | "in" | "and" | "or"
 *               - col.path: string (dot-path to the document field)
 *               - val: any (value or array for "in")
 *               - exprs: Expr[] (for "and"/"or")
 *
 * @returns A plain object representing a MongoDB filter. The result is suitable
 *          for passing to collection.find(...) or an aggregation $match stage.
 *          If expr.kind is unrecognized the function may return undefined.
 *
 * @remarks
 * - Compound expressions ("and"/"or") are compiled recursively by invoking the
 *   same compile routine on each child expression.
 * - The produced filters do not perform any type coercion; they rely on the
 *   values provided in the Expr nodes to match the collection schema.
 *
 * @example
 * // eq
 * // input:  { kind: "eq", col: { path: "age" }, val: 30 }
 * // output: { age: 30 }
 *
 * @example
 * // gt
 * // input:  { kind: "gt", col: { path: "score" }, val: 75 }
 * // output: { score: { $gt: 75 } }
 *
 * @example
 * // in
 * // input:  { kind: "in", col: { path: "status" }, val: ["open","closed"] }
 * // output: { status: { $in: ["open","closed"] } }
 *
 * @example
 * // and / or
 * // input:
 * // { kind: "and", exprs: [
 * //     { kind: "gte", col: { path: "age" }, val: 18 },
 * //     { kind: "lt",  col: { path: "age" }, val: 65 }
 * //   ] }
 * // output:
 * // { $and: [ { age: { $gte: 18 } }, { age: { $lt: 65 } } ] }
 */
export function compileMatch(expr: Expr): any {
  switch (expr.kind) {
    case "eq":
      return { [expr.col.path]: expr.val }
    case "gt":
      return { [expr.col.path]: { $gt: expr.val } }
    case "gte":
      return { [expr.col.path]: { $gte: expr.val } }
    case "lt":
      return { [expr.col.path]: { $lt: expr.val } }
    case "lte":
      return { [expr.col.path]: { $lte: expr.val } }
    case "in":
      return { [expr.col.path]: { $in: expr.val } }
    case "and":
      return { $and: expr.exprs.map(compileMatch) }
    case "or":
      return { $or: expr.exprs.map(compileMatch) }
  }
}
