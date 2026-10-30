import type { Point } from '@_types/data';
import type { IChartTheme } from '@_types/theme';

export interface ITooltipData {
  title: string;
  value: string | number;
  color?: string;
}

export class Tooltip {
  private element: HTMLDivElement;
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;

    // Enforce relative positioning layout configuration on the parent container box
    // to anchor our absolute floating positions inside its bounding limits
    if (window.getComputedStyle(this.container).position === 'static') {
      this.container.style.position = 'relative';
    }

    // Generate the floating container element structure dynamically inside the DOM tree
    this.element = document.createElement('div');
    this.setupStyles();
    this.container.appendChild(this.element);
    this.hide();
  }

  /**
   * Applies functional structural styling definitions directly onto our element layer.
   */
  private setupStyles(): void {
    Object.assign(this.element.style, {
      position: 'absolute',
      pointerEvents: 'none', // Critical: passes mouse move triggers straight back into the canvas layer
      padding: '8px 12px',
      borderRadius: '6px',
      fontFamily: 'sans-serif',
      fontSize: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      transition: 'opacity 0.15s ease, transform 0.05s linear',
      zIndex: '9999',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    });
  }

  /**
   * Refreshes inner variables and updates position tracking bounds.
   */
  public show(mousePos: Point, data: ITooltipData, theme: IChartTheme): void {
    // Generate inner DOM structure templates cleanly
    const colorBadge = data.color ? `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:${data.color};margin-right:6px;"></span>` : '';

    // Dynamically assign layout border and colors matching the current theme variables
    this.element.style.backgroundColor = theme.tooltipBg;
    this.element.style.color = theme.tooltipText;
    this.element.style.border = `1px solid ${theme.tooltipBorder}`;

    this.element.innerHTML = `
      <div style="font-weight: bold; color: ${theme.textSecondary}; margin-bottom: 2px;">${data.title}</div>
      <div style="display: flex; align-items: center; font-size: 13px;">
        ${colorBadge}<span>${data.value.toLocaleString()}</span>
      </div>
    `;

    // Positional Offset Logic: Place tooltip slightly above and to the right of the mouse pointer
    const offsetX = 15;
    const offsetY = -45;

    // this.element.style.opacity = '1';
    this.element.style.display = 'block';

    // this.element.style.left = `${mousePos.x + offsetX}px`;

    // Calculate the maximum allowed left position to stay on screen
    // const leftPos = mousePos.x + offsetX;
    const tooltipWidth = this.element.offsetWidth;
    const containerWidth = this.container.offsetWidth; //window.innerWidth;
    const maxLeft = containerWidth - tooltipWidth;
    this.element.style.left = `${Math.min(mousePos.x + offsetX, maxLeft)}px`; // Clamp the value so it never goes past the right edge

    this.element.style.top = `${mousePos.y + offsetY}px`;
  }

  /**
   * Hides the tooltips from view cleanly.
   */
  public hide(): void {
    // this.element.style.opacity = '0';
    this.element.style.display = 'none';
  }
}
