// ideas - keep track of background, active, etc colors!
// redraw if theme change
// TODO: make this be the one that contructs the scene

import * as PIXI from "pixi.js";
import layoutManager from "./layoutManager";
import { DATA_KEYS, WARNING_KEYS } from "./common/dataMap";
import { GlitchFilter } from "@pixi/filter-glitch";

const glitchFilter = new GlitchFilter({
  slices: 10,
  seed: 0.5,
  blue: [-2,0],
  red: [-4, 5],
  green: [1, -1]
});
let glitchinterval = null;
const refreshGlitch = () => {
  glitchFilter.refresh();
  glitchinterval = setTimeout(refreshGlitch, Math.floor(Math.random() * 900) + 100);
}

export class DashApp {
  /**
   * @param { PIXI.Renderer } renderer
   */
  constructor(renderer) {
    this.renderer = renderer;
    this.stage = new PIXI.Container();
    this.stage.interactiveChildren = false; // dont bother checking anyone for interactions
    this.layoutManager = layoutManager(this);
    this.state = (/** @type {Object} */ updatedGaugeData) => {};
  }

  initialize() {
    this.layoutManager.renderables.initializeAll();
    this.layoutManager.createLayout();
   
    // start rendering
    this.state = this.stateStartup;
  }

  update(updatedGaugeData) {
    this.state(updatedGaugeData);
    this.renderer.render(this.stage);
  }

  /**
   * Main state of the app; shows all the gauges
   * @param {Array} updatedGaugeData 
   */
  stateRunning(updatedGaugeData) {
    DATA_KEYS
    this.layoutManager.renderables.forEach(renderable => {
      renderable.value = renderable.dataKey != undefined ? updatedGaugeData[renderable.dataKey] : updatedGaugeData;
    });

    this.layoutManager.renderables.updateAll();
    let commError = updatedGaugeData[DATA_KEYS.WARNINGS] & (128 >> WARNING_KEYS.COMM_ERROR  % 8)
    if (commError && !this.stage.filters) {
      this.stage.filters = [glitchFilter];
      refreshGlitch();
    } else if(glitchinterval && !commError) {
      clearTimeout(glitchinterval);
      this.stage.filters = null;
    }     
  }

  /**
   *  Start of the Dash; shows all gauges but each gauge is maxed out
   */
  stateStartup(_updatedGaugeData) {
    this.layoutManager.renderables.updateAll();
    setTimeout(() => {
      this.state = this.stateRunning;
    }, 1000);
  }

  stateShutdown(updatedGaugeData) {
    // show MPG stats?
  }
}
