 
import * as PIXI from "pixi.js";
import { GlowFilter } from "@pixi/filter-glow";

const FILTER_PADDING = 20;
const PADDING_OFFSET = FILTER_PADDING/2;
const SEGMENT_SLANT = -0.2;


/**
 * Generate the Graphics needed for segments...
 * lmao im doing this the hard way arent i
 * @param {Number} number - The number to create out of segments
 * @param {Number} gaugeHeight - Needed to generate the segments
 * @returns {PIXI.Graphics}
 */
 export const createDigitGeometry = (number, gaugeHeight) => {
  const segmentWidth = (gaugeHeight / 10.95);
  const chamfer = (gaugeHeight / 7.33);
  const insetPadding = gaugeHeight / 73;
  const segmentLength = gaugeHeight/2 - 15;
  const inset = Math.min(chamfer, Math.min(segmentWidth, segmentLength) / 2);
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
 * @param {PIXI.Renderer} appRenderer
 * @param {{ gaugeBgColor?: number; gaugeActiveColor: any; dangerColor?: number; warningColor?: number; nominalColor?: number; backgroundColor?: number; }} theme
 * @param {number} gaugeHeight
 */
export function renderDigitTextures(appRenderer, theme, gaugeHeight, glowSrength = 2, createBackground = false) {
  /** @type {PIXI.Texture[]} */
  const backedInTextures = [];

   /** @type {PIXI.Graphics} */
  let numberBackground = null;

  if (createBackground) {
     // represents "unlit segmentst" for the digitis - we just draw over them
    numberBackground = createDigitGeometry(8, gaugeHeight);
  }

  // create each number texture
  for (let i = 0; i <= 10; i++) {
    const digitContainer = new PIXI.Container();

    if (numberBackground) {
      const background = new PIXI.Graphics(numberBackground.geometry);
      background.tint = theme.gaugeBgColor;
      digitContainer.addChild(background);
    }

    if (i != 10) {
      // create number graphics
      const numberGraphics = createDigitGeometry(i, gaugeHeight);
      numberGraphics.tint = theme.gaugeActiveColor;

      // make the digit GLOW like everything else
      numberGraphics.filters = [new GlowFilter({
        distance: glowSrength, 
        outerStrength: 1,
        innerStrength: 0,
        color: theme.gaugeActiveColor,
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

    const bakedInTexture = appRenderer.generateTexture(container);
    // bake everything into a texture (background, glowing digit, blank border)
    backedInTextures.push(bakedInTexture);
    container.destroy(true); // clean up
  }

  if (numberBackground) numberBackground.destroy(true); // cleanup
  return backedInTextures;
}

/**
 * @param {PIXI.Texture<PIXI.Resource>[]} numberTextures - textures representing each digit
 * @param {number} readoutSize - Number of sprites to create
 */
export function createDigitSprites(numberTextures, readoutSize) {
  const digitSprites = [];
  // create number sprites
  for (let i = 0; i < readoutSize; i++) {
    digitSprites.push(new PIXI.Sprite(numberTextures[8]));
  }
  return digitSprites;
}


/**
 * @param {PIXI.Container} container
 * @param {PIXI.Sprite[]} numberSprites
 * @param {number} fudge - lol MAGIC NUMBERS
 */
export function spaceSprites(container, numberSprites, fudge=15) {
  numberSprites.forEach((sprite, i) => {
    sprite.y = -2; // offset magic number; i did some dumb math while creating render textures
    if (i > 0) {
      sprite.x = ((sprite.width/2+fudge)*i);  
    }
  });
  // give us a bit of a lean on the numbers
  container.setTransform(0,0,1,1,0, SEGMENT_SLANT, 0,0,0);
}

