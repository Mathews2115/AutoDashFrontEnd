import { Sprite } from "pixi.js";
import { SCREEN } from "../appConfig";
import BarGraph from "./BarGraph";
import Readout from "./Readout";
import Renderable from "./Renderable";

const GAUGE_HEIGHT = 200;
const GAUGE_WIDTH = SCREEN.BAR_WIDTH;

class SideReadout extends Renderable {
  static ReadoutOptions = {
    voltage: {textureName: "battery.png", decimalPlaces: 1, maxValue: 16, minValue: 10.0},
    oil: {textureName: "oil.png", decimalPlaces: 0, minValue: 0, maxValue: 99},
    coolant: {textureName: "temp.png", decimalPlaces: 0, minValue: 120, maxValue: 250},
    mat: {textureName: "tempair.png", decimalPlaces: 0, minValue: 120, maxValue: 250},
  }
  constructor({ renderer, theme }, {readoutOptions}) {
    super({ renderer, theme });
    this.readout = new Readout(
      { renderer, theme },
      { digits: 3, glowStrength: 1, decimalPlaces: readoutOptions.decimalPlaces, createSolidBackground: true }
    );
    this.bargraph = new BarGraph({
      renderer,
      theme,
      width: GAUGE_WIDTH,
      height: GAUGE_HEIGHT * 0.8,
      maxValue: readoutOptions.maxValue,
      minValue: readoutOptions.minValue,
    });
    this.readout.gaugeHeight = 80;
    this.options = readoutOptions
  }

  get gaugeHeight() {
    return this.height;
  }
  get gaugeWidth() {
    return this.width;
  }
  set value(newValue) {
    this.readout.value = newValue;
    this.bargraph.value = newValue;
  }
  _initialize() {
    this.readout.initialize();
    this.bargraph.initialize();
    if (!this.initialized) {
      // create label icon, scale it to size and position it
      this.icon = Sprite.from(this.options.textureName);
      this.icon.anchor.set(0, 0.5);
      const scale = this.bargraph.gaugeWidth / this.icon.width;
      this.icon.scale.set(scale);
      this.icon.y = this.bargraph.gaugeWidth / 2;

      this.bargraph.x =
        this.icon.x + this.icon.width + 5 + this.bargraph.gaugeHeight;
      this.readout.scale.set(0.4);
      this.readout.x = (this.bargraph.gaugeHeight/2)-(this.readout.width*.2)
      this.readout.y = (this.bargraph.gaugeWidth/2) - (this.readout.height/2)

   
      this.bargraph.rotation = Math.PI / 2;

      this.addChild(
        this.bargraph,
        this.icon,
        this.readout
      );
      this.initialized = true;
    }
    this.icon.tint = this.theme.gaugeActiveColor;
  }
  update() {
    this.readout.update();
    this.bargraph.update();
  }
}

export default SideReadout;
