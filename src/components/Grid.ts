import type { Margin } from '@_types/data';
import type { IChartTheme } from '@_types/theme';
import { calculateTicks, scaleLinear } from '@utils/math';

export interface IGridOptions {
  tickCount?: number;
  lineWidth?: number;
  dashedLine?: boolean;
  lineDash?: number[];
}

export class Grid {
  private options: Required<IGridOptions>;

  constructor(options: IGridOptions = {}) {
    this.options = {
      tickCount: options.tickCount ?? 5,
      lineWidth: options.lineWidth ?? 1,
      dashedLine: options.dashedLine ?? false,
      lineDash: options.lineDash ?? [4, 4] // 4px stroke, 4px gap dashed line
    };
  }

  /**
   * Renders horizontal background reference lines onto the active canvas context pass.
   */
  public draw(ctx: CanvasRenderingContext2D, margin: Margin, chartWidth: number, chartHeight: number, maxValue: number, theme: IChartTheme): void {
    if (maxValue <= 0) return;

    ctx.save(); // Isolate canvas styles

    // Apply color tokens from the active theme object
    ctx.strokeStyle = theme.gridLine;
    ctx.lineWidth = this.options.lineWidth;
    if (this.options.dashedLine) {
      ctx.setLineDash(this.options.lineDash);
    }

    // Calculate clean, rounded interval boundaries using the math engine
    const ticks = calculateTicks(0, maxValue, this.options.tickCount);

    const yScale = scaleLinear([0, maxValue], [margin.top + chartHeight, margin.top]);

    ticks.forEach((tickValue) => {
      // Skip the bottom baseline tick to avoid overwriting the chart boundary line
      if (tickValue === 0) return;

      const y = yScale(tickValue);

      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();
    });

    ctx.restore(); // Revert back to globally cached canvas options cleanly
  }
}
