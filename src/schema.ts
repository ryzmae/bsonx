import type { Column } from "./column"

type SchemaProxy<T> = {
  [K in keyof T]-?: T[K] extends object
    ? SchemaProxy<T[K]> & Column<T[K]>
    : Column<T[K]>
}

/**
 * Creates a lightweight, typed proxy for building dot‑separated property paths.
 *
 * This function is intended for library use when you need a compile‑time
 * representation of property access paths for a schema type `T`. The returned
 * value is a Proxy that intercepts property access and lazily accumulates the
 * accessed keys into an internal path string (e.g. accessing `proxy.a.b` builds
 * the path "a.b"). The function itself does not serialize or expose the path;
 * consumers in the library typically pass the proxy to helpers that extract the
 * accumulated path from the closure.
 *
 * @typeParam T - The schema or shape to be represented by the proxy. This
 *   generic parameter is used only for TypeScript typing and autocompletion.
 *
 * @returns A proxy typed as `SchemaProxy<T>` that mirrors `T`’s shape at the
 *   type level but, at runtime, simply returns nested proxies that record the
 *   dot‑separated path for each property access.
 *
 * @remarks
 * - Property keys are coerced to strings and concatenated using '.' between
 *   segments. Numeric keys and keys containing dots are included verbatim.
 * - Symbol property access is not specially handled by this implementation.
 * - The proxy is lazy and lightweight; accessing properties never mutates an
 *   underlying object — it only returns another proxy representing the longer
 *   path.
 * - To obtain or use the built path at runtime, pass the proxy to the library
 *   utilities that know how to extract the path from the closure.
 *
 * @example
 * // Provide a schema type for editor autocompletion
 * type User = { name: { first: string; last: string }; age: number }
 *
 * const schema = defineSchema<User>()
 *
 * // At compile time you get autocompletion: schema.name.first
 * // At runtime `schema.name.first` is a proxy representing "name.first".
 *
 * // Typical library usage (pseudocode):
 * //   const path = extractPath(schema.name.first) // -> "name.first"
 */
export function defineSchema<T>() {
  function make(path = ""): any {
    return new Proxy(
      {},
      {
        get(_, key: string) {
          const next = path ? `${path}.${key}` : key
          return make(next)
        },
      }
    )
  }

  return make() as SchemaProxy<T>
}
