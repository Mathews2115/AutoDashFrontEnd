import { DATA_MAP } from "../common/dataMap";
import SideReadout from "./SideReadout";
import { RENDER_KEYS } from "./Renderables";
import Renderable from "./Renderable";
import Histogram from "./Histogram";
import RingBuffer from "../common/ringBuffer";
import { BitmapText, Sprite } from "pixi.js";
import Readout from "./Readout";
import { SCREEN } from "../appConfig";
const IGN_KEY = DATA_MAP.IGNITION_TIMING.id;
const ID = RENDER_KEYS.IGN_TIMING_READOUT;

const GAUGE_HEIGHT = SCREEN.BAR_WIDTH;
const GAUGE_WIDTH = 250;

function createText(msg) {
  const text = new BitmapText(msg, {
    fontName: "Orbitron",
    fontSize: 24,
    align: "left",
  });
  text.angle = 180; // no idea what app is flipped??

  return text;
}

const READOUT_OPTIONS = SideReadout.ReadoutOptions.ign;

class IgnTimingReadout extends Renderable {
  constructor({ renderer, theme }) {
    super(  { renderer, theme } );
    this._dashID = ID;

    this.histogram = new Histogram({  renderer, theme, maxPoints: 400, maxVal: 45 });
    this.readout = new Readout(
      { renderer, theme },
      { digits: 3, glowStrength: 1, decimalPlaces: READOUT_OPTIONS.decimalPlaces, createSolidBackground: true }
    );
    this.readout.gaugeHeight = 80;
    this.histogram.gaugeHeight = GAUGE_HEIGHT;
    this.histogram.gaugeWidth = GAUGE_WIDTH;
  }

  get gaugeHeight() {
    return this.height;
  }
  get gaugeWidth() {
    return this.width;
  }

  initialize() {
    this.readout.initialize();

    if (!this.initialized) {
      this.histogram.value = new RingBuffer({ arrayBuffer: new Uint8Array(400), frontOffset: 0 });

      this.icon = READOUT_OPTIONS.text ? createText(READOUT_OPTIONS.text) : Sprite.from(READOUT_OPTIONS.textureName);
      this.icon.anchor.set(0, 0.5);
      const scale = this.histogram.gaugeHeight / this.icon.width;
      this.icon.scale.set(scale);
      this.icon.y = this.histogram.gaugeHeight / 2;

      this.histogram.gaugeWidth = this.histogram.gaugeWidth - this.icon.width - 5;

      this.histogram.x = this.icon.x + this.icon.width + 5
      this.readout.scale.set(0.4);
      this.readout.x = (this.histogram.gaugeWidth/2)-(this.readout.height*.2)
      this.readout.y = (this.histogram.gaugeHeight/2) - (this.readout.height/2)

      this.addChild(
        this.histogram,
        this.icon,
        this.readout
      );
      this.initialized = true;
    }

    this.histogram.initialize();
    this.icon.tint = this.theme.gaugeActiveColor;
  }

  update() {
    this.histogram.update();
    this.readout.update();
  }

  /**
   * @param {number} newValue
   */
  set value(newValue) {
    this.readout.value = newValue;

    if (newValue != null) {
      this.histogram.buffer.push(newValue)
      this._value = newValue;
    }
  }

  // the data store values we want to listen too
  get dataKey() {
    return IGN_KEY;
  }
}

IgnTimingReadout.ID = ID;
export default IgnTimingReadout;
