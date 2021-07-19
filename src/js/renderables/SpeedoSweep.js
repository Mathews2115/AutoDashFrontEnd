import * as PIXI from "pixi.js";
import { GlowFilter } from "@pixi/filter-glow";
import { SCREEN, SPEEDO_CONFIG } from "../appConfig";
import { DATA_KEYS } from "../common/dataMap";
import Renderable from "./Renderable";
import { RENDER_KEYS } from "./Renderables";

const SEGEMENT_PADDING = 4;
const ID = RENDER_KEYS.SPEEDO_SWEEP;
const STATE_ENUM = {
  DANGER: 0,
  WARNING: 1,
  NORMAL: 2,
};

class SpeedoSweep extends Renderable {
  constructor({ renderer, theme }) {
    super({ renderer, theme });
    this._dashID = ID;

    this._value = SPEEDO_CONFIG.MAX;
    this.renderedValue = this._value;

    this._foregroundTextures = new Array(3);
    this._storedfilters = new Array(3);
    this._activeColors = new Array(3);
    this._gaugeDisplayState = STATE_ENUM.DANGER;
  }

  // the data store values we want to listen too
  get dataKey() {
    return DATA_KEYS.GPS_SPEEED;
  }

  set value(newValue) {
    if (newValue == null || newValue < SPEEDO_CONFIG.MIN) {
      this._value = SPEEDO_CONFIG.MIN;
    } else {
      this._value = newValue;
    }
    
    if (this._value >= SPEEDO_CONFIG.DANGER_HIGH) {
      this._gaugeDisplayState = STATE_ENUM.DANGER;
      if (newValue > SPEEDO_CONFIG.MAX) this._value = SPEEDO_CONFIG.MAX; // cap the max
    } else if (this._value >= SPEEDO_CONFIG.WARNING_HIGH) {
      this._gaugeDisplayState = STATE_ENUM.WARNING;
    } else {
      this._gaugeDisplayState = STATE_ENUM.NORMAL;
    }
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
    return SCREEN.SPEEDO_CLUSTER_WIDTH;
  }
  get gaugeHeight() {
    return SCREEN.SPEEDO_CLUSTER_HEIGHT;
  }

  initialize() {
    const segments = SPEEDO_CONFIG.SEGMENTS;
    // colors
    this._activeColors[STATE_ENUM.NORMAL] = this.theme.gaugeActiveColor;
    this._activeColors[STATE_ENUM.WARNING] = this.theme.warningColor;
    this._activeColors[STATE_ENUM.DANGER] = this.theme.dangerColor;

    // magic numbers in here, chooching pixels to make it look decent
    const background = new PIXI.Graphics();
    background
      .beginFill(0xffffff)
      .lineStyle(0)
      .drawPolygon([
        0, this.gaugeHeight, // bottom left
        SCREEN.SPEEDO_SWEEP_SIZE, this.gaugeHeight, // bottom right
        SCREEN.SPEEDO_SWEEP_SIZE*2-SEGEMENT_PADDING, SCREEN.SPEEDO_SWEEP_SIZE, // angle up
        this.gaugeWidth, SCREEN.SPEEDO_SWEEP_SIZE, // bottom right end
        this.gaugeWidth, 0,
        this.gaugeWidth * 0.3-SEGEMENT_PADDING, 0, 
      ])
      .endFill();

    ///////// background shape
    background.tint = this.theme.gaugeBgColor;
    this.addChild(background);

    //////// foreground shape
    const foreground = new PIXI.Graphics();

    foreground.beginFill(this.theme.gaugeActiveColor).lineStyle(0);
    for (let index = 0; index < segments; index++) {
      foreground.drawRect(
        SCREEN.SPEEDO_SEGMENT_WIDTH * index, 0, 
        SCREEN.SPEEDO_SEGMENT_WIDTH - (index == segments - 1 ? 0 : SEGEMENT_PADDING), this.gaugeHeight
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
    this.activeContainer = new PIXI.Container();
    this.activeContainer.addChild(this.foregroundSprite);
    this.activeContainer.mask = this.gaugeStencil; // set foreground stenciling for when guage "grows" and "shrinks"
    this.activeContainer.filters = [this.activeFilter];
    this.addChild(this.gaugeStencil, this.activeContainer);

   PIXI.Ticker.shared.addOnce(() => {
      // bake in the final transform area
      this.activeContainer.filterArea = this.getBounds(); // optimize and save off filtered area
    });
  }

  update() {
    if (this._value != this.renderedValue) {
      this.activeContainer.filters = [this.activeFilter];
      this.foregroundSprite.texture = this.activeTexture;

      this.gaugeStencil.scale.set(this._value / SPEEDO_CONFIG.MAX, 1);

      this.renderedValue = this._value;
    }
  }
}

SpeedoSweep.ID = ID;
export default SpeedoSweep;
