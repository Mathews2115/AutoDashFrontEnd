import { GlowFilter } from "@pixi/filter-glow";
import '@pixi/graphics-extras';
import * as PIXI from "pixi.js";
import { createDigit } from "../common/createDigit";
import Renderable from "./Renderable";

const FILTER_PADDING = 20;
const PADDING_OFFSET = FILTER_PADDING/2;
const NO_DISPLAY = 10;
const SEGMENT_SLANT = -0.2;

class MediumReadout extends Renderable {
  constructor({ renderer, theme }) {
    super({ renderer, theme });
    this._value = 0;
    this.renderedValue = 0;
    this.bgSprite = null;
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

  // MAGIC NUMBERS AHOY LOL - so much pixel chooching.  These numbers also depending on
  // renderhelpers.js placement.  Maybe I'll come back and make this less dumb...but I doubt it! :D :D :D    :|
  initialize() {
    // TODO: if we call init after it is already initialized; delete ALL textures

    // create each number texture
    for (let i = 0; i <= 10; i++) {
      const digitContainer = new PIXI.Container();

      if (i != 10) {
        // greate number graphics
        const numberGraphics = createDigit(i, this.gaugeHeight);
        numberGraphics.tint = this.theme.gaugeActiveColor;

        // make the digit GLOW like everything else
        numberGraphics.filters = [new GlowFilter({
          distance: 2, 
          outerStrength: 1,
          innerStrength: 0,
          color: this.theme.gaugeActiveColor,
          quality: 1,
        })];

        digitContainer.addChild(numberGraphics)
      }

      // we need room for the glow before we render this to the texture...
      // so lets add some padding - there is probably a better way of doing this but whatevs, here we are
      const container = new PIXI.Container();
      const emptySpace = new PIXI.Graphics();
      emptySpace.drawRect(0,0, digitContainer.width+FILTER_PADDING, digitContainer.height+FILTER_PADDING);
      digitContainer.x = PADDING_OFFSET;
      digitContainer.y = PADDING_OFFSET;
      container.addChild(emptySpace, digitContainer);

      // bake everything into a texture (background, glowing digit, blank border)
      this.numberTextures.push(this.appRenderer.generateTexture(container));
      container.destroy(true); // clean up
    }
  
    // create number textures
    for (let i = 0; i < 2; i++) {
      this.numberSprites.push(new PIXI.Sprite(this.numberTextures[8]));
      this.addChild(this.numberSprites[i]);
    }
    this.numberSprites.forEach((sprite, i) => {
      sprite.y = -2; // offset magic number; i did some dumb math while creating render textures
      if (i > 0) {
        sprite.x = ((sprite.width/2+15)*i);  
      }
    });
    // reverse the order so when iterating them, the index represents least to most significatnt digit
    this.numberSprites = this.numberSprites.reverse();

    // give us a bit of a lean on the numbers
    this.setTransform(0,0,1,1,0, SEGMENT_SLANT, 0,0,0)     
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
}

export default MediumReadout;
