import { SCREEN, SPEEDO_CONFIG } from "../appConfig";
import { DATA_MAP } from "../common/dataMap";
import Renderable from "./Renderable";
import { RENDER_KEYS } from "./Renderables";
import { NO_DISPLAY, WARNING_DASH, renderDigitTextures, createDigitSprites, formatSprites } from "../common/createDigit";
import { Texture } from "pixi.js";
const GPS_KEY = DATA_MAP.GPS_SPEEED.id;
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

  // the data store values we want to listen too
  get dataKey() {
    return GPS_KEY;
  }

  set value(newValue) {
    if (newValue == null || newValue < SPEEDO_CONFIG.MIN) {
      this._value = -1;
    } else if (newValue > SPEEDO_CONFIG.MAX) {
      this._value = SPEEDO_CONFIG.MAX;
    } else {
      this._value = Math.floor(newValue);
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
      if (this.renderedValue == -1) {
        this.numberSprites.forEach((sprite) => sprite.texture = this.numberTextures[WARNING_DASH]);
      } else {
        this.numberSprites[1].texture = this.numberTextures[this.renderedValue%10]
        const tenthsDigit = Math.floor(this.renderedValue/10) || NO_DISPLAY
        this.numberSprites[0].texture = this.numberTextures[tenthsDigit]
      }
    }
  }
}

SpeedoReadout.ID = ID;
export default SpeedoReadout;
