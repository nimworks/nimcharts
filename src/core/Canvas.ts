import type { Margin, Point } from '@_types/data';
import { computeInnerDimensions } from '@utils/dom';

interface ICanvasResizePayload {
  chartWidth: number;
  chartHeight: number;
}

export class CanvasManager {
  private container: HTMLElement;
  public element: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  private resizeObserver: ResizeObserver | null = null;
  private onResizeCallback: (payload: ICanvasResizePayload) => void;

  constructor(container: HTMLElement, height: number, widthOption: number | 'auto', onResize: (payload: ICanvasResizePayload) => void) {
    this.container = container;
    this.onResizeCallback = onResize;

    // Enforce relative coordinates positioning on container box to hold absolute overlays safely
    if (window.getComputedStyle(this.container).position === 'static') {
      this.container.style.position = 'relative';
    }

    // Generate and inject the canvas element node
    this.element = document.createElement('canvas');
    this.container.appendChild(this.element);

    const context = this.element.getContext('2d');
    if (!context) {
      throw new Error('Canvas Engine Error: Failed to acquire 2D rendering graphics context.');
    }
    this.ctx = context;

    this.setupResizeObserver(widthOption, height);
  }

  /**
   * Evaluates display dimensions and balances coordinates scaling to map perfectly on sharp Retina screens.
   * Delegates mathematical bounding layout logic directly to the pure dom utility module.
   */
  public resize(widthOption: number | 'auto', height: number, margin: Margin): ICanvasResizePayload {
    // Leverage the decoupled pure stateless engine tool calculation
    const dimensions = computeInnerDimensions(this.container, height, widthOption, margin);

    const dpr = window.devicePixelRatio || 1;

    // Adjust internal high-DPI graphic resolution buffer grid bounds
    this.element.width = dimensions.computedWidth * dpr;
    this.element.height = height * dpr;

    // Scale CSS layout width/height style attributes matching standard parameters
    this.element.style.width = `${dimensions.computedWidth}px`;
    this.element.style.height = `${height}px`;

    // Rescale mapping coordinates matrices cleanly to neutralize pixel density blur shifts
    this.ctx.scale(dpr, dpr);

    return {
      chartWidth: dimensions.chartWidth,
      chartHeight: dimensions.chartHeight
    };
  }

  /**
   * Tracks container size modifications smoothly using performance-optimized ResizeObservers.
   */
  private setupResizeObserver(widthOption: number | 'auto', _height: number): void {
    if (widthOption === 'auto') {
      this.resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          // Notify the main chart orchestra layer to execute recalculation routines on resize ticks
          this.onResizeCallback({ chartWidth: 0, chartHeight: 0 });
        });
      });
      this.resizeObserver.observe(this.container);
    }
  }

  /**
   * Utility to compute pointer hover vectors relative to the isolated canvas boundary boxes.
   */
  public getMouseCoordinates(event: MouseEvent): Point {
    const rect = this.element.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  /**
   * Tears down listeners and disconnects observer hooks cleanly.
   */
  public destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.element.remove();
  }
}
