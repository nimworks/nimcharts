import type { Chart } from '@core/Chart';
import type { IDataPoint, IChartOptions } from '@_types/data';

// Dynamically imported engines inside factory scope to handle structural conversions
import { BarChart } from '@engines/bar/BarChart';
import { PieChart } from '@engines/pie/PieChart';
import { DonutChart } from '@engines/pie/DonutChart'; // Newly imported hollow ring strategy
import { LineChart } from '@engines/line/LineChart';

export class ChartFactory {
  /**
   * Spawns an instance of an explicit chart layout drawing engine subclass.
   *
   * This method encapsulates subclass constructor initialization pipelines, returning
   * a unified polymorphism representation of the abstract base Chart class contract.
   *
   * @param type String identifier parameter determining target chart format ('bar' | 'pie' | 'donut')
   * @param containerId The string ID of the HTML DOM container element wrapper
   * @param data Array dataset objects conforming to standard structure criteria
   * @param options Custom global appearance/animation adjustment parameters map
   * @returns An instantiated object extending the abstract Chart core template
   */
  public static create(type: 'bar' | 'pie' | 'donut' | 'line', containerId: string, data: IDataPoint[], options?: IChartOptions): Chart<IDataPoint> {
    switch (type) {
      case 'bar':
        return new BarChart(containerId, data, options);
      case 'pie':
        return new PieChart(containerId, data, options);
      case 'donut':
        return new DonutChart(containerId, data, options); // Wire the hollow vector chart cleanly
      case 'line':
        return new LineChart(containerId, data, options);
      default:
        // Enforce structural type assertions to handle invalid input edge cases
        // const exhaustiveCheck: never = type;
        throw new Error(`ChartFactory Error: Unknown chart visual layout format configuration identifier parsed.`);
    }
  }
}
