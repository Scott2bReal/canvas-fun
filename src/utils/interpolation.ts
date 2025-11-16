const EPSILON = 1e-6
export function lerp(min: number, max: number, t: number) {
  const result = min + (max - min) * t
  if (Math.abs(max - min) < EPSILON) {
    return min // Avoid division by zero, return min if max and min are effectively equal
  }
  return result
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
