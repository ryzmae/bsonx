import type { Column } from "./column"

export type Expr =
  | { kind: "eq"; col: Column<any>; val: any }
  | { kind: "gt"; col: Column<number>; val: number }
  | { kind: "gte"; col: Column<number>; val: number }
  | { kind: "lt"; col: Column<number>; val: number }
  | { kind: "lte"; col: Column<number>; val: number }
  | { kind: "in"; col: Column<any>; val: any[] }
  | { kind: "and"; exprs: Expr[] }
  | { kind: "or"; exprs: Expr[] }

/**
 * Create an equality expression node that compares a column to a literal value.
 *
 * Produces an Expr with kind "eq" representing the predicate `col = val`.
 *
 * @template T - The type of the column's value.
 * @param col - Column reference to compare.
 * @param val - Literal value to compare the column against.
 * @returns An Expr node: { kind: 'eq', col, val }.
 *
 * @example
 * const predicate = eq(user.age, 30);
 *
 * @category Expressions
 * @since 1.0.0
 */
export const eq = <T>(col: Column<T>, val: T): Expr => ({
  kind: "eq",
  col,
  val,
})

/**
 * Create a "greater-than" expression comparing a numeric column to a literal value.
 *
 * This is a lightweight helper used when building query expressions:
 * it does not evaluate the comparison, it only returns an Expr describing it.
 *
 * @example
 * const expr = gt(ageColumn, 18);
 *
 * @param col - The numeric column to compare.
 * @param val - The numeric value to compare against.
 * @returns An Expr representing the condition "col > val".
 *
 * @category Expressions
 * @public
 */
export const gt = (col: Column<number>, val: number): Expr => ({
  kind: "gt",
  col,
  val,
})

/**
 * Construct a "greater than or equal" expression for numeric columns.
 *
 * Produces an Expr of kind `"gte"` that represents the comparison `col >= val`.
 * Intended for use with the library's query/aggregation builders and evaluators.
 *
 * @param col - The numeric Column to test.
 * @param val - The numeric value to compare the column against.
 * @returns An Expr object representing the >= comparison between the column and the value.
 *
 * @example
 * // Matches rows where the "age" column is at least 18
 * const isAdult = gte(table.age, 18);
 *
 * @since 0.1.0
 * @category Expressions
 */
export const gte = (col: Column<number>, val: number): Expr => ({
  kind: "gte",
  col,
  val,
})

/**
 * Create a "less than" expression node.
 *
 * Constructs an Expr node of kind `"lt"` that represents the comparison `col < val`.
 * This is a pure, structural factory used by the BSONX expression builder — it does not
 * perform any evaluation or I/O.
 *
 * @param col - The numeric Column to compare.
 * @param val - The numeric literal to compare against.
 * @returns An Expr node representing the "less than" comparison.
 *
 * @example
 * const isMinor = lt(ageColumn, 18);
 *
 * @category Expressions
 * @public
 */
export const lt = (col: Column<number>, val: number): Expr => ({
  kind: "lt",
  col,
  val,
})

/**
 * Construct a "less than or equal" expression node for numeric comparisons.
 *
 * Produces an Expr node representing the comparison `col <= val` that can be
 * consumed by the BSONX query builders and evaluators.
 *
 * @param col - Column reference identifying the numeric field to compare.
 * @param val - Numeric value to compare the column against.
 * @returns An Expr node with kind `"lte"` encoding the comparison.
 *
 * @example
 * const expr = lte(ageColumn, 21);
 * // -> { kind: "lte", col: ageColumn, val: 21 }
 *
 * @see eq, lt, gte
 * @public
 */
export const lte = (col: Column<number>, val: number): Expr => ({
  kind: "lte",
  col,
  val,
})

/**
 * Create an "in" expression that checks whether the given column's value is one of the provided values.
 *
 * @param col - Column to test. Typically a Column<T> or any expression that evaluates to a scalar value.
 * @param val - Array of candidate values to test membership against.
 * @returns An Expr representing the membership predicate `{ kind: "in", col, val }` which can be composed into queries or filters.
 *
 * @example
 * // Matches rows where the "status" column is either "open" or "closed"
 * const predicate = inArray(statusColumn, ["open", "closed"]);
 *
 * @remarks
 * The comparison semantics (e.g. strict equality, type coercion) depend on the execution backend that consumes the Expr.
 * Avoid very large arrays for `val` as some backends may degrade in performance; prefer joins or lookup tables for large sets.
 */
export const inArray = (col: Column<any>, val: any[]): Expr => ({
  kind: "in",
  col,
  val,
})

/**
 * Create a logical conjunction ("and") expression from one or more sub-expressions.
 *
 * Library helper for building query/AST nodes. The returned Expr will have kind `"and"`
 * and carry the provided expressions in the original order.
 *
 * @param exprs - One or more expressions to combine with logical AND.
 * @returns An Expr representing the conjunction of the provided expressions.
 *
 * @example
 * // Combine two predicates into a single conjunction
 * const predicate = and(eq("status", "active"), gt("age", 18));
 *
 * @remarks
 * - This helper is pure and does not mutate the provided expressions.
 * - Calling with a single expression yields an "and" node containing that expression.
 * - Calling with no arguments may produce an empty conjunction depending on runtime usage.
 */
export const and = (...exprs: Expr[]): Expr => ({ kind: "and", exprs })

/**
 * Creates a logical OR expression from one or more child expressions.
 *
 * The resulting expression represents the disjunction of the provided expressions:
 * it evaluates to true if at least one child expression evaluates to true.
 *
 * @param exprs - One or more expressions to combine with logical OR.
 * @returns An Expr representing the disjunction of the supplied expressions.
 *
 * @example
 * // Combine simple predicates into a single filter
 * const filter = or(eq("status", "active"), gt("score", 75));
 *
 * @public
 */
export const or = (...exprs: Expr[]): Expr => ({ kind: "or", exprs })
