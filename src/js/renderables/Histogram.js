import Renderable from "./Renderable";
import { Graphics } from "pixi.js";
import RingBuffer from "../common/ringBuffer";

/**
 * Creates a new Histogram.
 * @class Histogram
 */

class Histogram extends Renderable {
  constructor({ renderer, theme, maxPoints, maxVal, }) {
    super({renderer, theme });
    this.activeColor = this.theme.gaugeActiveColor;
    this.backgroundColor = this.theme.gaugeBgColor;
    /** @type {RingBuffer | Object} */
    this._value = {};
    this.renderedValue = this._value;
    this.gaugeHeight = 0;
    this.gaugeWidth = 0;
    this.background = new Graphics();
    this.histogram = new Graphics();
    this.addChild(this.background, this.histogram);
    this.maxPoints = maxPoints;
    this.maxVal = maxVal;
  }

  set value(newValue) {
    if (newValue != null) this._value = newValue;
  }

  initialize() {
    this.renderedValue.frontOffset = null;
    this.activeColor = this.theme.gaugeActiveColor;
    this.backgroundColor = this.theme.gaugeBgColor;

    this.background.clear();
    this.background
      .beginFill(this.backgroundColor)
      .lineStyle(0)
      .drawRect(0, 0, this.gaugeWidth, this.gaugeHeight)
      .endFill();
  }

  update() {
    if (this._value.frontOffset != this.renderedValue.frontOffset) {
      this.renderedValue.frontOffset = this._value.frontOffset;
      // get points
      let points = [];
      // plot the xy points for the histogram

      this._value.buffer.forEach((value, index) => {
        points.push((index / this.maxPoints) * this.gaugeWidth);// x
        points.push( this.gaugeHeight-((Math.min(this.maxVal,value)/this.maxVal) * this.gaugeHeight)); // y
      });

      this.histogram.clear();
      this.histogram
        .beginFill(this.activeColor)
        .drawPolygon([
          0, this.gaugeHeight,
          ...points,
          this.gaugeWidth, points[points.length-1],
          this.gaugeWidth, this.gaugeHeight,
        ])
        .endFill();
    }
  }
}

export default Histogram;
