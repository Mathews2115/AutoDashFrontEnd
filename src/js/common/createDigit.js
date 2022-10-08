
import { GlowFilter } from "@pixi/filter-glow";
import { Container, Graphics, Renderer, Resource, Sprite, Texture } from "pixi.js";
import '@pixi/graphics-extras';
import { THEMES } from "./theme";

const FILTER_PADDING = 20;
const PADDING_OFFSET = FILTER_PADDING/2;
const SEGMENT_SLANT = -0.2;

export const DASH = 10;
export const WARNING_DASH = 11;
export const NO_DISPLAY = 12;
const TOTAL_GRAPHICS = NO_DISPLAY;

// dictionary by theme and key
/**
 * @typedef StoredTextures
 * @type {object}
 * @property {Number} glowSrength
 * @property {Texture[]} textures - represents textures of digits
 * @property {Number} rawDigitWidth - the actual width of the digit before the texture bake in
 * @property {Number} rawDigitHeight - the actual height of the digit before the texture bake in
 * @property {Number} decimalWidth - the actual width of the decimal point
 * @property {Number} decimalHeight - the actual height of the decimal point
*/

/**
 * @typedef StoredDictionary
 * @type {object}
 * @property {StoredTextures} [key] - a string representing the gaugeHeight,glow and createBackground
 */

// REUSE TEXTURES - An array of StoredTextures dictionaries, indexed by theme, dictionary keyed by a string representing height,glow and background enabled
/** @type {StoredDictionary[]} */
const textures = [];
Object.keys(THEMES).forEach(_ => textures.push({}));

/**
 * Generate the Graphics needed for segments...
 * lmao im doing this the hard way arent i
 * @param {Number} number - The number to create out of segments
 * @param {Number} gaugeHeight - Needed to generate the segments
 * @returns {Graphics}
 */
 export const createDigitGeometry = (number, gaugeHeight) => {
  if (number === DASH) {
    number = -1;
  } else if (number === WARNING_DASH) {
    number = -2;
  }
  const segmentWidth = (gaugeHeight / 10.95);
  const chamfer = (gaugeHeight / 7.33);
  const insetPadding = gaugeHeight / 73;
  const segmentLength = gaugeHeight/2 - 15;
  const inset = Math.min(chamfer, Math.min(segmentWidth, segmentLength) / 2);
  const middleSegmentPadding = (insetPadding*3)+inset; // padding the verticals use to fit the middle horizontal in there
  
  const graphics = new Graphics();
  graphics.beginFill(0xffffff).lineStyle(0);
  
  // upper left vertical
  if (number >= 0 && number != 1 && number != 2 && number != 3 && number != 7) {
    graphics.drawChamferRect(
      0, inset + insetPadding,
      segmentWidth, segmentLength,
      chamfer
    );
  }

  // lower left vertical
  if (number >= 0 && number == 8 || number == 6 || number == 2 || number === 0) {
    graphics.drawChamferRect(
      0, middleSegmentPadding + segmentLength,
      segmentWidth, segmentLength,
      chamfer
    );
  }

  // upper right vertical
  if (number >= 0 && number != 5 && number != 6) {
    graphics.drawChamferRect(
      segmentLength, inset + insetPadding,
      segmentWidth, segmentLength,
      chamfer
    );
  }

  // loewr right vertical
  if (number >= 0 && number != 2) {
    graphics.drawChamferRect(
      segmentLength,  middleSegmentPadding + segmentLength,
      segmentWidth, segmentLength,
      chamfer
    );
  }

  // upper horizontals
  if (number >= 0 && number != 4 && number != 1) {
    graphics.drawChamferRect(inset, 0, segmentLength, segmentWidth, chamfer);
  }

  // middle horizontal
  if (number < 0 || (number != 1 && number != 7)) {
    graphics.drawChamferRect(
      inset,          (insetPadding*2) + segmentLength,
      segmentLength,  segmentWidth,
      chamfer
    );
  }

  // lower horizontal
  if (number >= 0 && number != 1 && number != 4 && number != 7) {
    graphics.drawChamferRect(
      inset, inset + 1 + segmentLength + segmentLength, //x,y
      segmentLength, segmentWidth, // width, height
      chamfer
    );
  }

  graphics.endFill();
  return graphics;
};


/**
 * Create Render Textures for each digit - used PIXI Sprites
 * MAGIC NUMBERS AHOY LOL - so much pixel chooching.  These numbers also depending on
 * renderhelpers.js placement.  Maybe I'll come back and make this less dumb...but I doubt it! :D :D :D    :|
 *
 * @param {Renderer} appRenderer
 * @param {import("../appConfig").ThemeData} theme
 * @param {number} gaugeHeight
 * @param {number} glowSrength 
 * @param {Boolean} createBackground 
 * @returns {StoredTextures}
 */
export function renderDigitTextures(appRenderer, theme, gaugeHeight, glowSrength = 2, createBackground = false) {
  /** @type {Texture[]} */
  let bakedInTextures = [];

  const key = `${gaugeHeight}_${glowSrength}_${createBackground}`;

  if (!textures[theme.id][key]) {
    // represents "unlit segmentst" for the digitis - we just draw over them
    const numberBackground = createDigitGeometry(8, gaugeHeight);
    const rawDigitWidth = numberBackground.width;
    const rawDigitHeight = numberBackground.height;
    
    // create each number texture
    for (let i = 0; i <= TOTAL_GRAPHICS; i++) {
      const digitContainer = new Container();

      if (createBackground) {
        const background = new Graphics(numberBackground.geometry);
        background.tint = theme.gaugeBgColor;
        digitContainer.addChild(background);
      }

      if (i < NO_DISPLAY) {
        // create number graphics
        const numberGraphics = createDigitGeometry(i, gaugeHeight);
        const color = i == WARNING_DASH ? theme.warningColor : theme.gaugeActiveColor;
        numberGraphics.tint = color;

        // make the digit GLOW like everything else
        numberGraphics.filters = [new GlowFilter({
          distance: glowSrength, 
          outerStrength: 1,
          innerStrength: 0,
          color: color,
          quality: 1,
        })];

        digitContainer.addChild(numberGraphics)
      }

      // we need room for the glow before we render this to the texture...
      // so lets add some padding - there is probably a better way of doing this but whatevs, here we are
      const container = new Container();
      const emptySpace = new Graphics();
      emptySpace.drawRect(0,0, digitContainer.width+FILTER_PADDING, digitContainer.height+FILTER_PADDING);
      digitContainer.x = PADDING_OFFSET;
      digitContainer.y = PADDING_OFFSET;
      container.addChild(emptySpace, digitContainer);

      const bakedInTexture = appRenderer.generateTexture(container);
      // bake everything into a texture (background, glowing digit, blank border)
      bakedInTextures.push(bakedInTexture);
      container.destroy(true); // clean up
    }

    // make decimal point texture
    const decimal = new Graphics();
    decimal.beginFill(theme.gaugeActiveColor)
      .lineStyle(0)
      .drawChamferRect(0, 0, gaugeHeight*0.12, gaugeHeight*0.12,(gaugeHeight / 7.33))
      .endFill();
    const decimalHeight = decimal.height;
    const decimalWidth = decimal.width;
    const bakedInDecimal = appRenderer.generateTexture(decimal);
    bakedInTextures.push(bakedInDecimal);
    decimal.destroy(true); // clean up
    
    if (numberBackground) numberBackground.destroy(true); // cleanup

    textures[theme.id][key] = {textures: bakedInTextures, 
      rawDigitWidth, 
      rawDigitHeight, 
      glowSrength, 
      decimalHeight, 
      decimalWidth};
  }
  return textures[theme.id][key];
}

/**
 * @param {number} readoutSize - Number of sprites to create
 * @return {Sprite[]}
 */
export function createDigitSprites(readoutSize) {
  const digitSprites = [];
  // create number sprites
  for (let i = 0; i < readoutSize; i++) {
    digitSprites.push(new Sprite());
  }
  return digitSprites;
}

const spriteSpacing = 1;
/**
 * @param {Container} container
 * @param {Sprite[]} numberSprites
 * @param {StoredTextures} textureData
 */
export function formatSprites(container, numberSprites, textureData, decimalPlaces = null, decimalSprite = null) {
  const {rawDigitWidth, rawDigitHeight, textures, glowSrength, decimalHeight, decimalWidth} = textureData;
  const digitWidth = rawDigitWidth+glowSrength
  const decimalSpot = numberSprites.length - decimalPlaces;

  for (let i = 0; i < numberSprites.length; i++) {
    const sprite = numberSprites[i];

    if (!decimalPlaces || i < decimalSpot) {
      sprite.x = (digitWidth+spriteSpacing)*i; 
    } else if (decimalPlaces && i === decimalSpot) {
      decimalSprite.x = (digitWidth+spriteSpacing)*i + decimalSprite.width;
      decimalSprite.y = rawDigitHeight + (decimalSprite.height/2)  ;
      sprite.x = (digitWidth+spriteSpacing)*i + decimalSprite.width; 
    } else {
      sprite.x = (digitWidth+spriteSpacing)*i + decimalSprite.width; 
    }
  }
  // give us a bit of a lean on the numbers 
  // numberSprites.forEach((s) => s.skew.set(SEGMENT_SLANT, 0));
  // give us a bit of a lean on the numbers
  container.setTransform(0,0,1,1,0, SEGMENT_SLANT, 0,0,0);
}

