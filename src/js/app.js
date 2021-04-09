// ideas - keep track of background, active, etc colors!
// redraw if theme change
// TODO: make this be the one that contructs the scene

import * as PIXI from "pixi.js";
import { PedalGauge } from "../js/gauges/PedalGauge";
import { PEDAL_CONFIG, SCREEN } from "./appConfig";

//Aliases
let Container = PIXI.Container;

const DEFAULT_COLORS = {
  gaugeBgColor: 0x2b2b2b,
  gaugeActiveColor: 0xffffff,
  dangerColor: 0xf00,
  warningColor: 0xff7c00,
  nominalColor: 0x121be0,
};
const MODES = { TEST: "test", LIVE: "live" };

export class DashApp {
  /**
   * @param { PIXI.Application } app
   */
  constructor(app) {
    this.app = app;
    this.setColors();
    this.state = (/** @type {Number} */ delta) => {};

    this.pedalGauge = new PedalGauge({
      backgroundColor: this.gaugeBgColor,
      activeColor: this.gaugeActiveColor,
      renderer: this.app.renderer
    });
  }

  setColors() {
    this.gaugeBgColor = DEFAULT_COLORS.gaugeBgColor;
    this.gaugeActiveColor = DEFAULT_COLORS.gaugeActiveColor;
    this.dangerColor = DEFAULT_COLORS.dangerColor;
    this.warningColor = DEFAULT_COLORS.warningColor;
    this.nominalColor = DEFAULT_COLORS.nominalColor;
  }

  start() {
    // RPM container
    const rpmCluster = new Container();
    rpmCluster.x = SCREEN.BORDER_WIDTH;
    rpmCluster.y = SCREEN.BORDER_WIDTH;

    rpmCluster.addChild(this.pedalGauge);
    this.app.stage.addChild(rpmCluster);
    
    // start rendering
    this.state = this.stateTesting; //this.stateStartup;
    this.app.ticker.add((delta) => this.drawLoop(delta));
  }

  /**
   * @param {number} delta - milliseconds passed since last update
   */
  stateRunning(delta) {
    //call gauges animation function
  }

  /**
   * @param {number} delta - milliseconds passed since last update
   */
  stateStartup(delta) {
    // TODO; testing phase of gauages
    this.state = this.stateRunning;
  }

  /**
   * @param {number} delta - milliseconds passed since last update
   */
  stateTesting(delta) {
    // like startup but it just keeps going and going
    this.pedalGauge.value = this.pedalGauge.value + (delta*.1)
    this.pedalGauge.update(delta);
  }

  /**
   * @param {number} delta - milliseconds passed since last update
   */
  stateShutdown(delta) {
    // show MPG stats?
  }

  /**
   * @param {number} delta - milliseconds passed since last update
   */
  drawLoop(delta) {
    this.state(delta);
  }
}
