import type { Margin } from '@_types/data';
import type { IChartTheme } from '@_types/theme';
import { calculateTicks, scaleLinear } from '@utils/math';

export interface IAxisOptions {
  tickCount?: number;
  fontSize?: number;
  fontFamily?: string;
}

export class Axis {
  private options: Required<IAxisOptions>;

  constructor(options: IAxisOptions = {}) {
    this.options = {
      tickCount: options.tickCount ?? 5,
      fontSize: options.fontSize ?? 12,
      fontFamily: options.fontFamily ?? 'sans-serif'
    };
  }

  /**
   * Renders the vertical Y-Axis ticks and numeric values.
   */
  public drawY(ctx: CanvasRenderingContext2D, margin: Margin, chartHeight: number, maxValue: number, theme: IChartTheme): void {
    if (maxValue <= 0) return;

    ctx.save();
    ctx.fillStyle = theme.textSecondary;
    ctx.font = `${this.options.fontSize}px ${this.options.fontFamily}`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = theme.axisLine;
    ctx.lineWidth = 1;

    // Draw solid vertical Y-axis line
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + chartHeight);
    ctx.stroke();

    // Generate balanced ticks using the math utility
    const ticks = calculateTicks(0, maxValue, this.options.tickCount);
    const yScale = scaleLinear([0, maxValue], [margin.top + chartHeight, margin.top]);

    ticks.forEach((tickValue) => {
      const y = yScale(tickValue);

      // Draw small hash marks pointing outwards to the left
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left - 5, y);
      ctx.stroke();

      // Render the numeric label next to the hash mark
      ctx.fillText(tickValue.toLocaleString(), margin.left - 10, y);
    });

    ctx.restore();
  }

  /**
   * Renders the baseline horizontal X-Axis boundary rule line.
   */
  public drawXBaseline(ctx: CanvasRenderingContext2D, margin: Margin, chartWidth: number, chartHeight: number, theme: IChartTheme): void {
    ctx.save();
    ctx.strokeStyle = theme.axisLine;
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top + chartHeight);
    ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Renders a category text block label underneath the baseline x-axis.
   */
  public drawXLabel(ctx: CanvasRenderingContext2D, label: string, x: number, y: number, theme: IChartTheme): void {
    ctx.save();
    ctx.fillStyle = theme.textSecondary;
    ctx.font = `${this.options.fontSize}px ${this.options.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(label, x, y);
    ctx.restore();
  }
}
