import * as PIXI from "pixi.js";
import { RPM_CONFIG, SCREEN } from "../appConfig";
import { GlowFilter } from "@pixi/filter-glow";
import { DATA_KEYS } from "../dataMap";
import Renderable from "./Renderable";
import { RENDER_KEYS } from "./Renderables";
const ID = RENDER_KEYS.RPM_GAUGE;
const STATE_ENUM = {
  DANGER: 0,
  WARNING: 1,
  NORMAL: 2,
};

class RPMGauge extends Renderable {
  constructor({ renderer, theme }) {
    super({ renderer, theme });
    this._dashID = ID;
    this.transformHeight = 0;

    // Value to be rendered
    this._value = RPM_CONFIG.MAX;

    // What value the gauge rendered last
    this.renderedValue = this._value;

    this._foregroundTextures = new Array(3);
    this._storedfilters = new Array(3);
    this._activeColors = new Array(3);
    this._gaugeDisplayState = STATE_ENUM.DANGER;
  }

  initialize() {
    // colors
    this._activeColors[STATE_ENUM.NORMAL] = this.theme.gaugeActiveColor;
    this._activeColors[STATE_ENUM.WARNING] = this.theme.warningColor;
    this._activeColors[STATE_ENUM.DANGER] = this.theme.dangerColor;

    const background = new PIXI.Graphics();
    background
      .beginFill(0xffffff)
      .lineStyle(0)
      .drawPolygon([
        0, 0,
        this.gaugeWidth, 0,
        this.gaugeWidth * 0.2, this.gaugeHeight,
        0, this.gaugeHeight,
      ])
      .endFill();

    ///////// background shape
    background.tint = this.theme.gaugeBgColor;
    this.addChild(background);

    ///////// foreground shape
    const foreground = new PIXI.Graphics();
    const segments = RPM_CONFIG.SEGMENTS;
    let segmentHeight = this.gaugeHeight / segments;
    foreground.beginFill(this.theme.gaugeActiveColor).lineStyle(0);
    for (let index = 0; index < segments; index++) {
      foreground.drawRect(
        0, segmentHeight * index,
        this.gaugeWidth, segmentHeight - (index == segments - 1 ? 0 : 4)
      );
    }
    foreground.endFill();
    foreground.mask = new PIXI.Graphics(background.geometry);

    // create normal sprite
    this._foregroundTextures[STATE_ENUM.NORMAL] = this.appRenderer.generateTexture(
      foreground
    );

    // create warning sprite
    foreground.tint = this.theme.warningColor;
    this._foregroundTextures[
      STATE_ENUM.WARNING
    ] = this.appRenderer.generateTexture(foreground);

    // create danger sprite
    foreground.tint = this.theme.dangerColor;
    this._foregroundTextures[STATE_ENUM.DANGER] = this.appRenderer.generateTexture(
      foreground
    );
    foreground.mask.destroy(true);
    foreground.destroy(true); // remove grafic ref and cache texture

    this.foregroundSprite = new PIXI.Sprite(
      this._foregroundTextures[STATE_ENUM.DANGER]
    );

    ////////// FILTERS
    this._storedfilters[STATE_ENUM.NORMAL] = new GlowFilter({
      distance: 8,
      outerStrength: 1,
      innerStrength: 0,
      color: this._activeColors[STATE_ENUM.NORMAL],
      quality: 0.2,
    });
    this._storedfilters[STATE_ENUM.WARNING] = new GlowFilter({
      distance: 8,
      outerStrength: 1,
      innerStrength: 0,
      color: this._activeColors[STATE_ENUM.WARNING],
      quality: 0.2,
    });
    this._storedfilters[STATE_ENUM.DANGER] = new GlowFilter({
      distance: 8,
      outerStrength: 1,
      innerStrength: 0,
      color: this._activeColors[STATE_ENUM.DANGER],
      quality: 0.2,
    });

    this.gaugeStencil = new PIXI.Graphics();
    this.gaugeStencil.drawRect(0, 0, this.gaugeWidth, this.gaugeHeight);
    // rotate gauge so it grows from bottom to top
    this.gaugeStencil.position.set(this.gaugeWidth, this.gaugeHeight);
    this.gaugeStencil.angle = 180;
    this.activeContainer = new PIXI.Container();
    this.activeContainer.addChild(this.foregroundSprite);
    this.activeContainer.mask = this.gaugeStencil; // set foreground stenciling for when guage "grows" and "shrinks"
    this.activeContainer.filterArea = this.getBounds(); // optimize and save off filtered area

    this.addChild(this.gaugeStencil, this.activeContainer);
  }

  // the data store values we want to listen too
  get dataKey() {
    return DATA_KEYS.RPM;
  }

  get activeColor() {
    return this._activeColors[this._gaugeDisplayState];
  }

  get activeFilter() {
    return this._storedfilters[this._gaugeDisplayState];
  }

  get activeTexture() {
    return this._foregroundTextures[this._gaugeDisplayState];
  }

  get gaugeWidth() {
    return SCREEN.RPM_WIDTH;
  }
  get gaugeHeight() {
    return SCREEN.RPM_CLUSTER_HEIGHT;
  }

  set value(newValue) {
    this._value = newValue || RPM_CONFIG.MIN;

    if (this._value < RPM_CONFIG.DANGER_LOW) {
      this._gaugeDisplayState = STATE_ENUM.DANGER;
      if (newValue < RPM_CONFIG.MIN) this._value = RPM_CONFIG.MIN; // cap the min
    } else if (this._value < RPM_CONFIG.WARNING_LOW) {
      this._gaugeDisplayState = STATE_ENUM.WARNING;
    } else if (this._value >= RPM_CONFIG.DANGER_HIGH) {
      this._gaugeDisplayState = STATE_ENUM.DANGER;
      if (newValue > RPM_CONFIG.MAX) this._value = RPM_CONFIG.MAX; // cap the max
    } else if (this._value >= RPM_CONFIG.WARNING_HIGH) {
      this._gaugeDisplayState = STATE_ENUM.WARNING;
    } else {
      this._gaugeDisplayState = STATE_ENUM.NORMAL;
    }
  }

  update() {
    if (this._value != this.renderedValue) {
      this.activeContainer.filters = [this.activeFilter];
      this.foregroundSprite.texture = this.activeTexture;

      this.gaugeStencil.scale.set(1, this._value / RPM_CONFIG.MAX);

      this.renderedValue = this._value;
    }
  }
}

RPMGauge.DASH_ID = ID;
export default RPMGauge;
