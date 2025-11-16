/**
 * Resizes a canvas to match its displayed size if necessary.
 * @param canvas - The HTMLCanvasElement to resize.
 * @returns true if the canvas was resized, false otherwise.
 */
export function resizeIfNeeded(canvas: HTMLCanvasElement): boolean {
  const canvasRect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1

  const width = Math.floor(canvasRect.width * dpr)
  const height = Math.floor(canvasRect.height * dpr)
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
    return true
  }
  return false
}
