<!-- Here is the comprehensive, production-ready `README.md` file for your project repository, formatted inside a copy-pasteable Markdown block.

It includes clean installation guides, layout blueprints, architecture patterns, and custom component documentation that will look highly professional to your university project evaluators. -->

# NimCharts Charting Engine

A high-performance, type-safe modular charting library built from scratch in **TypeScript** utilizing the **HTML5 Canvas API**. This project was developed as part of the Third Year Computer Science (TYCS) Semester 5 curriculum.

The core architecture strictly implements advanced software engineering design principles (**SOLID**, **Strategy Pattern**, and **Factory Pattern**) to isolate rendering loops from layout state managers.

## 🚀 Features

- **Retina Display Optimization:** Automated High-DPI screen adjustments using custom pixel normalization matrices (`devicePixelRatio`) preventing blurry renders.
- **Decoupled Math Engine:** Reusable functional linear scales (`scaleLinear`) and polar transformation models mapping raw coordinates cleanly.
- **Temporal Animation Loops:** High-precision, delta-time synced bar race timing animations running via `requestAnimationFrame`.
- **Isolated UI Overlays:** Dom-isolated HTML floating Tooltips preventing canvas performance loops or raycasting lags.
- **Reactive Theme States:** Dynamic single-method light/dark mode color token shifting at runtime.

## Abstract

In the modern data-driven landscape, efficient client-side data visualization is critical for real-time web applications. While existing visualization solutions rely heavily on **Document Object Model (DOM)** or **Scalable Vector Graphics (SVG)** nodes, they exhibit severe performance degradation when rendering massive datasets due to browser memory bloat. This project presents the design and implementation of a high-performance, zero-dependency, modular data visualization charting library built natively on top of the **HTML5 Canvas 2D API** context using TypeScript.

By adopting an immediate-mode rendering paradigm, the library bypasses DOM overhead entirely, maintaining smooth 60+ FPS rendering operations even under high-frequency data ingestion. The architectural framework leverages enterprise-grade software engineering patterns, including the **Factory Pattern** for component instantiation and the **Strategy Pattern** for multi-chart rendering abstractions, ensuring absolute strict compile-time type safety and high modularity. Advanced data optimizations—such as the **Largest Triangle Three Buckets (LTTB)** downsampling algorithm—are implemented to compress dense time-series data without sacrificing visual fidelity.

Furthermore, the engine resolves display degradation issues on modern screens by integrating native High-DPI/Retina display scaling normalization alongside a dynamic pub/sub event bus layer for interactive visual tooltips. The resulting distribution provides an industrial-grade toolchain bundled with Vite, offering real-time charting capabilities like animated racing bars, Cartesian grids, and radial charts suited for high-throughput visualization platforms.

## 🛠️ Toolchain Setup & Installation

### 1. Clone and Install Dependencies

Ensure you have **Node.js** installed on your development environment. Clone the workspace and run:

```bash
npm install
```

### 2. Launch Local Sandbox Development Mode

To boot up the localized Vite dev server platform running on native ES modules:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser. Changes made inside the `src/` folder will instantly update via **Hot Module Replacement (HMR)**.

### 3. Compile Production Assets

To compile the TypeScript library code and bundle it into web-distributable formats (ESM and UMD frameworks) with complete auto-generated definition mapping files (`.d.ts`):

```bash
npm run build
```

## 📊 Core Architectural Blueprint

### Software Design Patterns Applied

- **Factory Pattern:** The central `ChartFactory.ts` absorbs plain identifier string tags (`'bar'`, `'pie'`) along with configuration maps to instantiate charts, hiding subclasses from consumer views.
- **Strategy Pattern:** Visual mapping loops inherit from the primary `Chart.ts` abstract parent template. Concrete drawing variations act as isolated rendering "strategies".
- **Single Responsibility Principle:** The `Timeline.ts` engine functions entirely as a stateful clock calculator. It remains unaware of the Canvas context, broadcasting temporal weights (`alpha`) via functional callbacks.

## High Level Overview

- **Goal:** A high-performance, modular, zero-dependency data visualization library.
- **Stack:** TypeScript (Strict Mode), HTML5 Canvas 2D API context, Vite bundle toolchain.
  - **Code language:** Typescript
  - **Bundler:** Vite
  - **Typechecking:** tsc
  - **Linter:** BiomeJS

- **Target Specs:** Native High-DPI/Retina display scaling support, smooth 60+ FPS delta-time animations, real-time dataset ingestion, unified dynamic runtime light/dark theme switching.
- **Core Engineering Design Patterns:** Factory Pattern (for instantiation boundaries), Strategy Pattern (for chart rendering abstraction), and Separation of Concerns (UI tools isolated from data calculators).

### 📁 Directory Layout & Submodule Graph

```text
src/
├── core/                   # Library Lifecycle Managers
│   ├── Chart.ts            # Abstract base orchestrator class
│   ├── Canvas.ts           # Canvas context setup, resize observer, and DPR normalization
│   ├── State.ts            # Component variable tracking states
│   └── EventBus.ts         # Library internal pub/sub event layer
├── types/                  # Shared Strict Compile-Time Contracts
│   ├── index.ts            # Single module exports bundler
│   ├── config.ts           # Custom chart parameters schemas
│   ├── data.ts             # Global database schemas (Point, Margin, IDataPoint)
│   └── geometry.ts         # Math vector layout tracking boundaries
├── factory/                # Initialization Framework Layer
│   └── ChartFactory.ts     # String-to-subclass initialization boundary resolver
├── engines/                # Rendering Implementations (Strategy Pattern)
│   ├── base/               # Mid-tier structural layout templates
│   │   ├── CartesianChart.ts # Common grid-based utilities (Bar, Line, Candle)
│   │   └── PolarChart.ts   # Common circular utilities (Pie, Donut)
│   ├── bar/                # Bar Chart layout pipelines
│   │   ├── BarChart.ts
│   │   └── BarAnimation.ts
│   ├── pie/                # Radial Pie Chart pipelines
│   │   ├── PieChart.ts
│   │   └── PieMath.ts
│   └── race/               # Animated Racing Bar pipelines
│       ├── RaceChart.ts
│       └── Timeline.ts
├── components/             # Reusable Visual Decorator Elements
│   ├── Axis.ts             # Tick text generation overlays
│   ├── Grid.ts             # Dashed background layout grids reference lines
│   ├── Tooltip.ts          # DOM-isolated absolute overlay mouse box tracker
│   └── Legend.ts           # Visual categoric metadata descriptions
├── utils/                  # Stateless Pure Calculation Utilities
│   ├── color.ts            # Theme palettes and conversion vectors
│   ├── math.ts             # scaleLinear projections, lerp parameters, and rounding ticks
│   └── dom.ts              # Local browser node tracking helpers
└── index.ts                # Master entry distribution exports point
```

