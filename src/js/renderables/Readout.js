import { Graphics, Sprite, Texture } from "pixi.js";
import {
  createDigitSprites,
  renderDigitTextures,
  formatSprites,
} from "../common/createDigit";
import Renderable from "./Renderable";

class Readout extends Renderable {
  static NO_DISPLAY = 10;
  constructor(
    { renderer, theme },
    {
      digits = 2,
      glowStrength = 2,
      createBackground = false, // makes it look like there are unlit LED segments
      decimalPlaces = 0,
      createSolidBackground = false, // creates asolid plain behind humber
    }
  ) {
    super({ renderer, theme });
    this._value = 88;
    this.renderedValue = null;
    /** @type {Texture[]} */
    this.numberTextures = [];
    this.numberSprites = createDigitSprites(digits);
    this.glowStrength = glowStrength;
    this.createBackground = createBackground;
    this.decimalPlaces = decimalPlaces;
    this.decimalSprite = new Sprite();
    this.digits = digits;
    this.firstNonDecimal = decimalPlaces ? digits - decimalPlaces : 1;
    if (createSolidBackground) this.backgroundPlane = new Graphics();

    // cache holders - i dont have proof (yet) but to prevent GC stuff; (creating objects mid function, we just assign it here)
    // this might be super pointless but it's worth a try
    this.currentDigit = 0;
    this.hideCurrentDigit = false;
    this._height = 60;
  }

  convertToNonDecimal(value) {
    // keep accuracy to the decimalPlaces but convert to a whole number
    return Math.round(value * Math.pow(10, this.decimalPlaces));
  }

  /**
   * @param {Number} newValue
   */
  set value(newValue) {
    if (newValue != null) this._value = this.convertToNonDecimal(newValue);
  }

  /**
   * @return {Number}
   */
  get gaugeHeight() {
    return this._height; // override this for different number sizes
  }
  set gaugeHeight(value) {
    this._height = value;
  }

  initialize() {
    this.renderedValue = null;
    const textureData = renderDigitTextures(
      this.appRenderer,
      this.theme,
      this.gaugeHeight,
      this.glowStrength,
      this.createBackground
    );
    this.numberTextures = textureData.textures;
    this.numberSprites.forEach((sprite) => (sprite.texture = this.numberTextures[8]));
    
    if (this.decimalPlaces) {
      this.decimalSprite.texture = this.numberTextures[this.numberTextures.length - 1];
    }

    if (!this.initialized) {
      this.initialized = true;
      this.addChild(...this.numberSprites);
      if (this.decimalPlaces) this.addChild(this.decimalSprite);
      formatSprites(this, this.numberSprites, textureData, this.decimalPlaces, this.decimalSprite);
      
      // so we can reference the sprites nicely in a forloop from least to msb
      this.numberSprites = this.numberSprites.reverse();

      if (this.backgroundPlane) {
        this.backgroundPlane
          .beginFill(0xffffff)
          .drawRect(0, 0, this.width, this.height)
          .endFill();
        this.addChildAt(this.backgroundPlane, 0);
        this.backgroundPlane.cacheAsBitmap = true;
      }
    }

    if (this.backgroundPlane) this.backgroundPlane.tint = this.theme.gaugeBgColor;
  }

  update() {
    if (this._value != this.renderedValue) {
      this.renderedValue = this._value;
      this.numberSprites.forEach((sprite, i) => {
        this.currentDigit = Math.floor(this.renderedValue / Math.pow(10, i)) % 10;

        if (i && this.currentDigit === 0 && i >= this.firstNonDecimal) {
          this.hideCurrentDigit = this.renderedValue < Math.pow(10, i+1)
          sprite.texture = this.numberTextures[this.hideCurrentDigit ? Readout.NO_DISPLAY : this.currentDigit];
        } else {
          sprite.texture = this.numberTextures[this.currentDigit];
        }
      });
    }
  }
}

export default Readout;
