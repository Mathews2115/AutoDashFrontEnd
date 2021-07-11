import * as PIXI from "pixi.js";
import { SCREEN } from "../appConfig";
import { GlowFilter } from "@pixi/filter-glow";
import Renderable from "./Renderable";
//Aliases
let Graphics = PIXI.Graphics;

const BAR_MAX = 100;
const BAR_MIN = 0;
/**
 * Just a rising/lowering Bar.
 * @class BarGraph 0 - 100
 */
class BarGraph extends Renderable {

  constructor({ renderer, theme, width, height}) {
    super({ renderer, theme });
    this.activeColor = theme.gaugeActiveColor;
    this.backgroundColor = theme.gaugeBgColor;
    this._value = BAR_MAX;
    this.renderedValue = this._value;
    this.gaugeHeight = height;
    this.gaugeWidth = width;
  }

  set value(newValue) {
    if (newValue == null || newValue < BAR_MIN) {
      this._value = BAR_MIN;
    } else if (newValue > BAR_MAX) {
      this._value = BAR_MAX;
    } else {
      this._value = newValue;
    }
  }

  initialize() {
    const background = new Graphics();
    background
      .beginFill(this.backgroundColor)
      .lineStyle(0)
      .drawRect(0, 0, this.gaugeWidth, this.gaugeHeight)
      .endFill();
    this.addChild(background);

    this.gaugeActive = new Graphics();
    this.gaugeActive
      .beginFill(this.activeColor)
      .lineStyle(0)
      .drawRect(0, 0, this.gaugeWidth, this.gaugeHeight)
      .endFill();
    this.addChild(this.gaugeActive);

    this.gaugeActive.filterArea = this.getBounds();
    this.gaugeActive.filters = [
      new GlowFilter({
        distance: 8,
        outerStrength: 2,
        innerStrength: 0,
        color: 0xf0f0f0,
        quality: 0.2,
      }),
    ];

    // set the rotate this puppy so we can scale it up and down
    this.gaugeActive.position.set(this.gaugeWidth, this.gaugeHeight);
    this.gaugeActive.angle = 180;
  }

  update() {
    if (this._value != this.renderedValue) {
      this.gaugeActive.scale.set(1, this._value / BAR_MAX);
      this.renderedValue = this._value;
    }
  }
}

export default BarGraph;