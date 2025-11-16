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

export function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t)
}

export function easeInQuad(t: number): number {
  return t * t
}

export function easeInQuint(t: number): number {
  return t * t * t * t * t
}

export function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5)
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export function hugeEaseOut(t: number): number {
  return 1 - Math.pow(1 - t, 20)
}
