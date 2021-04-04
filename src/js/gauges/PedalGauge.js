import * as PIXI from "pixi.js";
import { SCREEN } from "../appConfig";
import {GlowFilter} from "@pixi/filter-glow"
import { DropShadowFilter } from "@pixi/filter-drop-shadow";

//Aliases
let Container = PIXI.Container,
  Graphics = PIXI.Graphics;

/**
 * @param { PIXI.Renderer } [renderer]
 * @param {number} [width]
 * @param {number} [height]
 * @param {number} [radius]
 */
function generateMask(renderer, width, height, radius) {
  // The blur amount
  const blurSize = 5; // todo; maybe animate this at some ponit to give a pulsate glow?
  const mask = new Graphics()
    .beginFill(0xff0000)
    .drawRoundedRect(0, 0, width, height, radius)
    .endFill();
  mask.filters = [new PIXI.filters.BlurFilter(blurSize)];

  const bounds = new PIXI.Rectangle(0, 0, width, height);
  const texture = renderer.generateTexture(
    mask,
    PIXI.SCALE_MODES.NEAREST,
    1,
    bounds
  );
  return new PIXI.Sprite(texture);
}

export class PedalGauge extends Container {
  constructor({ renderer, backgroundColor, activeColor }) {
    super();

    this.pedalGaugeBackground = new Graphics();
    this.pedalGaugeBackground
      .beginFill(backgroundColor)
      .lineStyle(5, backgroundColor)
      .drawRoundedRect(2, 2, this.gaugeWidth, this.gaugeHeight, 3)
      .endFill();
    this.pedalGaugeBackground.cacheAsBitmap = true;
    this.addChild(this.pedalGaugeBackground);

    this.pedalGaugeActive = new Graphics();
    this.pedalGaugeActive
      .beginFill(activeColor)
      .lineStyle(5, activeColor)
      .drawRoundedRect(3, 50, this.gaugeWidth, this.gaugeHeight-50, 3)
      .endFill();
    this.addChild(this.pedalGaugeActive);

    this.pedalGaugeActive.filters = [
      new GlowFilter({
        distance: 8,
        outerStrength: 3,
        innerStrength: 0,
        color: 0xFEFEFE,
        quality: 0.5
      })
    ];
  }

  get gaugeWidth() {
    return 50;
  }
  get gaugeHeight() {
    return SCREEN.CONTENT_HEIGHT;
  }

  draw() {}
}
