import { PolarChart } from '@engines/base/PolarChart';
import type { IDataPoint, IChartOptions } from '@_types/data';
import { blendHexColors } from '@utils/color';
import { computePieSlices, polarToCartesian } from './PieMath';

export class DonutChart extends PolarChart {
  private innerRadiusRatio = 0.6;

  constructor(containerId: string, data: IDataPoint[], options: IChartOptions = {}) {
    super(containerId, data, options);
  }

  /**
   * Overrides parent radius evaluation to enforce the hollow ring structure constraints.
   */
  protected override validateRadiusDistance(distance: number, outerRadius: number): boolean {
    const innerRadius = outerRadius * this.innerRadiusRatio;
    return distance <= outerRadius && distance >= innerRadius;
  }

  public render(): void {
    this.clear();
    this.sliceInteractiveZones = [];

    if (!Array.isArray(this.data) || this.data.length === 0) return;

    // Retrieve shared metrics from the parent class
    const { centerX, centerY, outerRadius } = this.getPolarMetrics();
    const innerRadius = outerRadius * this.innerRadiusRatio;

    const slices = computePieSlices(this.data);
    const blendTargetColor = this.options.theme === 'dark' ? '#000000' : '#FFFFFF';

    // Phase A: Render out the core hollow rings
    slices.forEach((slice, index) => {
      const baseColor = this.theme.fallbackColors[index % this.theme.fallbackColors.length];

      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, outerRadius, slice.startAngle, slice.endAngle, false);
      this.ctx.arc(centerX, centerY, innerRadius, slice.endAngle, slice.startAngle, true);
      this.ctx.closePath();

      this.ctx.fillStyle = index === this.activeHoverIndex ? blendHexColors(baseColor, blendTargetColor, 0.25) : baseColor;

      this.ctx.fill();

      this.ctx.strokeStyle = this.theme.background;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      this.sliceInteractiveZones.push({ slice, color: baseColor });
    });

    // Phase B: Render floating percentage overlays
    slices.forEach((slice) => {
      if (slice.percentage > 0.05) {
        const middleAngle = slice.startAngle + (slice.endAngle - slice.startAngle) / 2;
        const labelRadius = innerRadius + (outerRadius - innerRadius) / 2;
        const textPos = polarToCartesian(centerX, centerY, labelRadius, middleAngle);

        this.ctx.save();
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 11px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`${(slice.percentage * 100).toFixed(0)}%`, textPos.x, textPos.y);
        this.ctx.restore();
      }
    });

    // Phase C: Render aggregated central text indicator
    const totalSum = this.data.reduce((sum, item) => sum + item.value, 0);
    this.ctx.save();
    this.ctx.fillStyle = this.theme.textPrimary;
    this.ctx.font = 'bold 20px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(totalSum.toLocaleString(), centerX, centerY);
    this.ctx.restore();
  }
}
