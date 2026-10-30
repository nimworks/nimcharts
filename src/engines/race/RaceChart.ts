import { Chart } from '@core/Chart';
import { Tooltip } from '@components/Tooltip';
import { Axis } from '@components/Axis';
import type { IRaceTimelineFrame, IChartOptions } from '@_types/data';
import { Timeline } from './Timeline';
import { lerp, scaleLinear } from '@utils/math';
import { blendHexColors } from '@utils/color';

interface IRenderableBar {
  label: string;
  value: number;
  rank: number;
  color: string;
}

interface IRaceInteractiveZone {
  label: string;
  value: number;
  color: string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export class RaceChart extends Chart<IRaceTimelineFrame> {
  private timeline: Timeline;
  private tooltipComponent: Tooltip;
  private axisComponent: Axis;
  private currentBars: Map<string, IRenderableBar> = new Map();
  private raceInteractiveZones: IRaceInteractiveZone[] = [];

  private currentPeriod: string | number = '';
  private maxVisibleBars = 10;

  constructor(containerId: string, frames: IRaceTimelineFrame[], options: IChartOptions = {}) {
    // super(containerId, frames as any, options);
    // super(containerId, frames as IRaceTimelineFrame[], options);
    super(containerId, frames, options);

    this.tooltipComponent = new Tooltip(this.container);
    this.axisComponent = new Axis({ tickCount: 5 });

    this.timeline = new Timeline(frames, options.animationDuration ?? 1500, {
      onTick: (current, next, alpha) => this.processAnimationFrame(current, next, alpha)
    });

    this.timeline.reset();
    this.setupInteractions();

    // this.handleResize(); //instead of executing this in Chart.ts, we do it here since we have to initialize Axis before calling render()
  }

  private setupInteractions(): void {
    this.canvasManager.element.addEventListener('mousemove', (e: MouseEvent) => {
      const mouse = this.canvasManager.getMouseCoordinates(e);

      const hit = this.raceInteractiveZones.find((zone) => mouse.x >= zone.xMin && mouse.x <= zone.xMax && mouse.y >= zone.yMin && mouse.y <= zone.yMax);

      if (hit) {
        this.tooltipComponent.show(
          { x: mouse.x, y: mouse.y },
          {
            title: hit.label,
            value: Math.round(hit.value),
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
    });
  }

  /* private processAnimationFrame(
    currentFrame: IRaceTimelineFrame,
    nextFrame: IRaceTimelineFrame | null,
    alpha: number
  ): void {
    this.currentPeriod = currentFrame.period;

    const nextDataMap = new Map<string, number>();
    if (nextFrame) {
      nextFrame.data.forEach(d => nextDataMap.set(d.label, d.value));
    }

    const frameData = currentFrame.data.map((item) => {
      const startValue = item.value;
      const endValue = nextFrame ? (nextDataMap.get(item.label) ?? 0) : startValue;
      
      return {
        label: item.label,
        interpolatedValue: lerp(startValue, endValue, alpha),
        overrideColor: item.color
      };
    });

    frameData.sort((a, b) => b.interpolatedValue - a.interpolatedValue);

    frameData.forEach((item, sortedIndex) => {
      const existing = this.currentBars.get(item.label);
      
      const startRank = existing ? existing.rank : sortedIndex;
      const endRank = sortedIndex;
      const interpolatedRank = lerp(startRank, endRank, alpha);

      this.currentBars.set(item.label, {
        label: item.label,
        value: item.interpolatedValue,
        rank: interpolatedRank,
        color: item.overrideColor ?? existing?.color ?? 
               this.theme.fallbackColors[this.currentBars.size % this.theme.fallbackColors.length]
      });
    });

    this.render();
  } */

  /**
   * Processes the tween state between two timeline milestones.
   * Maps changing values, vertical ranks, and hex color palettes dynamically.
   */
  private processAnimationFrame(currentFrame: IRaceTimelineFrame, nextFrame: IRaceTimelineFrame | null, alpha: number): void {
    this.currentPeriod = currentFrame.period;

    // 1. Map target destination details cleanly for quick reference lookups
    const nextDataMap = new Map<string, { value: number; color?: string }>();
    if (nextFrame) {
      nextFrame.data.forEach((d) => {
        nextDataMap.set(d.label, { value: d.value, color: d.color });
      });
    }

    // 2. Calculate active intermediate frame transformations
    const frameData = currentFrame.data.map((item, index) => {
      const startValue = item.value;
      const startColor = item.color ?? this.theme.fallbackColors[index % this.theme.fallbackColors.length];

      // Resolve targets if next timeline frame exists, else fallback to current baseline
      const nextItem = nextFrame ? nextDataMap.get(item.label) : null;
      const endValue = nextItem ? nextItem.value : startValue;
      const endColor = nextItem?.color ?? startColor;

      // LINEAR COLOR TRANSITION BLENDING:
      // Smoothly morph between the starting color and destination color matching clock progression weights (alpha)
      const morphedColor = blendHexColors(startColor, endColor, alpha);

      return {
        label: item.label,
        interpolatedValue: lerp(startValue, endValue, alpha),
        color: morphedColor
      };
    });

    // 3. Descending sort to compute continuous floating layout slot ranks
    frameData.sort((a, b) => b.interpolatedValue - a.interpolatedValue);

    // 4. Commit calculations smoothly back into the active master map
    frameData.forEach((item, sortedIndex) => {
      const existing = this.currentBars.get(item.label);

      const startRank = existing ? existing.rank : sortedIndex;
      const endRank = sortedIndex;
      const interpolatedRank = lerp(startRank, endRank, alpha);

      this.currentBars.set(item.label, {
        label: item.label,
        value: item.interpolatedValue,
        rank: interpolatedRank,
        color: item.color // Push the dynamically blended intermediate color out to the canvas loop
      });
    });

    // 5. Force active frame repaint pass
    this.render();
  }

  public render(): void {
    //since parent class Chart.ts calls render() via handleResize() inside it's constructor, it may fire before this class instantiates Grid & Axis
    if (!this.axisComponent) return;

    this.clear();
    this.raceInteractiveZones = [];

    const barsArray = Array.from(this.currentBars.values());
    if (barsArray.length === 0) return;

    const currentMaxVal = Math.max(...barsArray.map((b) => b.value), 1);

    const xScale = scaleLinear([0, currentMaxVal], [this.margin.left, this.margin.left + this.chartWidth * 0.82]);

    const totalSlots = Math.min(barsArray.length, this.maxVisibleBars);
    const barHeight = (this.chartHeight / totalSlots) * 0.75;
    const slotGap = this.chartHeight / totalSlots;

    barsArray.forEach((bar) => {
      if (bar.rank >= this.maxVisibleBars) return;

      const y = this.margin.top + bar.rank * slotGap;
      const startX = this.margin.left;
      const targetWidth = xScale(bar.value) - startX;

      this.ctx.fillStyle = bar.color;
      this.ctx.fillRect(startX, y, targetWidth, barHeight);

      this.raceInteractiveZones.push({
        label: bar.label,
        value: bar.value,
        color: bar.color,
        xMin: startX,
        xMax: startX + targetWidth,
        yMin: y,
        yMax: y + barHeight
      });

      this.ctx.fillStyle = this.theme.textPrimary;
      this.ctx.font = 'bold 12px sans-serif';
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(bar.label, startX - 10, y + barHeight / 2);

      this.ctx.textAlign = 'left';
      this.ctx.fillStyle = this.theme.textSecondary;
      this.ctx.fillText(Math.round(bar.value).toLocaleString(), startX + targetWidth + 10, y + barHeight / 2);
    });

    this.axisComponent.drawXBaseline(this.ctx, this.margin, this.chartWidth, this.chartHeight, this.theme);
    this.drawPeriodWatermark();
  }

  private drawPeriodWatermark(): void {
    this.ctx.save();
    this.ctx.fillStyle = this.options.theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
    this.ctx.font = 'bold 72px sans-serif';
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'bottom';
    this.ctx.fillText(this.currentPeriod.toString(), this.margin.left + this.chartWidth, this.margin.top + this.chartHeight);
    this.ctx.restore();
  }

  public startRace(): void {
    this.timeline.play();
  }
  public pauseRace(): void {
    this.timeline.pause();
  }
  public resetRace(): void {
    this.timeline.reset();
  }
}
