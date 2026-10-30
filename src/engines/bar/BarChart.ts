// import { Chart } from '@core/Chart';
// import { Grid } from '@components/Grid';
// import { Tooltip } from '@components/Tooltip';
// import { Axis } from '@components/Axis';
import { CartesianChart } from '@engines/base/CartesianChart';
import type { IDataPoint } from '@_types/data';
import { scaleLinear } from '@utils/math';
import { hexToRgba } from '@utils/color';

interface IInteractiveZone {
  item: IDataPoint;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  color: string;
}

export class BarChart extends CartesianChart {
  private barInteractiveZones: IInteractiveZone[] = [];

  protected prepareRenderState(): void {
    this.barInteractiveZones = [];
  }

  protected drawChartGraphics(renderData: IDataPoint[], maxValue: number): void {
    const totalBars = renderData.length;
    const gapRatio = 0.2;
    const totalAllocatedWidth = this.chartWidth / totalBars;
    const barGap = totalAllocatedWidth * gapRatio;
    const barWidth = totalAllocatedWidth - barGap;

    const yScale = scaleLinear([0, maxValue], [this.margin.top + this.chartHeight, this.margin.top]);

    for (let i = 0; i < totalBars; i++) {
      const item = renderData[i];
      const x = this.margin.left + i * totalAllocatedWidth + barGap / 2;
      const y = yScale(item.value);
      const height = yScale(0) - y;
      const barColor = this.theme.fallbackColors[i % this.theme.fallbackColors.length];

      // Draw custom bar graphics using the inherited activeHoverIndex property
      this.ctx.fillStyle = i === this.activeHoverIndex ? hexToRgba(barColor, 0.8) : barColor;
      this.ctx.fillRect(x, y, barWidth, height);

      // Cache interaction bounds locally
      this.barInteractiveZones.push({ item, xMin: x, xMax: x + barWidth, yMin: y, yMax: this.margin.top + this.chartHeight, color: barColor });

      // Label Overlays
      this.ctx.fillStyle = this.theme.textPrimary;
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(item.value.toString(), x + barWidth / 2, y - 6);

      // Let the inherited axis engine render individual text labels
      this.axisComponent.drawXLabel(this.ctx, item.label, x + barWidth / 2, this.margin.top + this.chartHeight + 8, this.theme);
    }
  }

  protected checkHitZone(mouseX: number, mouseY: number): number {
    return this.barInteractiveZones.findIndex((z) => mouseX >= z.xMin && mouseX <= z.xMax && mouseY >= z.yMin && mouseY <= z.yMax);
  }

  protected handleTooltipShow(hitIndex: number, mouse: { x: number; y: number }): void {
    const hit = this.barInteractiveZones[hitIndex];
    this.tooltipComponent.show(mouse, { title: hit.item.label, value: hit.item.value, color: hit.color }, this.theme);
  }
}
