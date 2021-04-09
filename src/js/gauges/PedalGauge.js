import * as PIXI from "pixi.js";
import { PEDAL_CONFIG, SCREEN } from "../appConfig";
import {GlowFilter} from "@pixi/filter-glow";
import {DropShadowFilter} from "@pixi/filter-drop-shadow"

//Aliases
let Container = PIXI.Container,
  Graphics = PIXI.Graphics;

export class PedalGauge extends Container {
  constructor({ renderer, backgroundColor, activeColor }) {
    super();

    this.activeColor = activeColor;

    // Value to be rendered
    this._value = PEDAL_CONFIG.MIN;

    // What value the gauge rendered last
    this.renderedValue = this._value;

    // construct graphics
    this.pedalGaugeBackground = new Graphics();
    this.pedalGaugeBackground
      .beginFill(backgroundColor)
      .lineStyle(5, backgroundColor)
      .drawRect(1, 0, this.gaugeWidth, this.gaugeHeight-1)
      .endFill();
    this.pedalGaugeBackground.cacheAsBitmap = true;
    this.addChild(this.pedalGaugeBackground);

    this.pedalGaugeActive = new Graphics();
    this.pedalGaugeActive
      .beginFill(activeColor)
      .drawRect(0, 0, this.gaugeWidth, 0)
      .endFill();
    this.addChild(this.pedalGaugeActive);

    this.pedalGaugeActive.filters = [
      new GlowFilter({
        distance: 10,
        outerStrength: 2,
        innerStrength: 0,
        color: 0xF0F0F0,
        quality: 0.9
      })
      // new DropShadowFilter({
      //   rotation: 0,
      //   distance: 0.1,
      //   color:0xFFFFFF,
      //   alpha:0.7,
      //   blur:2,
      //   quality:20
      // })
    ];
  }

  get gaugeWidth() {
    return 50;
  }
  get gaugeHeight() {
    return SCREEN.CONTENT_HEIGHT;
  }

  get value() {
    return this._value
  }
  set value(newValue) {
    if (newValue <  PEDAL_CONFIG.MIN) {
      this._value =  PEDAL_CONFIG.MIN;
    } else if (newValue >  PEDAL_CONFIG.MAX) {
      this._value =  PEDAL_CONFIG.MAX
    } else {
      this._value = newValue;
    }
  }

  // TODO: use delta to gradually get there...but only if it is a small amount

  update(delta) {
    if (this._value != this.renderedValue) {
      // A) redraw the new size
      // B) or make active gauge a bitmap and resize it

      let transformHeight = (this._value/PEDAL_CONFIG.MAX) * this.gaugeHeight
      
      this.pedalGaugeActive
        .clear()
        .beginFill(this.activeColor)
        .drawRect(0, this.gaugeHeight-transformHeight, this.gaugeWidth+1, transformHeight)
        .endFill();
      this.renderedValue = this._value;
    } 
    
    //pullsate glow?
  }
}
