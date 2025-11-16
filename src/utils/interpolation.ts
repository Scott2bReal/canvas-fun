const EPSILON = 1e-6
export function lerp(min: number, max: number, t: number) {
  const clampedT = Math.max(0, Math.min(1, t))
  if (Math.abs(max - min) < EPSILON) {
    return min // Avoid division by zero, return min if max and min are effectively equal
  }
  return min + (max - min) * clampedT
}
