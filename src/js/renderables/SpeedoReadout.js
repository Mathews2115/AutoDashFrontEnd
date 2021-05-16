import * as PIXI from "pixi.js";
import '@pixi/graphics-extras';
import { GlowFilter } from "@pixi/filter-glow";
import { SCREEN, SPEEDO_CONFIG } from "../appConfig";
import { DATA_KEYS } from "../dataMap";
import Renderable from "./Renderable";
import { RENDER_KEYS } from "./Renderables";

const ID = RENDER_KEYS.SPEEDO_READOUT;
class SpeedoReadout extends Renderable {
  constructor({ renderer, theme }) {
    super({ renderer, theme });
    this._dashID = ID;

    this._value = SPEEDO_CONFIG.MAX;
    this.renderedValue = this._value;
    this.bgSprite = null;
  }

  // the data store values we want to listen too
  get dataKey() {
    return DATA_KEYS.SPEEDO;
  }

  set value(newValue) {
    if (newValue == null || newValue < SPEEDO_CONFIG.MIN) {
      this._value = SPEEDO_CONFIG.MIN;
    }
  }

  get gaugeWidth() {
    return SCREEN.SPEEDO_CLUSTER_WIDTH;
  }
  get gaugeHeight() {
    return this._height;
  }
  set gaugeHeight(val) {
    this._height = val;
  }

  // MAGIC NUMBERS AHOY LOL - so much pixel chooching.  These numbers also depending on
  // renderhelpers.js placement.  Maybe I'll come back and make this less dumb...but I doubt it! :D :D :D    :|
  initialize() {
    const segmentLength = this.gaugeHeight/2 - 15;
    const segmentWidth = 20;
    const chamfer = 30;
    const inset = Math.min(chamfer, Math.min(segmentWidth, segmentLength) / 2);
    const insetPadding = 3;
    const middleSegmentPadding = (insetPadding*3)+inset; // padding the verticals use to fit the middle horizontal in there

    
    const numberBackground = new PIXI.Graphics();
    numberBackground.beginFill(0xffffff).lineStyle(0)
      // left verticals
      numberBackground.drawChamferRect(0,inset+insetPadding, segmentWidth, segmentLength, chamfer)
      numberBackground.drawChamferRect(0,middleSegmentPadding+segmentLength, segmentWidth, segmentLength, chamfer)
      
      // right verticals
      numberBackground.drawChamferRect(segmentLength,inset+insetPadding, segmentWidth, segmentLength, chamfer)
      numberBackground.drawChamferRect(segmentLength,middleSegmentPadding+segmentLength, segmentWidth, segmentLength, chamfer)
      
      // horizontals
      numberBackground.drawChamferRect(inset,0, segmentLength, segmentWidth, chamfer)
      numberBackground.drawChamferRect(inset,(insetPadding*2)+segmentLength, segmentLength, segmentWidth, chamfer)
      numberBackground.drawChamferRect(inset,inset+2+segmentLength+segmentLength, segmentLength, segmentWidth, chamfer)

      numberBackground.endFill();

    numberBackground.tint = this.theme.gaugeBgColor;

    // second number
    const numberBackground2 = new PIXI.Graphics(numberBackground.geometry);
    numberBackground2.x = numberBackground.width + SCREEN.PADDING;
    numberBackground2.tint = this.theme.gaugeBgColor;

    // group the numbers together
    const bg = new PIXI.Container();
    bg.addChild(numberBackground, numberBackground2);
    
    // render background numbers to texture and destroy graphics object
    const bgTex = this.appRenderer.generateTexture(bg);
    this.bgSprite = new PIXI.Sprite(bgTex);

    // give it a slight slant
    this.bgSprite.setTransform(0,0,1,1,0, -0.2, 0,0,0);
    bg.destroy(true);
    this.addChild(this.bgSprite);
  }

  update() {
    if (this._value != this.renderedValue) {
      this.renderedValue = this._value;
    }
  }
}

SpeedoReadout.ID = ID;
export default SpeedoReadout;
