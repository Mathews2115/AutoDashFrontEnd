import { BitmapText, Graphics, Texture } from "pixi.js";
import { SCREEN } from "../../appConfig";

/**
 * 
 * @param {*} renderer 
 * @param {*} totalWidth 
 * @param {*} msg 
 * @returns {Texture}
 */
export const createLogo = (renderer, totalWidth, msg) => {
  const logo = new Graphics();
  const slantStart = 5;
  const text = new BitmapText(msg, {
    fontName: "Orbitron",
    fontSize: 50,
    align: "left",
  });
  text.angle = 180; // no idea what app is flipped??

  const padding = 5;
  const segmentLength = (totalWidth - text.width ) / 2
  logo
    .beginFill(0XFFFFFF)
    .drawPolygon([
      slantStart, 0,
      0, SCREEN.PADDING,
      segmentLength, SCREEN.PADDING,
      segmentLength, 0,
    ])
    .drawPolygon([
      segmentLength+text.width+padding+padding+padding, 0,
      segmentLength+text.width+padding+padding+padding, SCREEN.PADDING,
      totalWidth, SCREEN.PADDING,
      totalWidth + slantStart, 0,
    ])
    .endFill();

    text.x = segmentLength + padding;
    text.y = -SCREEN.PADDING;
    text.tint = 0xFFFFFF;
    logo.addChild(text);
  
    const renderedTexture = renderer.generateTexture(logo);
    logo.destroy(true);
    return renderedTexture;
}