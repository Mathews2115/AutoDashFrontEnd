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

const tagRctSize = 50;
const tagBump = tagRctSize*.1;
const tagWidth = tagRctSize + tagBump;
const resources = PIXI.Loader.shared.resources;

const _createTagGeometry = () => {
  const gfx = new Graphics();
  gfx
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
  return gfx;
}

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

  createTag(tint, texture) {
    const renderContainer = new PIXI.Container();
    const tagGeomtry = _createTagGeometry();
    tagGeomtry.tint = tint;

    let tx = new PIXI.Sprite(texture);
    tx.anchor.set(0.5);
    // tx.x = (tagRctSize/2);
    // tx.y = (tagRctSize/2);
    tx.setTransform(tagRctSize/2,tagRctSize/2,0.6,0.6,0, 0, 0,0,0); // TODO: reduce actual texture sizes and then remove scaling code
    
    tagGeomtry.addChild(tx);
    
    renderContainer.addChild(tagGeomtry);
    const renderTexture = this.appRenderer.generateTexture(renderContainer);
    const tag = new PIXI.Sprite(renderTexture);
    renderContainer.destroy(true); // clean up

    tag.renderable = false; // update logic determines if/when it needs to show
    
    tag.x = SCREEN.WIDTH;
    tag.y = SCREEN.BORDER_WIDTH - 5;
    return tag;  
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
    
    const gpsErrorTag = this.createTag(0xff7c00, resources.gpsErrorPng.texture);
    const gpsNotAcquiredTag = this.createTag(0x00FF00, resources.gpsNoSignalPng.texture);
    const commErrorTag = this.createTag(this.theme.dangerColor, resources.warningPng.texture);
    
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

  // TODO:  if comm error; only show that warning since we know nowthing else?  or dim the rest??
  //        GPS:  if gps error; dont show other GPS warnings

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