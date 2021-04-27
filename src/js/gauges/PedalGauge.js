import * as PIXI from "pixi.js";
import { PEDAL_CONFIG, SCREEN } from "../appConfig";
import { GlowFilter } from "@pixi/filter-glow";

//Aliases
let Container = PIXI.Container,
  Graphics = PIXI.Graphics;

export class PedalGauge extends Container {
  constructor({ renderer, theme }) {
    super();
    this.interactiveChildren = false;
    this.renderer = renderer;
    this._transformHeight = 0;
    this.activeColor = theme.gaugeActiveColor;
    this.backgroundColor = theme.gaugeBgColor;
    this._value = PEDAL_CONFIG.MIN;
    this.renderedValue = this._value;
  }

  get gaugeWidth() {
    return 50;
  }
  get gaugeHeight() {
    return SCREEN.RPM_CLUSTER_HEIGHT;
  }

  get value() {
    return this._value;
  }
  set value(newValue) {
    if (newValue < PEDAL_CONFIG.MIN) {
      this._value = PEDAL_CONFIG.MIN;
    } else if (newValue > PEDAL_CONFIG.MAX) {
      this._value = PEDAL_CONFIG.MAX;
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

    this.pedalGaugeActive = new Graphics();
    this.pedalGaugeActive
      .beginFill(this.activeColor)
      .lineStyle(0)
      .drawRect(0, 0, this.gaugeWidth, this.gaugeHeight)
      .endFill();
    this.addChild(this.pedalGaugeActive);

    this.pedalGaugeActive.filterArea = this.getBounds();
    this.pedalGaugeActive.filters = [
      new GlowFilter({
        distance: 8,
        outerStrength: 2,
        innerStrength: 0,
        color: 0xf0f0f0,
        quality: 0.2,
      }),
    ];

    // set the rotate this puppy so we can scale it up and down
    this.pedalGaugeActive.position.set(this.gaugeWidth, this.gaugeHeight)
    this.pedalGaugeActive.angle = 180;
  }

  update(_delta) {
    if (this._value != this.renderedValue) {
      this.pedalGaugeActive.scale.set(1, (this._value / PEDAL_CONFIG.MAX));
      this.renderedValue = this._value;
    }
  }
}
