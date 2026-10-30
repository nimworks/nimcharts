import { Chart } from '@core/Chart';
import { Grid } from '@components/Grid';
import { Axis } from '@components/Axis';
import { Tooltip } from '@components/Tooltip';
import type { IDataPoint, IChartOptions } from '@_types/data';

export abstract class CartesianChart extends Chart<IDataPoint> {
  protected gridComponent: Grid;
  protected axisComponent: Axis;
  protected tooltipComponent: Tooltip;
  protected activeHoverIndex = -1;

  constructor(containerId: string, data: IDataPoint[], options: IChartOptions = {}) {
    super(containerId, data, options);

    // Core shared sub-components for all Cartesian layouts
    this.gridComponent = new Grid({ tickCount: 5, dashedLine: true, lineDash: [20, 20] });
    this.axisComponent = new Axis({ tickCount: 10 });
    this.tooltipComponent = new Tooltip(this.container);

    this.setupCartesianInteractions();
  }

  /**
   * Universal Cartesian Event Handling Pipeline
   */
  private setupCartesianInteractions(): void {
    this.canvasManager.element.addEventListener('mousemove', (e: MouseEvent) => {
      if (!Array.isArray(this.data) || this.data.length === 0) return;

      const mouse = this.canvasManager.getMouseCoordinates(e);
      const hitIndex = this.checkHitZone(mouse.x, mouse.y);

      if (hitIndex !== this.activeHoverIndex) {
        this.activeHoverIndex = hitIndex;
        this.render(); // Force re-render to update hover states / visual states
      }

      if (hitIndex !== -1) {
        this.handleTooltipShow(hitIndex, mouse);
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
   * The Central Orchestrated Lifecycle (Template Method Pattern)
   */
  public render(): void {
    // Structural guard condition to ensure components exist before paint cycles run
    if (!this.gridComponent || !this.axisComponent) return;

    this.clear();
    this.prepareRenderState();

    if (!Array.isArray(this.data) || this.data.length === 0) return;

    // Step 1: Calculate structural data ranges
    const renderData = this.getProcessedData();
    const maxValue = Math.max(...renderData.map((d) => d.value), 0);

    // Step 2: Render background grid infrastructure and Y Axis metrics
    this.gridComponent.draw(this.ctx, this.margin, this.chartWidth, this.chartHeight, maxValue, this.theme);
    this.axisComponent.drawY(this.ctx, this.margin, this.chartHeight, maxValue, this.theme);

    // Step 3: Delegate customized graphics painting down to the child strategy engine
    this.drawChartGraphics(renderData, maxValue);

    // Step 4: Render formal X baseline architecture overlay on top
    this.axisComponent.drawXBaseline(this.ctx, this.margin, this.chartWidth, this.chartHeight, this.theme);
  }

  /**
   * Hook for child components to drop, clean, or flush local caches before rendering
   */
  protected abstract prepareRenderState(): void;

  /**
   * Extensible hook for downsampling data models (like the Line Chart's LTTB implementation)
   */
  protected getProcessedData(): IDataPoint[] {
    return this.data;
  }

  /**
   * Deferred drawing logic tailored strictly to concrete representations (Bars, Lines, Areas)
   */
  protected abstract drawChartGraphics(renderData: IDataPoint[], maxValue: number): void;

  /**
   * Deferred collision resolution engine mapping coordinate matrices to indices
   */
  protected abstract checkHitZone(mouseX: number, mouseY: number): number;

  /**
   * Deferred absolute overlay data population mappings
   */
  protected abstract handleTooltipShow(hitIndex: number, mouseCoords: { x: number; y: number }): void;
}
