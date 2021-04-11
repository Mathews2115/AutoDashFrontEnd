import * as PIXI from "pixi.js";
import { RPM_CONFIG, SCREEN } from "../appConfig";
import { GlowFilter } from "@pixi/filter-glow";

// NOTE:  On initialization; ALL objects at origin 0,0 (then translated to an x,y before drawn)

/**
 * @param {number} segments
 * @param {number} width
 * @param {number} height
 * @returns {PIXI.Graphics} PIXI.Graphics
 */
function drawSegments(segments, width, height) {
  const segmentHeight = height / segments;
  for (let index = 0; index < segments; index++) {
    this.drawRect(0, segmentHeight * index, width, segmentHeight - 4);
  }
  return this;
}

/**
 * @param {number} fillColor
 * @param {number} width
 * @param {number} height
 * @returns {PIXI.Graphics} PIXI.Graphics
 */
function createGeometry(fillColor, width, height) {
  return new PIXI.Graphics()
    .beginFill(fillColor)
    .lineStyle(0)
    .moveTo(0, 0)
    .lineTo(width, 0)
    .lineTo(width * 0.2, height)
    .lineTo(0, height)
    .endFill();
}

export class RPMGauge extends PIXI.Container {
  constructor({ backgroundColor, activeColor }) {
    super();

    // cache and initialize commonly used items
    this._transformHeight = 0;
    this.activeColor = activeColor;

    // Value to be rendered
    this._value = RPM_CONFIG.MIN;

    // What value the gauge rendered last
    this.renderedValue = this._value;

    // construct graphics
    this.rpmGaugeBackground = createGeometry(
      backgroundColor,
      this.gaugeWidth,
      this.gaugeHeight
    );
    this.rpmGaugeBackground.cacheAsBitmap = true;
    this.addChild(this.rpmGaugeBackground);

    this.rpmGaugeActive = new PIXI.Graphics();
    this.rpmGaugeActive.beginFill(activeColor);
    drawSegments
      .apply(this.rpmGaugeActive, [
        RPM_CONFIG.SEGMENTS,
        this.gaugeWidth,
        this.gaugeHeight,
      ])
      .endFill();
    this.rpmGaugeActive.mask = createGeometry(
      null,
      this.gaugeWidth,
      this.gaugeHeight
    );
    // save off results because this one change
    this.rpmGaugeActive.cacheAsBitmap = true;

    this.activeMask = new PIXI.Graphics();
    this.activeContainer = new PIXI.Container();  
    this.activeContainer.addChild(this.rpmGaugeActive);
    this.activeContainer.mask = this.activeMask;

    this.addChild(this.activeContainer);

    this.activeContainer.filters = [
      new GlowFilter({
        distance: 10,
        outerStrength: 1,
        innerStrength: 0,
        color: 0xf0f0f0,
        quality: 0.9,
      }),
    ];
  }

  get gaugeWidth() {
    return 200;
  }
  get gaugeHeight() {
    return SCREEN.CONTENT_HEIGHT;
  }

  get value() {
    return this._value;
  }
  set value(newValue) {
    if (newValue < RPM_CONFIG.MIN) {
      this._value = RPM_CONFIG.MIN;
    } else if (newValue > RPM_CONFIG.MAX) {
      this._value = RPM_CONFIG.MAX;
    } else {
      this._value = newValue;
    }
  }

  // TODO: use delta to gradually get there...but only if it is a small amount

  update(_delta) {
    if (this._value != this.renderedValue) {
      // // A) redraw the new size
      // // B) or make active gauge a bitmap and resize it
      this._transformHeight = (this._value / RPM_CONFIG.MAX) * this.gaugeHeight;
      this.activeMask
        .clear()
        .moveTo(this.x, this.y)
        .beginFill()
        .drawRect(
          this.x,
          this.gaugeHeight - this._transformHeight,
          this.gaugeWidth + 1,
          this._transformHeight
        )
        .endFill();
      this.renderedValue = this._value;
    }

    //pullsate glow?
  }
}
