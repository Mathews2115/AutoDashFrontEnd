// ideas - keep track of background, active, etc colors!
// redraw if theme change
// TODO: make this be the one that contructs the scene

import * as PIXI from "pixi.js";
import PedalGauge from "./renderables/PedalGauge";
import RPMGauge from "./renderables/RPMGauge";
import { createRpmCluster, createSpeedoCluster } from "./renderHelpers";
import { Renderables } from "./renderables/Renderables"
import SpeedoSweep from "./renderables/SpeedoSweep";
import SpeedoReadout from "./renderables/SpeedoReadout";
import BorderWarnings from "./renderables/BorderWarnings";
import { DATA_KEYS, WARNING_KEYS } from "./dataMap";
import theme from "./common/theme";
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

    /** @type {theme} */
    this.theme = theme;
    this.state = (/** @type {Object} */ updatedGaugeData) => {};

    this.renderables = new Renderables({
      renderer: this.renderer,
      theme: this.theme,
    });
  }

  initialize() {
    const pedalGauge = this.renderables.createRenderable(PedalGauge);
    const rpmGauge = this.renderables.createRenderable(RPMGauge);
    const speedoSpeed = this.renderables.createRenderable(SpeedoSweep);
    const speedoReadout = this.renderables.createRenderable(SpeedoReadout);
    const borderWarnings = this.renderables.createRenderable(BorderWarnings);
    createRpmCluster(pedalGauge, rpmGauge, this);
    createSpeedoCluster(speedoSpeed, speedoReadout, rpmGauge, this);
    this.stage.addChild(borderWarnings);
    this.renderables.initializeAll();
    
    // start rendering
    this.state = this.stateStartup;
  }

  update(updatedGaugeData) {
    this.state(updatedGaugeData);
    this.renderer.render(this.stage);
  }

  /**
   * 
   * @param {Array} updatedGaugeData 
   */
  stateRunning(updatedGaugeData) {
    DATA_KEYS
    this.renderables.forEach(renderable => {
      renderable.value = renderable.dataKey != undefined ? updatedGaugeData[renderable.dataKey] : updatedGaugeData;
    });

    this.renderables.updateAll();
    let commError = updatedGaugeData[DATA_KEYS.WARNINGS] & (128 >> WARNING_KEYS.COMM_ERROR  % 8)
    if (commError && !this.stage.filters) {
      this.stage.filters = [glitchFilter];
      refreshGlitch();
    } else if(glitchinterval && !commError) {
      clearTimeout(glitchinterval);
      this.stage.filters = null;
    }     
  }

  stateStartup(_updatedGaugeData) {
    this.renderables.updateAll();
    setTimeout(() => {
      this.state = this.stateRunning;
    }, 1000);
  }

  stateShutdown(updatedGaugeData) {
    // show MPG stats?
  }
}
