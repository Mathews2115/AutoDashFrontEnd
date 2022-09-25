import { GlowFilter } from "@pixi/filter-glow";
import '@pixi/graphics-extras';
import * as PIXI from "pixi.js";
import { renderDigitTextures, createDigitSprites, formatSprites } from "../common/createDigit";
import { DATA_MAP } from "../common/dataMap";
import Renderable from "./Renderable";
import { RENDER_KEYS } from "./Renderables";
const ODOMETER_KEY = DATA_MAP.ODOMETER.id;
const ID = RENDER_KEYS.ODOMETER;
class Odometer extends Renderable {
  constructor({ renderer, theme }) {
    super({ renderer, theme });
    this._dashID = ID;

    this._value = 99999;
    this.renderedValue = 0;
    this.bgSprite = null;
    /** @type {PIXI.Texture[]} */
    this.numberTextures = [];
    this.numberSprites = createDigitSprites(5);
  }

  // the data store values we want to listen too
  get dataKey() {
    return ODOMETER_KEY;
  }

  set value(newValue) {
    this._value = newValue;
  }
  get gaugeHeight() {
    return 60;
  }

  initialize() {
    this.renderedValue = 0;
    const textureData = renderDigitTextures(
      this.appRenderer, 
      this.theme, 
      this.gaugeHeight, 
      2);
    this.numberTextures = textureData.textures;
    if (!this.initialized) {
      this.addChild(...this.numberSprites);
      formatSprites(this, this.numberSprites, textureData);
      // reverse the order so when iterating them, the index represents least to most significatnt digit
      this.numberSprites = this.numberSprites.reverse();
      this.initialized = true;
    }
    this.numberSprites.forEach((sprite) => sprite.texture = this.numberTextures[8]);
  }

  update() {
    if (this._value != this.renderedValue) {
      this.renderedValue = this._value;
      this.numberSprites.forEach((sprite, i) => {
        const digit = Math.floor(this.renderedValue / Math.pow(10,i)) % 10;
        sprite.texture = this.numberTextures[digit];       
      });
    }
  }
}

Odometer.ID = ID;
export default Odometer;
