import * as PIXI from "pixi.js";
import '@pixi/graphics-extras';
import { GlowFilter } from "@pixi/filter-glow";
import { SCREEN, SPEEDO_CONFIG } from "../appConfig";
import { DATA_KEYS } from "../common/dataMap";
import Renderable from "./Renderable";
import { RENDER_KEYS } from "./Renderables";

const FILTER_PADDING = 20;
const PADDING_OFFSET = FILTER_PADDING/2;
const NO_DISPLAY = 10;
const SEGMENT_SLANT = -0.2;
/**
 * Generate the Graphics needed for segments...
 * lmao im doing this the hard way arent i
 * @param {Number} number - The number to create out of segments
 * @param {Number} gaugeHeight - Needed to generate the segments
 * @returns {PIXI.Graphics}
 */
const createNumber = (number,gaugeHeight) => {
  const segmentLength = gaugeHeight/2 - 15;
  const segmentWidth = 20;
  const chamfer = 30;
  const inset = Math.min(chamfer, Math.min(segmentWidth, segmentLength) / 2);
  const insetPadding = 3;
  const middleSegmentPadding = (insetPadding*3)+inset; // padding the verticals use to fit the middle horizontal in there
  
  const graphics = new PIXI.Graphics();
  graphics.beginFill(0xffffff).lineStyle(0);
  
  // upper left vertical
  if (number != 1 && number != 2 && number != 3 && number != 7) {
    graphics.drawChamferRect(
      0, inset + insetPadding,
      segmentWidth, segmentLength,
      chamfer
    );
  }

  // lower left vertical
  if (number == 8 || number == 6 || number == 2 || number === 0) {
    graphics.drawChamferRect(
      0, middleSegmentPadding + segmentLength,
      segmentWidth, segmentLength,
      chamfer
    );
  }

  // upper right vertical
  if (number != 5 && number != 6) {
    graphics.drawChamferRect(
      segmentLength, inset + insetPadding,
      segmentWidth, segmentLength,
      chamfer
    );
  }

  // loewr right vertical
  if (number != 2) {
    graphics.drawChamferRect(
      segmentLength,  middleSegmentPadding + segmentLength,
      segmentWidth, segmentLength,
      chamfer
    );
  }

  // upper horizontals
  if (number != 4 && number != 1) {
    graphics.drawChamferRect(inset, 0, segmentLength, segmentWidth, chamfer);
  }

  // middle horizontal
  if (number != 0 && number != 1 && number != 7) {
    graphics.drawChamferRect(
      inset,          (insetPadding*2) + segmentLength,
      segmentLength,  segmentWidth,
      chamfer
    );
  }

  // lower horizontal
  if (number != 1 && number != 4 && number != 7) {
    graphics.drawChamferRect(
      inset, inset + 2 + segmentLength + segmentLength,
      segmentLength, segmentWidth,
      chamfer
    );
  }

  graphics.endFill();
  return graphics;
};

const ID = RENDER_KEYS.SPEEDO_READOUT;
class SpeedoReadout extends Renderable {
  constructor({ renderer, theme }) {
    super({ renderer, theme });
    this._dashID = ID;

    this._value = SPEEDO_CONFIG.MAX;
    this.renderedValue = this._value;
    this.bgSprite = null;
    this.numberTextures = [];
    this.numberSprites = [];
  }

  // the data store values we want to listen too
  get dataKey() {
    return DATA_KEYS.SPEEDO;
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

  get gaugeWidth() {
    return SCREEN.SPEEDO_CLUSTER_WIDTH;
  }
  get gaugeHeight() {
    return this._height;
  }
  set gaugeHeight(val) {
    this._height = val;
  }

  // MAGIC NUMBERS AHOY LOL - so much pixel chooching.  These numbers also depending on
  // renderhelpers.js placement.  Maybe I'll come back and make this less dumb...but I doubt it! :D :D :D    :|
  initialize() {
    // TODO: if we call init after it is already initialized; delete ALL textures

    const numberBackground = createNumber(8, this.gaugeHeight);

    // create each number texture
    for (let i = 0; i <= 10; i++) {
      const digitContainer = new PIXI.Container();

      // background
      const background = new PIXI.Graphics(numberBackground.geometry);
      background.tint = this.theme.gaugeBgColor;
      digitContainer.addChild(background);
      
      if (i != 10) {
        // greate number graphics
        const numberGraphics = createNumber(i, this.gaugeHeight);
        numberGraphics.tint = this.theme.gaugeActiveColor;

        // make the digit GLOW like everything else
        numberGraphics.filters = [new GlowFilter({
          distance: 20, 
          outerStrength: 1,
          innerStrength: 0,
          color: this.theme.gaugeActiveColor,
          quality: 0.2,
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
    this.numberSprites.push(new PIXI.Sprite(this.numberTextures[8]));
    this.numberSprites.push(new PIXI.Sprite(this.numberTextures[8]));

    this.numberSprites.forEach(sprite => {
      // give the numbers a slight and offset for the extra border we gave the textures
      sprite.setTransform(-(PADDING_OFFSET),-(PADDING_OFFSET),1,1,0, SEGMENT_SLANT, 0,0,0) 
    });

    // move second number into place
    this.numberSprites[1].x = this.numberSprites[1].x + numberBackground.width + SCREEN.PADDING;

    this.addChild(this.numberSprites[0], this.numberSprites[1]);
    numberBackground.destroy(true); // cleanup
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
