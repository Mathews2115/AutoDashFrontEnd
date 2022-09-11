import { Container, Graphics, Sprite } from "pixi.js";
import { RPM_CONFIG, SCREEN } from "../appConfig";
import { DATA_MAP } from "../common/dataMap";
import Renderable from "./Renderable";
import { RENDER_KEYS } from "./Renderables";
const RPM_KEY = DATA_MAP.RPM.id;
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

    // Value to be rendered
    this._value = RPM_CONFIG.MAX;

    // What value the gauge rendered last
    this.renderedValue = this._value;

    this._activeColors = new Array(3);
    this._gaugeDisplayState = STATE_ENUM.DANGER;

    this.background = new Graphics();
    this.background
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
    this.addChild(this.background);

    // create segmented tecture
    const foreground = new Graphics();
    const segments = RPM_CONFIG.SEGMENTS;
    let segmentHeight = this.gaugeHeight / segments;
    foreground.beginFill(0xffffff).lineStyle(0);
    for (let index = 0; index < segments; index++) {
      foreground.drawRect(
        0, segmentHeight * index,
        this.gaugeWidth, segmentHeight - (index == segments - 1 ? 0 : 4)
      );
    }
    foreground.endFill();
    foreground.mask = new Graphics(this.background.geometry);
    const texture = this.appRenderer.generateTexture(foreground);
    foreground.mask.destroy(true);
    foreground.destroy(true); // remove grafic ref and cache texture

    this.foregroundSprite = new Sprite(texture);

    this.gaugeStencil = new Graphics();
    this.gaugeStencil.drawRect(0, 0, this.gaugeWidth, this.gaugeHeight);
    // rotate gauge so it grows from bottom to top
    this.gaugeStencil.position.set(this.gaugeWidth, this.gaugeHeight);
    this.gaugeStencil.angle = 180;
    this.activeContainer = new Container();
    this.activeContainer.addChild(this.foregroundSprite);
    this.activeContainer.mask = this.gaugeStencil; // set foreground stenciling for when guage "grows" and "shrinks"
    this.addChild(this.gaugeStencil, this.activeContainer);
  }

  initialize() {
    this.renderedValue = null;
    // colors
    this._activeColors[STATE_ENUM.NORMAL] = this.theme.gaugeActiveColor;
    this._activeColors[STATE_ENUM.WARNING] = this.theme.warningColor;
    this._activeColors[STATE_ENUM.DANGER] = this.theme.dangerColor;

    ///////// background shape
    this.background.tint = this.theme.gaugeBgColor;
    this.foregroundSprite.tint = this.activeColor;
    this.initialized = true;
  }

  // the data store values we want to listen too
  get dataKey() {
    return RPM_KEY;
  }

  get activeColor() {
    return this._activeColors[this._gaugeDisplayState];
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
      this.foregroundSprite.tint = this.activeColor;
      this.gaugeStencil.scale.set(1, this._value / RPM_CONFIG.MAX);
      this.renderedValue = this._value;
    }
  }
}

RPMGauge.ID = ID;
export default RPMGauge;
