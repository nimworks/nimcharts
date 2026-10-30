import { PolarChart } from '@engines/base/PolarChart';
import type { IDataPoint, IChartOptions } from '@_types/data';
import { blendHexColors } from '@utils/color';
import { computePieSlices, polarToCartesian } from './PieMath';

export class PieChart extends PolarChart {
  constructor(containerId: string, data: IDataPoint[], options: IChartOptions = {}) {
    super(containerId, data, options);
  }

  public render(): void {
    this.clear();
    this.sliceInteractiveZones = [];

    if (!Array.isArray(this.data) || this.data.length === 0) return;

    // Retrieve shared metrics from the parent class
    const { centerX, centerY, outerRadius } = this.getPolarMetrics();
    const slices = computePieSlices(this.data);
    const blendTargetColor = this.options.theme === 'dark' ? '#000000' : '#FFFFFF';

    slices.forEach((slice, index) => {
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, outerRadius, slice.startAngle, slice.endAngle);
      this.ctx.closePath();

      const baseColor = this.theme.fallbackColors[index % this.theme.fallbackColors.length];

      // Premium lighting drop shadow fill modification utilizing the activeHoverIndex tracking
      this.ctx.fillStyle = index === this.activeHoverIndex ? blendHexColors(baseColor, blendTargetColor, 0.25) : baseColor;

      this.ctx.fill();

      this.ctx.strokeStyle = this.theme.background;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      this.sliceInteractiveZones.push({ slice, color: baseColor });

      // Label overlays
      if (slice.percentage > 0.05) {
        const middleAngle = slice.startAngle + (slice.endAngle - slice.startAngle) / 2;
        const textPos = polarToCartesian(centerX, centerY, outerRadius * 0.65, middleAngle);

        this.ctx.save();
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 11px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`${(slice.percentage * 100).toFixed(0)}%`, textPos.x, textPos.y);
        this.ctx.restore();
      }
    });
  }
}
