/**
 * TYCS Charting Library Master Entry Point
 *
 * This file handles all public module exports. It registers individual components
 * to enable both standard ES Module tree-shaking and seamless global UMD browser builds.
 */

// 1. Export Shared Type Contracts & Parameter Schemas
export type { Point, Margin, IDataPoint, IChartOptions, IRaceTimelineFrame } from '@_types/data';

export type { IChartTheme } from '@_types/theme';

export type { ITimelineCallbacks } from '@engines/race/Timeline';

// 2. Export Core Lifecycle and Pattern Managers
export { Chart } from './core/Chart';
export { ChartFactory } from './factory/ChartFactory';

// 3. Export Concrete Chart Engines (Strategy Pattern Modules)
export { BarChart } from '@engines/bar/BarChart';
export { LineChart } from '@engines/line/LineChart';
export { PieChart } from '@engines/pie/PieChart';
export { DonutChart } from '@engines/pie/DonutChart';
export { RaceChart } from '@engines/race/RaceChart';
export { Timeline } from '@engines/race/Timeline';

// 4. Export Modular Visual UI Sub-Components
export { Grid } from '@components/Grid';
export { Tooltip } from '@components/Tooltip';
export { Axis } from '@components/Axis';

// 5. Export Pure Computational Utilities
export { scaleLinear, lerp, calculateTicks } from '@utils/math';
export { getElementOrThrow, computeInnerDimensions } from '@utils/dom';
export { hexToRgba, blendHexColors } from '@utils/color';
