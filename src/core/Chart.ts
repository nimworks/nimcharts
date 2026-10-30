import type {
  IChartOptions,
  // IDataPoint,
  Margin
} from '@_types/data';
import { type IChartTheme, DARK_THEME, LIGHT_THEME } from '@_types/theme';
import { CanvasManager } from './Canvas';
import { getElementOrThrow } from '@utils/dom';

/**
 * Parent class for all charts
 * @typeParam T - Type of input data
 */
export abstract class Chart<T> {
  protected container: HTMLElement;
  protected canvasManager: CanvasManager;
  protected ctx: CanvasRenderingContext2D;
  protected data: T[]; //IDataPoint[];
  protected options: Required<IChartOptions>;
  protected theme: IChartTheme;

  protected chartWidth = 0;
  protected chartHeight = 0;
  protected margin: Margin;

  // constructor(containerId: string, data: IDataPoint[], options: IChartOptions = {}) {
  constructor(containerId: string, data: T[], options: IChartOptions = {}) {
    // const el = document.getElementById(containerId);
    // if (!el) {
    //   throw new Error(`Chart Engine Error: Element with id "${containerId}" was not found.`);
    // }
    // this.container = el;
    this.container = getElementOrThrow(containerId);
    this.data = data;

    this.options = {
      width: options.width ?? 'auto',
      height: options.height ?? 400,
      margin: options.margin ?? {},
      theme: options.theme ?? 'light',
      animate: options.animate ?? true,
      animationDuration: options.animationDuration ?? 800,
      maxRenderPoints: options.maxRenderPoints ?? 200
    };

    this.margin = {
      top: this.options.margin.top ?? 40,
      right: this.options.margin.right ?? 40,
      bottom: this.options.margin.bottom ?? 40,
      left: this.options.margin.left ?? 50
    };

    this.theme = this.options.theme === 'dark' ? DARK_THEME : LIGHT_THEME;

    // Instantiate our decoupled low-level layout manager agent
    this.canvasManager = new CanvasManager(this.container, this.options.height, this.options.width, () => this.handleResize());

    // Bind context reference shortcut to support backwards compatibility inside subclasses
    this.ctx = this.canvasManager.ctx;

    // Trigger initial layout parameters and scaling pipelines execution
    this.handleResize(true); //skip calling render() inside this fn since it is overridden by chart engines extending this class and may need to initialize few variables before render() is being called

    // Schedule the first paint after every subclass constructor has finished, so that fixed-width
    // charts (without a ResizeObserver) are also drawn immediately.
    queueMicrotask(() => this.render());
    // this had been moved to individual chart engines (BarChart, LineChart etc) which extend this Class,
    // since handleResize() may casue render function to execute before some items like for eg Grid and Axis are initialized within BarChart and LineChart
    // but instead of moving this to chart engines, we could simply check if the objects instantiated inside engines are undefined

    // instead, we can choose another way, ie to use a dedicated public method to do initial rendering.
    // this method is called after engine instance is created, making sure that the engines constructor has also run before executing the render() fn
    // like so ---- const myChart = new BarChart("chart-id", data, options).init(); or as last line inisde the construstor of chart engine like BarChart, LineChart etc

    //even more smart way is to execute handleResize() above but pass an argument to disallow render() from being called. Since it shall be triggered by chart engines (BarChart, LineChart etc)
  }

  // public init(): this {
  //   // all initialization fn executions can go here
  //   this.handleResize();
  //   return this;
  // }

  /**
   * Orchestrates resizing pipelines when called upon by the canvas manager tracker clock.
   */
  protected handleResize(skipRendering = false): void {
    //private handleResize(): void {
    const payload = this.canvasManager.resize(this.options.width, this.options.height, this.margin);

    // Cache updated metrics values cleanly
    this.chartWidth = payload.chartWidth;
    this.chartHeight = payload.chartHeight;

    // Execute paint loops
    if (!skipRendering) this.render();
  }

  /**
   * Wipes the canvas frame area cleanly using active theme color tokens.
   */
  protected clear(): void {
    this.ctx.fillStyle = this.theme.background;
    this.ctx.fillRect(0, 0, this.canvasManager.element.width, this.canvasManager.element.height);
  }

  // public updateData(newData: IDataPoint[]): void {
  public updateData(newData: T[]): void {
    this.data = newData;
    this.render();
  }

  public setTheme(newTheme: 'light' | 'dark'): void {
    this.options.theme = newTheme;
    this.theme = newTheme === 'dark' ? DARK_THEME : LIGHT_THEME;
    this.render();
  }

  public destroy(): void {
    this.canvasManager.destroy();
  }

  public abstract render(): void;
}
