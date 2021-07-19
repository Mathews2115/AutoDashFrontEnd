 
import * as PIXI from "pixi.js";

/**
 * Generate the Graphics needed for segments...
 * lmao im doing this the hard way arent i
 * @param {Number} number - The number to create out of segments
 * @param {Number} gaugeHeight - Needed to generate the segments
 * @returns {PIXI.Graphics}
 */
 export const createDigit = (number, gaugeHeight) => {
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
