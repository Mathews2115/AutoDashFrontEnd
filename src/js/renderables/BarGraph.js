import chroma from "chroma-js";
import Renderable from "./Renderable";
import { gsap } from "gsap";
import { Graphics } from "pixi.js";

const BAR_MAX = 100;
const BAR_MIN = 0;
/**
 * Just a rising/lowering Bar.
 * @class BarGraph 0 - 100
 */
class BarGraph extends Renderable {

  constructor({ renderer, theme, width, height, minValue=BAR_MIN, maxValue=BAR_MAX}) {
    super({ renderer, theme });
    this._value = maxValue;
    this.renderedValue = this._value;
    this.gaugeHeight = height;
    this.gaugeWidth = width;
    this.maxValue = maxValue;
    this.minValue = minValue
    this.gsapTimeline = gsap.timeline();
    this.background = new Graphics();
    this.background
      .beginFill(0xFFFFFF)
      .lineStyle(0)
      .drawRect(0, 0, this.gaugeWidth, this.gaugeHeight)
      .endFill();
    this.gaugeActive = new Graphics(this.background.geometry);
    this.addChild(this.background, this.gaugeActive);
    this.tintUpdate = () => {};
  }

  /**
   * @param {{ colors?: Array<string | chroma.Color>; chromaDomain: number[]; }} colors
   */
  set colors(colors) {
    this.chromaScale = chroma.scale(colors.colors).domain(colors.chromaDomain);
    this.tintUpdate = () => {
      this.gaugeActive.tint = this.chromaScale(Math.round(this._value)).num();
    }
  }

  /**
   * @param {Number} newValue
   */
  set value(newValue) {
    this._value = Math.min(Math.max(newValue, this.minValue), this.maxValue);
  }

  initialize() {
    this.renderedValue = null;
    this.background.tint =  this.theme.gaugeBgColor;
    this.gaugeActive.tint = this.theme.gaugeActiveColor;

    // set the rotate this puppy so we can scale it up and down
    this.gaugeActive.position.set(this.gaugeWidth, this.gaugeHeight);
    this.gaugeActive.angle = 180;
  }

  update() {
    if (this._value != this.renderedValue) {
      this.gsapTimeline.clear();
      this.gsapTimeline.to(this.gaugeActive.scale, {duration: 0.15, y: this._value / this.maxValue})
      this.renderedValue = this._value;
      this.tintUpdate();
    }
  }
}

export default BarGraph;