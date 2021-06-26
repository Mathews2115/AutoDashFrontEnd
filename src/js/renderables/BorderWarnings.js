import * as PIXI from "pixi.js";
import { SCREEN } from "../appConfig";
import Renderable from "./Renderable";
import { RENDER_KEYS } from "./Renderables";
import { DATA_KEYS } from "../dataMap";
import { gsap } from "gsap";

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

const tagRctSize = 80;
const tagBump = tagRctSize*.1;
const tagWidth = tagRctSize + tagBump;

class BorderWarnings extends Renderable {
  constructor({ renderer, theme }) {
    super({ renderer, theme });
    this._dashID = ID;
    this.theme = theme;
    this._value = 0;
    this.renderedValue = this._value;
    this.borders = [];
    this.tags = {}
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

  createTag() {
    const tagGeomtry = new Graphics();
    
    tagGeomtry
      .beginFill(0xffffff)
      .lineStyle(0)
      .drawPolygon([
        0, 0,       // tag edge
        tagBump, 0,
        tagBump, tagRctSize,
        0,tagRctSize-tagBump,
      ])
      .drawRect(tagBump, 0, tagRctSize, tagRctSize) // tag sqaure
      .endFill(); 
    tagGeomtry.renderable = false;
    return tagGeomtry;  
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

    // left top
    this.borders = [
      horz,
      vert,
      new Graphics(horz.geometry),
      new Graphics(vert.geometry),
    ]
    this.borders[2].y = this.gaugeHeight - SCREEN.BORDER_WIDTH + 5;
    this.borders[3].x = this.gaugeWidth - SCREEN.BORDER_WIDTH + 5;
    
    const gpsErrorTag = this.createTag();
    gpsErrorTag.tint = 0xff7c00;
    gpsErrorTag.x = SCREEN.WIDTH;

    const gpsNotAcquiredTag = new Graphics(gpsErrorTag.geometry);
    gpsNotAcquiredTag.tint = 0x00FF00;
    gpsNotAcquiredTag.x = SCREEN.WIDTH;

    const commErrorTag = new Graphics(gpsErrorTag.geometry);
    commErrorTag.tint = this.theme.dangerColor;
    commErrorTag.x = SCREEN.WIDTH;

    // order of severity
    this.tags = {
      commError: { mask: COMM_ERROR, tag: commErrorTag, tl: gsap.timeline()},
      gpsError: { mask: GPS_ERROR, tag: gpsErrorTag, tl: gsap.timeline()},
      gpsNotAcquired: { mask: GPS_NOT_ACQUIRED, tag: gpsNotAcquiredTag, tl: gsap.timeline()},
    }

    // reminder: last added is the last drawn (painters algorithm)
    Object.values(this.tags).map(d => d.tag).reverse().forEach((g) => this.addChild(g));
    this.addChild(...this.borders);

    this.renderable = false; // start out not rendering;  logic will tell us when to show
  }

  // TODO: Clean all this up buddy, jeez

  update() {
    if (this._value != this.renderedValue) {
      if (this._value) {
        this.renderable = true;
        // make sure the border takes on the issue with the highest priority/severity
        const tint = this._value >= ERROR_FLAGS ? this.theme.dangerColor : 0x00FF00;
        this.borders.forEach(gfx => gfx.tint = tint);
      }
     
      // this only gets called if there is a change; so iterate through all tags
      // and send them to their new spots
      let offset = 0;
      for (const [key, tagData] of Object.entries(this.tags)) {
        if (this._value & tagData.mask) {
          tagData.tl.clear();
          tagData.tl.to(tagData.tag, { x: (SCREEN.WIDTH - tagWidth - offset), duration: 0.7, 
                onStart:() => {
                  tagData.tag.renderable = true; 
                },
                onComplete: () => {} 
            });
          offset += tagRctSize;
        } else {
          tagData.tl.clear();
          tagData.tl.to(tagData.tag, { x: SCREEN.WIDTH, duration: 1, 
            onStart:() => {},
            onComplete: () => {
              tagData.tag.renderable = false;
              if (!this._value) this.renderable = false;  
            } 
        });
        }
      }
      this.renderedValue = this._value;
    }
  }
}

BorderWarnings.ID = ID;
export default BorderWarnings;