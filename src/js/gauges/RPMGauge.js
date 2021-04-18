import * as PIXI from "pixi.js";
import { RPM_CONFIG, SCREEN, DEFAULT_COLORS } from "../appConfig";
import { GlowFilter } from "@pixi/filter-glow";
import { ColorOverlayFilter } from "@pixi/filter-color-overlay";

const STATE_ENUM = {
  DANGER: 0,
  WARNING: 1,
  NORMAL: 2,
}

export class RPMGauge extends PIXI.Container {
  constructor({ renderer, theme }) {
    super();
    this.renderer = renderer;
    this.theme = theme;
    this.transformHeight = 0;

    // Value to be rendered
    this._value = RPM_CONFIG.MIN;

    // What value the gauge rendered last
    this.renderedValue = this._value;

    this.foregroundTextures = new Array(3);
    this._storedfilters = new Array(3);
    this._activeColors = new Array(3);
    this._gaugeDisplayState = STATE_ENUM.DANGER;
  }

  initialize() {
    // colors
    this._activeColors[STATE_ENUM.NORMAL] = this.theme.gaugeActiveColor;
    this._activeColors[STATE_ENUM.WARNING] =  this.theme.warningColor
    this._activeColors[STATE_ENUM.DANGER] = this.theme.dangerColor

    const background = new PIXI.Graphics();
    background
      .beginFill(0xffffff)
      .lineStyle(0)
      .drawPolygon([
        0,0,
        this.gaugeWidth, 0,
        this.gaugeWidth * 0.2, this.gaugeHeight,
        0, this.gaugeHeight
      ])
      .endFill();

    ///////// background shape
    background.tint = this.theme.gaugeBgColor;
    this.addChild(background);

    ///////// foreground shape
    const foreground = new PIXI.Graphics();
    const segments = RPM_CONFIG.SEGMENTS;
    const segmentHeight = this.gaugeHeight / segments;
    foreground.beginFill(this.theme.gaugeActiveColor)
      .lineStyle(0);
    for (let index = 0; index < segments; index++) {
      foreground.drawRect(0, segmentHeight * index, this.gaugeWidth, segmentHeight - 4);
    }
    foreground.endFill();
    foreground.mask = new PIXI.Graphics(background.geometry);

    // create normal sprite
    this.foregroundTextures[STATE_ENUM.NORMAL] = this.renderer.generateTexture(foreground);

    // create warning sprite
    foreground.tint = this.theme.warningColor;
    this.foregroundTextures[STATE_ENUM.WARNING] = this.renderer.generateTexture(foreground);

    // create danger sprite
    foreground.tint = this.theme.dangerColor;
    this.foregroundTextures[STATE_ENUM.DANGER] = this.renderer.generateTexture(foreground);
    foreground.mask.destroy(true);
    foreground.destroy(true);// remove grafic ref and cache texture

    this.foregroundSprite = new PIXI.Sprite(this.foregroundTextures[STATE_ENUM.DANGER])

    ////////// FILTERS
    this._storedfilters[STATE_ENUM.NORMAL] = new GlowFilter({
        distance: 10,
        outerStrength: 1,
        innerStrength: 0,
        color: this._activeColors[STATE_ENUM.NORMAL],
        quality: 0.9,
      });
    this._storedfilters[STATE_ENUM.WARNING] = new GlowFilter({
      distance: 10,
      outerStrength: 1,
      innerStrength: 0,
      color: this._activeColors[STATE_ENUM.WARNING],
      quality: 0.9,
    });
    this._storedfilters[STATE_ENUM.DANGER] = new GlowFilter({
      distance: 10,
      outerStrength: 1,
      innerStrength: 0,
      color: this._activeColors[STATE_ENUM.DANGER],
      quality: 0.9,
    });

    // create the active stencil for the gauge (show/hide the foreground as the gauge changes)
    this.gaugeStencil = new PIXI.Graphics();
    this.gaugeStencil.drawRect(0, 0, this.gaugeWidth, this.gaugeHeight);
    this.gaugeStencil.position.set(this.gaugeWidth, this.gaugeHeight)
    this.gaugeStencil.angle = 180;
    this.activeContainer = new PIXI.Container();
    this.activeContainer.addChild(this.foregroundSprite)
    this.activeContainer.mask = this.gaugeStencil 

    this.addChild(this.gaugeStencil, this.activeContainer);
  }

  get activeColor() {
    if (this.value <= RPM_CONFIG.DANGER_LOW) {
      return this.theme.dangerColor;
    } else if (this.value <= RPM_CONFIG.WARNING_LOW) {
      return this.theme.warningColor;
    } else if (this.value >= RPM_CONFIG.DANGER_HIGH) {
      return this.theme.dangerColor;
    } else if (this.value >= RPM_CONFIG.WARNING_HIGH) {
      return this.theme.warningColor;
    } else {
      return this.theme.gaugeActiveColor;
    }
  }

  get activeFilter() {
    return this._storedfilters[this._gaugeDisplayState];
  }

  get activeTexture(){
    return this.foregroundTextures[this._gaugeDisplayState];
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

    if (this.value < RPM_CONFIG.DANGER_LOW) {
      this._gaugeDisplayState = STATE_ENUM.DANGER;
    } else if (this.value < RPM_CONFIG.WARNING_LOW) {
      this._gaugeDisplayState = STATE_ENUM.WARNING;
    } else if (this.value >= RPM_CONFIG.DANGER_HIGH) {
      this._gaugeDisplayState = STATE_ENUM.DANGER;
    } else if (this.value >= RPM_CONFIG.WARNING_HIGH) {
      this._gaugeDisplayState = STATE_ENUM.WARNING;
    } else {
      this._gaugeDisplayState = STATE_ENUM.NORMAL;
    }
  }

  update(_delta) {
    if (this._value != this.renderedValue) {
      this.activeContainer.filters = [this.activeFilter];
      this.foregroundSprite.texture = this.activeTexture;
      
      this.gaugeStencil.scale.set(1, (this._value / RPM_CONFIG.MAX));

      this.renderedValue = this._value;
    }
  }
}

//TODO:
// add in LIMIT drawing
