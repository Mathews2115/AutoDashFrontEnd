import * as PIXI from "pixi.js";
import { SCREEN } from "../appConfig";

//Aliases
let Container = PIXI.Container,
  Graphics = PIXI.Graphics;

export class PedalGauge extends Container {
  constructor({ backgroundColor, activeColor }) {
    super();

    this.pedalGaugeBackground = new Graphics();
    this.pedalGaugeBackground
      .beginFill(backgroundColor)
      .lineStyle(5, backgroundColor)
      .drawRoundedRect(0, 0, this.gaugeWidth, this.gaugeHeight, 3)
      .endFill();
    this.addChild(this.pedalGaugeBackground);
    this.pedalGaugeBackground.cacheAsBitmap = true;
  }

  get gaugeWidth() {
    return 50;
  }
  get gaugeHeight() {
    return SCREEN.CONTENT_HEIGHT;
  }

  draw() {}
}
