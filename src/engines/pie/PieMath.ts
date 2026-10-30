import type { Point } from '@_types/data';

/**
 * Geometric slice parameters calculated for individual pie sectors.
 */
export interface IPieSliceData {
  label: string;
  value: number;
  percentage: number;
  startAngle: number;
  endAngle: number;
}

/**
 * Transforms simple data values into precise radian angles starting from 12 o'clock.
 */
export function computePieSlices(data: { label: string; value: number }[]): IPieSliceData[] {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  // Set the starting point to -Math.PI / 2 to start drawing at the top vertical center (12 o'clock)
  let currentAngle = -Math.PI / 2;

  return data.map((item) => {
    const percentage = totalValue > 0 ? item.value / totalValue : 0;
    // Map the relative slice ratio out of the total circle space (2 * Math.PI)
    const angleDelta = percentage * (2 * Math.PI);
    const startAngle = currentAngle;
    const endAngle = currentAngle + angleDelta;

    // Advance the tracking clock forward for the next adjacent segment
    currentAngle = endAngle;

    return {
      label: item.label,
      value: item.value,
      percentage,
      startAngle,
      endAngle
    };
  });
}

/**
 * Translates polar angular offsets outwards from a center origin point into standard pixel vectors.
 * Essential for centering floating labels or anchoring contextual hitboxes accurately.
 */
export function polarToCartesian(centerX: number, centerY: number, radius: number, angleInRadians: number): Point {
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}
