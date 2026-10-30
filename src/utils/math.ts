/**
 * Creates a linear scaling function that maps an input value from a data domain
 * interval out to a target physical canvas pixel coordinate range interval.
 *
 * Mathematical Formulation: y = rMin + ((value - dMin) / (dMax - dMin)) * (rMax - rMin)
 *
 * @param domain An array tuple [minValue, maxValue] matching the input dataset scale boundaries.
 * @param range An array tuple [startPixel, endPixel] matching the viewport coordinate space.
 * @returns A transformation mapping function: (value: number) => number
 */
export function scaleLinear(domain: [number, number], range: [number, number]): (value: number) => number {
  const [dMin, dMax] = domain;
  const [rMin, rMax] = range;

  // Defensive Guard Clause: Prevent a division-by-zero fatal runtime crash
  // if all input datasets evaluate to completely uniform metrics (Domain Delta === 0)
  const domainDelta = dMax - dMin;
  if (domainDelta === 0) {
    return () => rMin;
  }

  return (value: number): number => {
    return rMin + ((value - dMin) / domainDelta) * (rMax - rMin);
  };
}

/**
 * Linear Interpolation (Lerp) utility calculator.
 * Smoothly computes intermediate values between two operational states.
 * Highly essential for processing frame steps inside the temporal animation clock routines.
 *
 * @param start The structural baseline starting integer value.
 * @param end The target destination state final integer value.
 * @param alpha A normalized progression ratio parameter strictly clamped between 0.0 and 1.0.
 */
export function lerp(start: number, end: number, alpha: number): number {
  // Enforce boundary clamping constraints to prevent math overflows during rendering passes
  const clampedAlpha = Math.max(0, Math.min(1, alpha));
  return start + (end - start) * clampedAlpha;
}

/**
 * Generates highly aesthetic, clean, predictable tick increments for drawing reference line structures.
 * This prevents messy overlapping fractions on your y-axis lines.
 *
 * @param min The structural bottom limit parameter (typically 0).
 * @param max The maximum absolute capacity indicator from the dataset.
 * @param tickCount Target volume of lines requested (Defaults to 5).
 * @returns An sorted array of rounded number ticks matching linear dimensions.
 */
export function calculateTicks(min: number, max: number, tickCount: number = 5): number[] {
  const span = max - min;
  if (span === 0) return [min];

  const rawStep = span / (tickCount - 1);

  // Normalise values out to the nearest power of 10 to establish crisp increments (e.g., 10, 50, 100, 500)
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const residual = rawStep / magnitude;

  let cleanStep: number;
  if (residual < 1.5) cleanStep = 1;
  else if (residual < 3) cleanStep = 2;
  else if (residual < 7) cleanStep = 5;
  else cleanStep = 10;

  const actualStep = cleanStep * magnitude;
  const startTick = Math.ceil(min / actualStep) * actualStep;

  const ticks: number[] = [];
  for (let i = 0; i < tickCount; i++) {
    const tickVal = startTick + i * actualStep;
    if (tickVal <= max) {
      // Parse values carefully to strip out floating point calculation anomalies
      ticks.push(Number(tickVal.toFixed(4)));
    }
  }
  return ticks;
}
