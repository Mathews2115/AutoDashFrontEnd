import { GlowFilter } from "@pixi/filter-glow";
import '@pixi/graphics-extras';
import * as PIXI from "pixi.js";
import { renderDigitTextures, createDigitSprites, spaceSprites } from "../common/createDigit";
import { DATA_KEYS } from "../common/dataMap";
import Renderable from "./Renderable";
import { RENDER_KEYS } from "./Renderables";

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
    /** @type {PIXI.Sprite[]} */
    this.numberSprites = [];
  }

  // the data store values we want to listen too
  get dataKey() {
    return DATA_KEYS.ODOMETER;
  }

  set value(newValue) {
    this._value = newValue;
  }
  get gaugeHeight() {
    return 60;
  }

  // MAGIC NUMBERS AHOY LOL - so much pixel chooching.  These numbers also depending on
  // renderhelpers.js placement.  Maybe I'll come back and make this less dumb...but I doubt it! :D :D :D    :|
  initialize() {
    this.resetTextures();
    this.numberTextures = renderDigitTextures(this.appRenderer, this.theme, this.gaugeHeight, 3);
    this.numberSprites = createDigitSprites(this.numberTextures, 5);

    this.addChild(...this.numberSprites);
    
    spaceSprites(this, this.numberSprites, 3);
    
    // reverse the order so when iterating them, the index represents least to most significatnt digit
    this.numberSprites = this.numberSprites.reverse();
    this.initialized = true;
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
  resetTextures() {
    if (this.initialized) {
      this.renderedValue = null;
      this.numberTextures.forEach(texture => texture.destroy(true));
      this.numberTextures = [];
      this.numberSprites.forEach(sprite => sprite.destroy(true));
      this.numberSprites = [];
      this.children.forEach((child) => {
        child.destroy({children: true, texture: true, baseTexture: true});
      });
      this.removeChild(...this.children);
    }
  }
}

Odometer.ID = ID;
export default Odometer;
