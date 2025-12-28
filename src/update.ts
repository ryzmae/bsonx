import type { Column } from "./column"

export type Update =
  | { kind: "set"; col: Column<any>; val: any }
  | { kind: "inc"; col: Column<number>; val: number }

export const set = (col: Column<any>, val: any): Update => ({
  kind: "set",
  col,
  val,
})

export const inc = (col: Column<number>, val: number): Update => ({
  kind: "inc",
  col,
  val,
})

/**
 * Compile an array of high-level update descriptors into a MongoDB-style update document.
 *
 * This function reduces an array of update operations into a single object containing
 * MongoDB update operators (currently `$set` and `$inc`). Each update descriptor is
 * expected to have a `kind` discriminator, a `col.path` string key, and a `val` value.
 *
 * Behavior:
 * - For descriptors with `kind === 'set'`, an entry is added to the `$set` object:
 *   `$set[<path>] = val`.
 * - For descriptors with `kind === 'inc'`, an entry is added to the `$inc` object:
 *   `$inc[<path>] = val`.
 * - If multiple descriptors target the same `col.path` within the same operator,
 *   the last descriptor wins (it overwrites earlier ones).
 * - Descriptors with kinds other than `'set'` or `'inc'` are ignored.
 * - If no updates of a given operator type are present, that operator is omitted
 *   from the returned object.
 *
 * Example:
 * ```ts
 * const updates = [
 *   { kind: 'set', col: { path: 'name' }, val: 'Alice' },
 *   { kind: 'inc', col: { path: 'visits' }, val: 1 },
 * ]
 * // returns: { $set: { name: 'Alice' }, $inc: { visits: 1 } }
 * ```
 *
 * @param updates - Array of update descriptors. Expected shape:
 *   { kind: 'set' | 'inc'; col: { path: string }; val: unknown }[]
 * @returns An object suitable for use as a MongoDB update document, e.g.
 *   `{ $set?: Record<string, unknown>, $inc?: Record<string, unknown> }`.
 *
 * @public
 */
export function compileUpdate(updates: Update[]) {
  const u: any = {}
  for (const upd of updates) {
    if (upd.kind === "set") {
      u.$set ??= {}
      u.$set[upd.col.path] = upd.val
    }
    if (upd.kind === "inc") {
      u.$inc ??= {}
      u.$inc[upd.col.path] = upd.val
    }
  }
  return u
}
