export const RENDER_KEYS = {
  RPM_GAUGE: 0,
  PEDAL_GAUGE: 1,
  SPEEDO_SWEEP: 2,
  SPEEDO_READOUT: 3
}

export class Renderables extends Array {
  constructor({ renderer, theme }) {
    super();
    this.renderer = renderer;
    this.theme = theme;
  }

  /**
   * 
   * @param {Object} RenderableClass 
   * @returns 
   */
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
