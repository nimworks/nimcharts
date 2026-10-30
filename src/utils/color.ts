/**
 * Transforms standard 6-digit Hexadecimal strings cleanly into CSS RGBA functional mappings.
 * Highly useful for applying dynamic opacity gradients or hover state changes.
 *
 * @param hex Standard hex string format (e.g., "#2563eb" or "2563eb")
 * @param alpha Target opacity multiplier float bounded strictly between 0.0 and 1.0
 */
export function hexToRgba(hex: string, alpha: number): string {
  let cleanHex = hex.trim().replace('#', '');

  // Expand shorthand hex codes (e.g., "fff" -> "ffffff")
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  if (cleanHex.length !== 6) {
    return `rgba(0, 0, 0, ${alpha})`; // Safe fallback error layout token
  }

  // Parse bit shifts to extract RGB integers
  const num = Number.parseInt(cleanHex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  const clampedAlpha = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
}

/**
 * Linearly interpolates (blends) between two hexadecimal hex colors based on an alpha weight.
 * Essential for generating smooth multi-color transitions across running frames.
 */
export function blendHexColors(colorA: string, colorB: string, alpha: number): string {
  const cleanA = colorA.trim().replace('#', '');
  const cleanB = colorB.trim().replace('#', '');

  const numA = Number.parseInt(cleanA, 16);
  const numB = Number.parseInt(cleanB, 16);

  const rA = (numA >> 16) & 255;
  const gA = (numA >> 8) & 255;
  const bA = numA & 255;

  const rB = (numB >> 16) & 255;
  const gB = (numB >> 8) & 255;
  const bB = numB & 255;

  // Apply standard lerp blending math
  const r = Math.round(rA + (rB - rA) * alpha);
  const g = Math.round(gA + (gB - gA) * alpha);
  const b = Math.round(bA + (bB - bA) * alpha);

  // Return formatted uppercase hex string strings
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}
