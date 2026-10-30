import type { Margin } from '@_types/data';

/**
 * Validates the existence of a DOM element container and isolates error handling.
 */
export function getElementOrThrow(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`DOM Utility Error: Element container node with ID "${id}" was not found.`);
  }
  return element;
}

/**
 * Computes the pixel bounds layout reserved explicitly for inner chart visual structures.
 */
export function computeInnerDimensions(
  container: HTMLElement,
  configuredHeight: number,
  widthOption: number | 'auto',
  margin: Margin
): { chartWidth: number; chartHeight: number; computedWidth: number } {
  const rect = container.getBoundingClientRect();
  const computedWidth = widthOption === 'auto' ? rect.width : widthOption;

  const chartWidth = computedWidth - margin.left - margin.right;
  const chartHeight = configuredHeight - margin.top - margin.bottom;

  return { chartWidth, chartHeight, computedWidth };
}
