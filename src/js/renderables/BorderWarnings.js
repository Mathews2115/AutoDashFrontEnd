import * as PIXI from "pixi.js";
import { SCREEN } from "../appConfig";
import { GlowFilter } from "@pixi/filter-glow";
import Renderable from "./Renderable";
import { RENDER_KEYS } from "./Renderables";
import { DATA_KEYS } from "../dataMap";
//Aliases
let Graphics = PIXI.Graphics;

const ID = RENDER_KEYS.WARNING_BORDER;

// this.value flags
// xxxx 0000 <= Critical flags
// 0000 xxxx Warning and other status Flags
const GPS_NOT_ACQUIRED = 0x01; // 0000 0001
const ERROR_FLAGS = 0x10;     //
const COMM_ERROR = 0x10       // 0001 0000
const GPS_ERROR = 0x20;       // 0010 0000

class BorderWarnings extends Renderable {
  constructor({ renderer, theme }) {
    super({ renderer, theme });
    this._dashID = ID;
    this.theme = theme;
    this._value = 0;
    this.renderedValue = this._value;
    this.borders = [];
  }

  get gaugeWidth() {
    return SCREEN.WIDTH;
  }
  get gaugeHeight() {
    return SCREEN.HEIGHT;
  }

  set value(dataSet) {
    this._value = 0;
    if (dataSet[DATA_KEYS.GPS_ERROR]) this._value |= GPS_ERROR;
    if (!dataSet[DATA_KEYS.GPS_ACQUIRED]) this._value |= GPS_NOT_ACQUIRED;
    if (dataSet[DATA_KEYS.COMM_ERROR]) this._value |= COMM_ERROR;
  }

  initialize() {
    // draw initial border geometry
    const vert = new Graphics();
    const horz = new Graphics();

    vert
      .beginFill(0xffffff)
      .lineStyle(0)
      .drawRect(0, 0, SCREEN.BORDER_WIDTH-5, this.gaugeHeight)
      .endFill();
    horz
      .beginFill(0xffffff)
      .lineStyle(0)
      .drawRect(0, 0, this.gaugeWidth, SCREEN.BORDER_WIDTH-5)
      .endFill(); 

    this.borders = [
      horz,
      vert,
      new Graphics(horz.geometry),
      new Graphics(vert.geometry),
    ]
    this.borders[2].y = this.gaugeHeight - SCREEN.BORDER_WIDTH + 5;
    this.borders[3].x = this.gaugeWidth - SCREEN.BORDER_WIDTH + 5;

    this.addChild(...this.borders);
    // try initial tag geometry
    this.renderable = false;
  }

  update() {
    if (this._value != this.renderedValue) {
      this.renderable = !!this._value;
      if (this._value) {
        const tint = this._value >= ERROR_FLAGS ? this.theme.dangerColor : 0x00FF00;
        this.borders.forEach(gfx => gfx.tint = tint);
      }
      this.renderedValue = this._value;
    }
  }
}

BorderWarnings.ID = ID;
export default BorderWarnings;