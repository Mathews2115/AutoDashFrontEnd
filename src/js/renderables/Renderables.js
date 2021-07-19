import * as PIXI from "pixi.js";
import theme from "../common/theme";

export const RENDER_KEYS = {
  RPM_GAUGE: 0,
  PEDAL_GAUGE: 1,
  SPEEDO_SWEEP: 2,
  SPEEDO_READOUT: 3,
  WARNING_BORDER: 4,
  FUEL_GAUGE: 5,
  ODOMETER: 6,
}

export class Renderables extends Array {
  /**
   * @param {Object} options
   * @param {PIXI.Renderer} options.renderer
   * @param {theme} options.theme
   */
  constructor({ renderer, theme }) {
    super();
    this.renderer = renderer;
    this.theme = theme;
  }

  createRenderable(RenderableClass) {
    const renderable = new RenderableClass({
      renderer: this.renderer,
      theme: this.theme,
    });
    return (this[renderable.dashID] = renderable);
  }

  initializeAll() {
    this.forEach((renderable) => renderable.initialize());
  }
  updateAll() {
    this.forEach((renderable) => renderable.update());
  }
}
