import { CartesianChart } from '@engines/base/CartesianChart';
import type { IDataPoint, IChartOptions } from '@_types/data';
import { scaleLinear } from '@utils/math';
import { hexToRgba } from '@utils/color';

interface IInteractivePoint {
  item: IDataPoint;
  x: number;
  y: number;
  color: string;
}

export class LineChart extends CartesianChart {
  private interactivePoints: IInteractivePoint[] = [];
  private maxPointsThreshold: number;

  constructor(containerId: string, data: IDataPoint[], options: IChartOptions = {}) {
    super(containerId, data, options);
    this.maxPointsThreshold = this.options.maxRenderPoints;
  }

  /**
   * Reset local position caches before the new paint iteration runs.
   */
  protected prepareRenderState(): void {
    this.interactivePoints = [];
  }

  /**
   * Overrides the data processor to hook up custom LTTB downsampling filters.
   */
  protected getProcessedData(): IDataPoint[] {
    return this.downsampleData(this.data as unknown as IDataPoint[], this.maxPointsThreshold);
  }

  /**
   * Core specialized drawing implementation for continuous trend lines.
   */
  protected drawChartGraphics(renderData: IDataPoint[], maxValue: number): void {
    const totalItems = renderData.length;
    if (totalItems === 0) return;

    const xScale = scaleLinear([0, totalItems - 1], [this.margin.left, this.margin.left + this.chartWidth]);
    const yScale = scaleLinear([0, maxValue], [this.margin.top + this.chartHeight, this.margin.top]);
    const strokeColor = this.theme.fallbackColors[0]; // Select primary palette index

    this.ctx.save();

    // STEP A: Trace and Draw the Continuous Trend Line Curve
    this.ctx.beginPath();
    this.ctx.lineWidth = 2.5;
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';

    for (let i = 0; i < totalItems; i++) {
      const x = xScale(i);
      const y = yScale(renderData[i].value);

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }

      // Cache structural point coordinate metrics for hit detection mappings
      this.interactivePoints.push({ item: renderData[i], x, y, color: strokeColor });
    }
    this.ctx.stroke();

    // STEP B: Trace and Paint a Faded Under-Line Area Gradient
    this.ctx.beginPath();
    this.ctx.moveTo(xScale(0), yScale(0)); // Start at bottom left origin anchor
    for (let i = 0; i < totalItems; i++) {
      this.ctx.lineTo(xScale(i), yScale(renderData[i].value));
    }
    this.ctx.lineTo(xScale(totalItems - 1), yScale(0)); // Draw down to bottom right edge
    this.ctx.closePath();

    this.ctx.fillStyle = hexToRgba(strokeColor, 0.15); // Transparent area fill
    this.ctx.fill();

    // STEP C: Draw Static Anchor Nodes and Highlight Active Hover Point
    if (totalItems <= 100) {
      this.interactivePoints.forEach((pt, index) => {
        const isHovered = index === this.activeHoverIndex;

        this.ctx.beginPath();
        // Dynamically inflate circle node size radius on hover selection configurations
        this.ctx.arc(pt.x, pt.y, isHovered ? 6 : 3.5, 0, 2 * Math.PI);
        this.ctx.fillStyle = isHovered ? pt.color : this.theme.background;
        this.ctx.fill();
        this.ctx.strokeStyle = pt.color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      });
    }

    // STEP D: Draw Text Baseline Categories Labels
    const stepSkip = Math.ceil(totalItems / 6);
    for (let i = 0; i < totalItems; i += stepSkip) {
      this.axisComponent.drawXLabel(this.ctx, renderData[i].label, xScale(i), this.margin.top + this.chartHeight + 8, this.theme);
    }

    this.ctx.restore();
  }

  /**
   * Distance-matching collision detection algorithm.
   */
  protected checkHitZone(mouseX: number, mouseY: number): number {
    const hoverRadius = 15; // Proximity catch-zone radius threshold
    let hitIndex = -1;

    this.interactivePoints.forEach((pt, index) => {
      const dx = mouseX - pt.x;
      const dy = mouseY - pt.y;
      if (Math.sqrt(dx * dx + dy * dy) <= hoverRadius) {
        hitIndex = index;
      }
    });

    return hitIndex;
  }

  /**
   * Binds data point variables perfectly to the inherited tooltip component layer.
   */
  protected handleTooltipShow(hitIndex: number, _mouseCoords: { x: number; y: number }): void {
    const hit = this.interactivePoints[hitIndex];
    this.tooltipComponent.show(
      { x: hit.x, y: hit.y }, // Lock tooltip position anchor straight onto the node center
      {
        title: hit.item.label,
        value: hit.item.value,
        color: hit.color
      },
      this.theme
    );
  }

  /**
   * Internal downsampling algorithm to protect rendering performance on heavy data pipelines.
   */
  private downsampleData(rawSrc: IDataPoint[], targetBucketSize: number): IDataPoint[] {
    if (rawSrc.length <= targetBucketSize) return rawSrc;

    const sampled: IDataPoint[] = [];
    sampled.push(rawSrc[0]);

    const bucketWidth = (rawSrc.length - 2) / (targetBucketSize - 2);

    for (let i = 0; i < targetBucketSize - 2; i++) {
      const startIdx = Math.floor(i * bucketWidth + 1);
      const endIdx = Math.floor((i + 1) * bucketWidth + 1);

      let maxVal = -Infinity;
      let minVal = Infinity;
      let maxObj = rawSrc[startIdx];
      let minObj = rawSrc[startIdx];

      for (let j = startIdx; j < endIdx; j++) {
        if (j >= rawSrc.length) break;
        const curr = rawSrc[j];
        if (curr.value > maxVal) {
          maxVal = curr.value;
          maxObj = curr;
        }
        if (curr.value < minVal) {
          minVal = curr.value;
          minObj = curr;
        }
      }

      if (rawSrc.indexOf(minObj) < rawSrc.indexOf(maxObj)) {
        sampled.push(minObj);
        sampled.push(maxObj);
      } else {
        sampled.push(maxObj);
        sampled.push(minObj);
      }
    }

    sampled.push(rawSrc[rawSrc.length - 1]);
    return sampled;
  }
}
