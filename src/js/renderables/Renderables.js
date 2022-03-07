import * as PIXI from "pixi.js";

export const RENDER_KEYS = {
  RPM_GAUGE: 0,
  PEDAL_GAUGE: 1,
  SPEEDO_SWEEP: 2,
  SPEEDO_READOUT: 3,
  WARNING_BORDER: 4,
  FUEL_GAUGE: 5,
  ODOMETER: 6,
  MPG_GAUGE: 7,
  MPG_READOUT: 8,
  AVG_MPG_READOUT: 9,
  AVG_MPG_HISTOGRAM: 10,
};

export class Renderables extends Array {
  /**
   * @param {Object} options
   * @param {PIXI.Renderer} options.renderer
   * @param {import("../appConfig").ThemeData} options.theme
   */
  constructor({ renderer, theme }) {
    super();
    this.renderer = renderer;
    this.theme = theme;
  }

  createRenderable(RenderableClass, options = {}) {
    options = Object.assign({}, options, {
      renderer: this.renderer,
      theme: this.theme,
    });
    const renderable = new RenderableClass(options);
    return (this[renderable.dashID] = renderable);
  }
  /**
   * @param {import("../appConfig").ThemeData} theme
   */
  refresh(theme) {
    this.forEach((renderable) => {
      renderable.theme = this.theme;
      renderable.initialize(theme);
    });
  }
  initializeAll() {
    this.forEach((renderable) => renderable.initialize());
  }
  updateAll() {
    this.forEach((renderable) => renderable.update());
  }
}
