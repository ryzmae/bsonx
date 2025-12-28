import type { Column } from "./column"

/**
 * Create a projection object from a shape of Column descriptors.
 *
 * Builds a plain object mapping each key in `shape` to a string path prefixed with `$`,
 * suitable for use as a projection document in MongoDB aggregation stages or similar APIs.
 *
 * Type parameters
 * @typeParam T - A record type whose values are Column-like descriptors that expose a `path` property.
 *
 * Parameters
 * @param shape - An object whose keys correspond to desired output fields and whose values are Column descriptors.
 *
 * Returns
 * @returns An object where each key from `shape` maps to the string `"$<path>"` (the Column's `path` prefixed with `$`).
 *
 * Example
 * ```ts
 * // given a Column type { path: string }
 * const shape = {
 *   firstName: { path: 'name.first' },
 *   age:       { path: 'metadata.age' }
 * }
 *
 * // result:
 * // { firstName: '$name.first', age: '$metadata.age' }
 * const projection = select(shape)
 * ```
 *
 * Remarks
 * - Keys from `shape` are preserved in the returned projection.
 * - If a value in `shape` is missing or its `path` is undefined, the resulting projection value will be the string `"$undefined"`.
 * - This is a lightweight helper intended for building projection documents for query/aggregation builders.
 *
 * @since 0.1.0
 */
export function select<T extends Record<string, Column<any>>>(shape: T) {
  const projection: any = {}
  for (const k in shape) {
    projection[k] = `$${shape[k]?.path}`
  }
  return projection
}
