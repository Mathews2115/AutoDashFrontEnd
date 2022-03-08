import { FUEL_CONFIG, SCREEN } from "../appConfig";
import { RENDER_KEYS } from "./Renderables";
import { DATA_KEYS } from "../common/dataMap";
import Renderable from "./Renderable";
import { Graphics } from "pixi.js";
import RingBuffer from "../common/ringBuffer";

const ID = RENDER_KEYS.AVG_MPG_HISTOGRAM;
/**
 * Creates a new MpgHistogram.
 * @class MpgHistogram
 */

class MpgHistogram extends Renderable {
  constructor({ renderer, theme }) {
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

    this._dashID = ID;
  }
  // the data store values we want to listen too
  get dataKey() {
    return DATA_KEYS.AVERAGE_MPG_POINTS;
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
      this._value.buffer.forEach((value, index) => {
        points.push((index/DATA_KEYS.MAX_AVERAGE_POINTS) * this.gaugeWidth);// x
        points.push( this.gaugeHeight-((Math.min(FUEL_CONFIG.MAX_MPG,value)/FUEL_CONFIG.MAX_MPG) * this.gaugeHeight)); // y
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

MpgHistogram.ID = ID;
export default MpgHistogram;