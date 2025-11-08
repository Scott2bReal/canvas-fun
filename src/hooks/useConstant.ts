import { useRef } from "react"

/**
 * Initializer function type that returns a value of type T
 */
type Init<T> = () => T

/**
 * Hook that creates a constant value over the lifecycle of a component
 *
 * Bryant yoinked this idea from the Framer Motion library.
 *
 * Even if `useMemo` is provided an empty array as its final argument, it doesn't offer
 * a guarantee that it won't re-run for performance reasons later on. By using `useConstant`
 * you can ensure that initializers don't execute twice or more.
 *
 * @param init - Function that initializes the constant value
 * @returns The constant value, guaranteed to be the same instance across re-renders
 */
export function useConstant<T>(init: Init<T>) {
  const ref = useRef<T | null>(null)

  if (ref.current === null) {
    ref.current = init()
  }

  return ref.current
}
