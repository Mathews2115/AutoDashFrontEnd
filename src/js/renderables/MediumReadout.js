
import '@pixi/graphics-extras';
import * as PIXI from "pixi.js";
import { renderDigitTextures, createDigitSprites, spaceSprites } from "../common/createDigit";
import Renderable from "./Renderable";

const NO_DISPLAY = 10;

class MediumReadout extends Renderable {
  constructor({ renderer, theme }) {
    super({ renderer, theme });
    this._value = 0;
    this.renderedValue = 0;
    /** @type {PIXI.Texture[]} */
    this.numberTextures = [];
    /** @type {PIXI.Sprite[]} */
    this.numberSprites = [];
  }

  set value(newValue) {
    if (newValue) this._value = Math.floor(newValue);
  }
  get gaugeHeight() {
    return 90;
  }

 initialize() {
    this.resetTextures();
    this.numberTextures = renderDigitTextures(this.appRenderer, this.theme, this.gaugeHeight);
    this.numberSprites = createDigitSprites(this.numberTextures, 2);

    this.addChild(...this.numberSprites);
    
    spaceSprites(this, this.numberSprites);
    
    // reverse the order so when iterating them, the index represents least to most significatnt digit
    this.numberSprites = this.numberSprites.reverse();
    this.initialized = true;
  }

  update() {
    if (this._value != this.renderedValue) {
      this.renderedValue = this._value;
      this.numberSprites.forEach((sprite, i) => {
        const digit = Math.floor(this.renderedValue / Math.pow(10,i)) % 10;
        sprite.texture = this.numberTextures[i && !digit ? NO_DISPLAY : digit];
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

export default MediumReadout;
