import * as PIXI from "pixi.js";
import '@pixi/graphics-extras';
// import { GlowFilter } from "@pixi/filter-glow";
import { SCREEN, SPEEDO_CONFIG } from "../appConfig";
import { DATA_KEYS } from "../common/dataMap";
import Renderable from "./Renderable";
import { RENDER_KEYS } from "./Renderables";
import { renderDigitTextures, createDigitSprites, spaceSprites } from "../common/createDigit";

const NO_DISPLAY = 10;

const ID = RENDER_KEYS.SPEEDO_READOUT;
class SpeedoReadout extends Renderable {
  constructor({ renderer, theme }) {
    super({ renderer, theme });
    this._dashID = ID;

    this._value = SPEEDO_CONFIG.MAX;
    this.renderedValue = this._value;
    this.bgSprite = null;
    /** @type {PIXI.Texture[]} */
    this.numberTextures = [];
    /** @type {PIXI.Sprite[]} */
    this.numberSprites = [];
  }

  // the data store values we want to listen too
  get dataKey() {
    return DATA_KEYS.GPS_SPEEED;
  }

  set value(newValue) {
    if (newValue == null || newValue < SPEEDO_CONFIG.MIN) {
      this._value = SPEEDO_CONFIG.MIN;
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
    this.resetTextures();
    this.numberTextures = renderDigitTextures(this.appRenderer, this.theme, this.gaugeHeight, 20, true);
    this.numberSprites = createDigitSprites(this.numberTextures, 2);

    this.addChild(...this.numberSprites);
    
    spaceSprites(this, this.numberSprites, this.numberSprites[0].width/3 + SCREEN.PADDING);
    this.initialized = true;
  }

  update() {
    if (this._value != this.renderedValue) {
      this.renderedValue = this._value;
      this.numberSprites[1].texture = this.numberTextures[this.renderedValue%10]

      const tenthsDigit = Math.floor(this.renderedValue/10) || NO_DISPLAY
      this.numberSprites[0].texture = this.numberTextures[tenthsDigit]
    }
  }

  resetTextures() {
    if (this.initialized) {
      this.renderedValue = null;
      this.numberTextures.forEach(texture => texture.destroy(true));
      this.numberTextures = [];
      this.numberSprites.forEach(sprite => sprite.destroy({children: true, texture: true, baseTexture: true}));
      this.numberSprites = [];
      this.children.forEach((child) => {
        child.destroy({children: true, texture: true, baseTexture: true});
      });
      this.removeChild(...this.children);
    }
  }
}

SpeedoReadout.ID = ID;
export default SpeedoReadout;
