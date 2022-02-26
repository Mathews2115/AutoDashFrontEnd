// ideas - keep track of background, active, etc colors!
// redraw if theme change
// TODO: make this be the one that contructs the scene

import * as PIXI from "pixi.js";
import layoutManager from "./layoutManager";
import { DATA_KEYS, WARNING_KEYS } from "./common/dataMap";
import { GlitchFilter } from "@pixi/filter-glitch";

// Temporary FPS garbage; i'll actually add this in later (toggalable obviously)
// const DEFAULT_FONT_SIZE = 30;
// const DEFAULT_FONT_COLOR = 0xff0000;
// const _fpsTextField= PIXI.Text;
// const _fpsTicker=  PIXI.Ticker;
// let _timeValues= []
// let _lastTim= null;

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

    // temp FPS readout stuff
    // const defaultStyle = new PIXI.TextStyle({
    //   fontSize: DEFAULT_FONT_SIZE,
    //   fill: DEFAULT_FONT_COLOR,
    // });
    // this._timeValues = [];
    // this._lastTime = new Date().getTime();
    // this._fpsTextField = new PIXI.Text("", { ...defaultStyle, ...this.style });
    // this._fpsTicker = new PIXI.Ticker();
    // this._fpsTicker.add(() => {
    //     this.measureFPS();
    // });
    // this._fpsTicker.start();
  }

  // temp FPS readout stuff
  // style(style) {
  //   this._fpsTextField.style = style;
  // }
  // measureFPS()  {
  //   const currentTime = new Date().getTime();
  //   this._timeValues.push(1000 / (currentTime - this._lastTime));
  //   if (this._timeValues.length === 30) {
  //       let total = 0;
  //       for (let i = 0; i < 30; i++) {
  //           total += this._timeValues[i];
  //       }
  //       this._fpsTextField.text = (total / 30).toFixed(2);
  //       this._timeValues.length = 0;
  //   }
  //   this._lastTime = currentTime;
  // }

  initialize() {
    this.layoutManager.renderables.initializeAll();
    this.layoutManager.createLayout();
    // this.stage.addChild(this._fpsTextField);
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
      // this.stage.filters = [glitchFilter];
      // refreshGlitch();
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
