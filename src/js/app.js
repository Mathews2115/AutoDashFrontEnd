import * as PIXI from "pixi.js";
import layoutManager from "./layoutManager";
import { DATA_KEYS, WARNING_KEYS } from "./common/dataMap";
import { GlitchFilter } from "@pixi/filter-glitch";
import { THEMES } from "./common/theme";
// import FPSTextField from "./renderables/FPSTextField";


/**
 * @typedef Theme
 * @type {object}
 * @property {import("./appConfig").ThemeData} current
 * @property {null|import("./appConfig").ThemeData} changeRequested
 */

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
    /**
     * @type {Theme}
     */
    this.theme = {
      changeRequested: null,
      current: THEMES.dark
    }
    renderer.backgroundColor = this.theme.current.backgroundColor;
    this.renderer = renderer;
    this.stage = new PIXI.Container();
    this.stage.interactiveChildren = false; // dont bother checking anyone for interactions
    this.layoutManager = layoutManager({
      renderer: renderer,
      stage: this.stage,
      theme: this.theme.current
    });
    this.state = (/** @type {Object} */ updatedGaugeData) => {};
  }

  initialize() {
    this.layoutManager.createLayout();
    // this.stage.addChild(new FPSTextField());
    // start rendering
    PIXI.Ticker.shared.addOnce(() => {
      // setTimeout(() => {
      //   this.theme.changeRequested = THEMES.light;
      //   }, 4000);
      setTimeout(() => {
        this.state = this.stateRunning;
      }, 1000);
    });
    this.state = this.stateStartup;
  }

  onThemeChange() {
    this.theme.current = this.theme.changeRequested || THEMES.dark;
    this.theme.changeRequested = null;
    this.renderer.backgroundColor = this.theme.current.backgroundColor;
    this.layoutManager.refresh(this.theme.current);
  };

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

    if (this.theme.changeRequested) {
      this.onThemeChange();
    }

    this.layoutManager.renderables.updateAll();
    
    // let commError = updatedGaugeData[DATA_KEYS.WARNINGS] & (128 >> WARNING_KEYS.COMM_ERROR  % 8)
    // if (commError && !this.stage.filters) {
    //   // this.stage.filters = [glitchFilter];
    //   // refreshGlitch();
    // } else if(glitchinterval && !commError) {
    //   clearTimeout(glitchinterval);
    //   this.stage.filters = null;
    // }     
  }

  /**
   *  Start of the Dash; shows all gauges but each gauge is maxed out
   */
  stateStartup(_updatedGaugeData) {
    this.layoutManager.renderables.updateAll();
  }

  stateShutdown(updatedGaugeData) {
    // show MPG stats?
  }
}
