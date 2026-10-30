/** Represents a single coordinate in a 2D pixel space. */
export interface Point {
  x: number;
  y: number;
}

/** Defines the padding structure around the chart drawing canvas area. */
export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** A standard structural unit for simple static chart datasets (e.g., Bar Chart, Pie Chart). */
export interface IDataPoint {
  label: string;
  value: number;
  group?: string;
}

/** Global configuration options applicable to all chart types. */
export interface IChartOptions {
  width?: number | 'auto';
  height?: number;
  margin?: Partial<Margin>;
  theme?: 'light' | 'dark';
  animate?: boolean;
  animationDuration?: number;
  maxRenderPoints?: number; //mostly used by line-chart // Optional optimization limit threshold (e.g., max 200 paths)
}

// /**
//  * Represents a discrete, chronological snapshot of data metrics at a single point in time.
//  * This structure is utilized by the Timeline engine to compute real-time racing positions.
//  */
// export interface IRaceTimelineFrame {
//   period: string | number;
//   data: {
//     label: string;
//     value: number;
//     color?: string;
//   }[];
// }

/** Represents a discrete, chronological snapshot of data metrics at a single point in time.
 * This structure is utilized by the Timeline engine to compute real-time racing positions.
 */
export interface IRaceTimelineFrame {
  /** The explicit label identifier for this time frame milestone (e.g., "Year 2010", "Q1"). */
  period: string | number;

  /** The dataset array containing tracking metrics to be sorted and rendered during this frame. */
  data: {
    /** The unique name identifier of the metric tracking entity (e.g., "Python", "Java"). */
    label: string;

    /** The raw numerical value mapping the tracking entity's volume size at this milestone. */
    value: number;

    /** Optional explicit override hexadecimal color token for this entity across frames. */
    color?: string;
  }[];
}
