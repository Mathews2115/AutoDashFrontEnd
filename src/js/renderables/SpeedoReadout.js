import { SCREEN, SPEEDO_CONFIG } from "../appConfig";
import { DATA_MAP } from "../common/dataMap";
import Renderable from "./Renderable";
import { RENDER_KEYS } from "./Renderables";
import { renderDigitTextures, createDigitSprites, formatSprites } from "../common/createDigit";
import { Texture } from "pixi.js";
const GPS_KEY = DATA_MAP.GPS_SPEEED.id;
const SPEEDO_KEY = DATA_MAP.SPEEDO.id;
const SPEEDO_MODE_KEY = DATA_MAP.SPEEDO_MODE.id;
const NO_DISPLAY = 10;

const ID = RENDER_KEYS.SPEEDO_READOUT;
class SpeedoReadout extends Renderable {
  constructor({ renderer, theme }) {
    super({ renderer, theme });
    this._dashID = ID;
    this._value = SPEEDO_CONFIG.MAX;
    this.renderedValue = this._value;
    this.bgSprite = null;
    /** @type {Texture[]} */
    this.numberTextures = [];
    this.numberSprites = createDigitSprites(2);
  }

  // // the data store values we want to listen too
  // get dataKey() {
  //   debugger
  //   return SPEEDO_MODE_KEY === 0 ? SPEEDO_KEY : GPS_KEY;
  // }

  /**
   * @param {array | number} dataMap
   * @returns {number}
   */
  getSpeed(dataMap){
    return dataMap[SPEEDO_MODE_KEY] === 0? dataMap[SPEEDO_KEY] : dataMap[GPS_KEY];
  }

  /**
   * @param {array | number} newValue
   */
  set value(newValue) {
    const speed = this.getSpeed(newValue);
    if (speed == null || speed < SPEEDO_CONFIG.MIN) {
      this._value = SPEEDO_CONFIG.MIN;
    } else if (speed > SPEEDO_CONFIG.MAX) {
      this._value = SPEEDO_CONFIG.MAX;
    } else {
      this._value = Math.floor(speed);
    }
  }

  get gaugeHeight() {
    return SCREEN.SPEEDO_READOUT_HEIGHT;
  }

  initialize() {
    this.renderedValue = SPEEDO_CONFIG.MAX;
    const textureData = renderDigitTextures(this.appRenderer, this.theme, this.gaugeHeight, 5, true);
    this.numberTextures = textureData.textures;

    if (!this.initialized) {
      this.addChild(...this.numberSprites);
      formatSprites(this, this.numberSprites, textureData);
      this.initialized = true;
    }

    this.numberSprites.forEach((sprite) => sprite.texture = this.numberTextures[8]);
  }

  update() {
    if (this._value != this.renderedValue) {
      this.renderedValue = this._value;
      this.numberSprites[1].texture = this.numberTextures[this.renderedValue%10]

      const tenthsDigit = Math.floor(this.renderedValue/10) || NO_DISPLAY
      this.numberSprites[0].texture = this.numberTextures[tenthsDigit]
    }
  }
}

SpeedoReadout.ID = ID;
export default SpeedoReadout;
