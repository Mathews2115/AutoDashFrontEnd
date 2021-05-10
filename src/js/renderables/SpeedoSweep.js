import * as PIXI from "pixi.js";
import { SCREEN, SPEEDO_CONFIG } from "../appConfig";
import { DATA_KEYS } from "../dataMap";
import Renderable from "./Renderable";
import { RENDER_KEYS } from "./Renderables";

const ID = RENDER_KEYS.SPEEDO_SWEEP;
const STATE_ENUM = {
  DANGER: 0,
  WARNING: 1,
  NORMAL: 2,
};

class SpeedoSweep extends Renderable {
  constructor({ renderer, theme }) {
    super({ renderer, theme });
    this._dashID = ID;

    this._value = SPEEDO_CONFIG.MAX;
    this.renderedValue = this._value;

    this._transformWidth = 0;
    this._foregroundTextures = new Array(3);
    this._storedfilters = new Array(3);
    this._activeColors = new Array(3);
    this._gaugeDisplayState = STATE_ENUM.DANGER;
  }

  // the data store values we want to listen too
  get dataKey() {
    return DATA_KEYS.SPEEDO;
  }

  set value(newValue) {
    if (newValue == null || newValue < SPEEDO_CONFIG.MIN) {
      this._value = SPEEDO_CONFIG.MIN;
    }
  }

  get activeColor() {
    return this._activeColors[this._gaugeDisplayState];
  }

  get activeFilter() {
    return this._storedfilters[this._gaugeDisplayState];
  }

  get activeTexture() {
    return this._foregroundTextures[this._gaugeDisplayState];
  }

  get gaugeWidth() {
    return SCREEN.SPEEDO_CLUSTER_WIDTH;
  }
  get gaugeHeight() {
    return SCREEN.SPEEDO_CLUSTER_HEIGHT;
  }

  initialize() {
    // colors
    this._activeColors[STATE_ENUM.NORMAL] = this.theme.gaugeActiveColor;
    this._activeColors[STATE_ENUM.WARNING] = this.theme.warningColor;
    this._activeColors[STATE_ENUM.DANGER] = this.theme.dangerColor;

    const barWidth = 0.25;
    const background = new PIXI.Graphics();
    background
      .beginFill(0xffffff)
      .lineStyle(0)
      .drawPolygon([
        0, this.gaugeHeight, // bottom left
        this.gaugeWidth * barWidth, this.gaugeHeight, // bottom right
        this.gaugeWidth * barWidth*2, this.gaugeHeight * barWidth, // angle up
        this.gaugeWidth, this.gaugeHeight  * barWidth, // bottom right end
        this.gaugeWidth, 0,
        this.gaugeWidth * 0.33, 0, 
      ])
      .endFill();

    ///////// background shape
    background.tint = this.theme.gaugeBgColor;
    this.addChild(background);
  }

  update() {}
}

SpeedoSweep.ID = ID;
export default SpeedoSweep;
