import * as PIXI from "pixi.js";
import { SCREEN } from "../appConfig";
import Renderable from "./Renderable";
import { RENDER_KEYS } from "./Renderables";
import { DATA_KEYS, WARNING_KEYS } from "../dataMap";
import { gsap } from "gsap";
//Aliases
let Graphics = PIXI.Graphics;

const ID = RENDER_KEYS.WARNING_BORDER;
   
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
  valueOf(mask) {
    return !!(this._value & (128 >> mask % 8));
  }

  set value(dataSet) {
    this._value = dataSet[DATA_KEYS.WARNINGS];
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
    tag.tint = tint; // save this off so that the borders can adopt this value in the update
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
    const batteryTag = this.createTag(this.theme.dangerColor, resources.batteryPng.texture);
    const fuelTag = this.createTag(this.theme.dangerColor, resources.fuelPng.texture);
    const oilTag = this.createTag(this.theme.dangerColor, resources.oilPng.texture);
    const tempTag = this.createTag(this.theme.dangerColor, resources.tempPng.texture);
    
    // order of severity  //(128 >> i % 8)
    this.tags = {
      commError: { mask: WARNING_KEYS.COMM_ERROR, tag: commErrorTag, tl: gsap.timeline()},
      lowFuel: { mask: WARNING_KEYS.LOW_FUEL, tag: fuelTag, tl: gsap.timeline()},
      oil: { mask: WARNING_KEYS.OIL_PRESSURE, tag: oilTag, tl: gsap.timeline()},
      temp: { mask: WARNING_KEYS.ENGINE_TEMPERATURE, tag: tempTag, tl: gsap.timeline()},
      gpsError: { mask: WARNING_KEYS.GPS_ERROR, tag: gpsErrorTag, tl: gsap.timeline()},
      battery: { mask: WARNING_KEYS.BATT_VOLTAGE, tag: batteryTag, tl: gsap.timeline()},
      gpsNotAcquired: { mask: WARNING_KEYS.GPS_ACQUIRED, tag: gpsNotAcquiredTag, tl: gsap.timeline()},
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
      // this only gets called if there is a change; so iterate through all tags
      // and send them to their new spots
      let offset = 0;
      let currentTint = null;
      for (const [key, tagData] of Object.entries(this.tags)) {
        if (this.valueOf(tagData.mask)) {
          if (!currentTint) currentTint = tagData.tag.tint;
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

      if (this._value) {
        this.renderable = true;
        // make sure the border takes on the issue with the highest priority/severity
        this.borders.forEach(gfx => gfx.tint = currentTint);
      }

      this.renderedValue = this._value;
    }
  }
}

BorderWarnings.ID = ID;
export default BorderWarnings;