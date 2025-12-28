export type Column<T> = {
  readonly __type?: T
  readonly path: string
}

/**
 * Create a Column<T> descriptor for a given property path.
 *
 * @template T - The expected type of the column's value.
 * @param path - A string identifying the property or nested path represented by the column.
 * @returns A Column<T> object containing the provided path.
 */
export const column = <T>(path: string): Column<T> => ({ path } as Column<T>)
