import { Chart } from '@core/Chart';
import { Tooltip } from '@components/Tooltip';
import type { IDataPoint, IChartOptions } from '@_types/data';
import type { IPieSliceData } from '../pie/PieMath';

export abstract class PolarChart extends Chart<IDataPoint> {
  protected tooltipComponent: Tooltip;
  protected sliceInteractiveZones: { slice: IPieSliceData; color: string }[] = [];
  protected activeHoverIndex = -1;
  protected radiusRatio = 0.85;

  constructor(containerId: string, data: IDataPoint[], options: IChartOptions = {}) {
    super(containerId, data, options);
    this.tooltipComponent = new Tooltip(this.container);

    this.setupPolarInteractions();
  }

  /**
   * Tracks structural angular layout collisions using Euclidean metrics inside a circle
   */
  private setupPolarInteractions(): void {
    this.canvasManager.element.addEventListener('mousemove', (e: MouseEvent) => {
      if (!Array.isArray(this.data) || this.data.length === 0) return;

      const mouse = this.canvasManager.getMouseCoordinates(e);
      const { centerX, centerY, outerRadius } = this.getPolarMetrics();

      const dx = mouse.x - centerX;
      const dy = mouse.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      let hitIndex = -1;

      // Base radial ceiling barrier constraint match validation
      if (this.validateRadiusDistance(distance, outerRadius)) {
        let hoverAngle = Math.atan2(dy, dx);
        if (hoverAngle < -Math.PI / 2) {
          hoverAngle += 2 * Math.PI;
        }

        this.sliceInteractiveZones.forEach((zone, index) => {
          if (hoverAngle >= zone.slice.startAngle && hoverAngle <= zone.slice.endAngle) {
            hitIndex = index;
          }
        });
      }

      if (hitIndex !== this.activeHoverIndex) {
        this.activeHoverIndex = hitIndex;
        this.render();
      }

      if (hitIndex !== -1) {
        const hit = this.sliceInteractiveZones[hitIndex];
        this.tooltipComponent.show(
          { x: mouse.x, y: mouse.y },
          {
            title: hit.slice.label,
            value: hit.slice.value,
            color: hit.color
          },
          this.theme
        );
        this.canvasManager.element.style.cursor = 'pointer';
      } else {
        this.tooltipComponent.hide();
        this.canvasManager.element.style.cursor = 'default';
      }
    });

    this.canvasManager.element.addEventListener('mouseleave', () => {
      this.tooltipComponent.hide();
      this.canvasManager.element.style.cursor = 'default';
      if (this.activeHoverIndex !== -1) {
        this.activeHoverIndex = -1;
        this.render();
      }
    });
  }

  /**
   * Helper utility calculating shared central coordinate anchors and max dynamic layouts
   */
  protected getPolarMetrics() {
    const centerX = this.margin.left + this.chartWidth / 2;
    const centerY = this.margin.top + this.chartHeight / 2;
    const outerRadius = (Math.min(this.chartWidth, this.chartHeight) / 2) * this.radiusRatio;
    return { centerX, centerY, outerRadius };
  }

  /**
   * Extensible distance evaluation method allowing Donut custom internal radius barriers
   */
  protected validateRadiusDistance(distance: number, outerRadius: number): boolean {
    return distance <= outerRadius;
  }
}
