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
  OIL_PRESSURE: 11,
  VOLTAGE_READOUT: 12,
  MAT_READOUT: 13,
  IGN_TIMING_MAP: 14,
  CTS_READOUT: 15,
  FUEL_MAP: 16,
  FULL_SCREEN_WARNING: 17,
  IGN_TIMING_READOUT: 18,
  MAP_READOUT: 19,
  OFFLINE:20,
  // CLOSED_LOOP_READOUT: 19,
  // CLOSED_LOOP_COMP_READOUT: 20,
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
  refreshAll(theme) {
    this.theme = theme;
    for(let i = 0; i < this.length; i++) {
      this[i].theme = this.theme;
      this[i].initialize()
    }
  }
  initializeAll() {
    for(let i = 0; i < this.length; i++) {
      this[i].initialize();
    }
  }
  updateAll() {
    for(let i = 0; i < this.length; i++) {
      this[i].update(Date.now());
    }
  }
}
