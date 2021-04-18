// ideas - keep track of background, active, etc colors!
// redraw if theme change
// TODO: make this be the one that contructs the scene

import * as PIXI from "pixi.js";
import { PedalGauge } from "../js/gauges/PedalGauge";
import { PEDAL_CONFIG, RPM_CONFIG, SCREEN, DEFAULT_COLORS } from "./appConfig";
import { RPMGauge } from "./gauges/RPMGauge";

//Aliases
let Container = PIXI.Container;

const MODES = { TEST: "test", LIVE: "live" };

export class DashApp {
  /**
   * @param { PIXI.Renderer } renderer
   * @param { PIXI.Ticker } ticker
   */
  constructor(renderer, ticker) {
    this.renderer = renderer;
    this.ticker = ticker;
    this.stage = new PIXI.Container();
    this.stage.interactiveChildren = false; // dont bother checking anyone for interactions

    this.setColors();
    this.state = (/** @type {Number} */ delta) => {};
  }

  setColors() {
    this.theme = {
      gaugeBgColor: DEFAULT_COLORS.gaugeBgColor,
      gaugeActiveColor: DEFAULT_COLORS.gaugeActiveColor,
      dangerColor: DEFAULT_COLORS.dangerColor,
      warningColor: DEFAULT_COLORS.warningColor,
      nominalColor: DEFAULT_COLORS.nominalColor,
    };
  }

  initialize() {
    // initialize all children
    // TODO; iterate through each draw objects children
    // this.children.forEach(drawable => {
    //   if ("initialize" in drawable) {
    //     drawable.initialize();
    //   }
    // });
    // RPM container
    const rpmCluster = new Container();
    rpmCluster.x = SCREEN.BORDER_WIDTH;
    rpmCluster.y = SCREEN.BORDER_WIDTH;

    this.pedalGauge = new PedalGauge({
      renderer: this.renderer,
      theme: this.theme,
    });
    this.rpmGauge = new RPMGauge({
      renderer: this.renderer,
      theme: this.theme,
    });
    this.rpmGauge.x = this.pedalGauge.gaugeWidth + SCREEN.PADDING;
    rpmCluster.addChild(this.pedalGauge, this.rpmGauge);


    // create other clusters...
    this.stage.addChild(rpmCluster);

    this.rpmGauge.initialize();
    this.pedalGauge.initialize();

    // start rendering
    this.state = this.stateTesting; //this.stateStartup;
    this.ticker.maxFPS = 46;
    this.ticker.add((delta) => this.drawLoop(delta));
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
    if (this.pedalGauge.value == PEDAL_CONFIG.MAX) {
      this.pedalGauge.testGoBackwards = true;
    } else if (this.pedalGauge.value == PEDAL_CONFIG.MIN) {
      this.pedalGauge.testGoBackwards = false;
    }

    this.pedalGauge.value =
      this.pedalGauge.value + (this.pedalGauge.testGoBackwards ? -1 : 1);
    this.pedalGauge.update(delta);

    if (this.rpmGauge.value == RPM_CONFIG.MAX) {
      this.rpmGauge.testGoBackwards = true;
    } else if (this.rpmGauge.value == RPM_CONFIG.MIN) {
      this.rpmGauge.testGoBackwards = false;
    }
    this.rpmGauge.value =
      this.rpmGauge.value + (this.rpmGauge.testGoBackwards ? -50 : 50);
    this.rpmGauge.update(delta);
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
