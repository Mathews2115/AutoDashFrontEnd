import * as PIXI from "pixi.js";
import { SCREEN } from "../appConfig";
import Renderable from "./Renderable";
import { RENDER_KEYS } from "./Renderables";
import { DATA_KEYS, WARNING_KEYS } from "../common/dataMap";
import { gsap } from "gsap";

//Aliases
let Graphics = PIXI.Graphics;

const ID = RENDER_KEYS.WARNING_BORDER;

const tagRctSize = 54;
const tagBump = tagRctSize * 0.1;
const tagWidth = tagRctSize + tagBump;
const TAG_BORDER_WIDTH = 4;

const _createTagGeometry = (backgroundColor, lineColor) => {
  const gfx = new Graphics();
  gfx
    .beginFill(backgroundColor)
    .lineStyle({ width: TAG_BORDER_WIDTH, color: lineColor })
    .drawPolygon([
      0,
      0, // tag edge
      tagRctSize,
      0,
      tagRctSize,
      tagRctSize,
      tagBump,
      tagRctSize,
      0,
      tagRctSize - tagBump,
    ])
    .endFill();
  return gfx;
};

class BorderWarnings extends Renderable {
  constructor({ renderer, theme }) {
    super({ renderer, theme });
    this._dashID = ID;
    this._value = 0xff;
    this.renderedValue = 0;
    this.borders = [
      new Graphics(),
      new Graphics(),
      new Graphics(),
      new Graphics(),
    ];
    // order of severity  //(128 >> i % 8)
    this.tags = {
      commError: {
        mask: WARNING_KEYS.ECU_COMM,
        data: null,
        tl: gsap.timeline(),
      },
      lowFuel: { mask: WARNING_KEYS.LOW_FUEL, data: null, tl: gsap.timeline() },
      oil: { mask: WARNING_KEYS.OIL_PRESSURE, data: null, tl: gsap.timeline() },
      temp: {
        mask: WARNING_KEYS.ENGINE_TEMPERATURE,
        data: null,
        tl: gsap.timeline(),
      },
      gpsError: {
        mask: WARNING_KEYS.GPS_ERROR,
        data: null,
        tl: gsap.timeline(),
      },
      battery: {
        mask: WARNING_KEYS.BATT_VOLTAGE,
        data: null,
        tl: gsap.timeline(),
      },
      gpsNotAcquired: {
        mask: WARNING_KEYS.GPS_NOT_ACQUIRED,
        data: null,
        tl: gsap.timeline(),
      },
    };
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

  /**
   *
   * @param {Number} tint
   * @param {PIXI.Texture} texture
   * @returns
   */
  createTag(tint, texture) {
    const renderContainer = new PIXI.Container();
    const tagGeomtry = _createTagGeometry(this.theme.backgroundColor, tint);

    let background = _createTagGeometry(tint, 0xffffff);
    let tx = new PIXI.Sprite(texture);
    tx.anchor.set(0.5);
    tx.setTransform(tagRctSize / 2, tagRctSize / 2, 0.6, 0.6, 0, 0, 0, 0, 0); // TODO: reduce actual texture sizes and then remove scaling code
    background.mask = tx;
    background.addChild(tx);

    renderContainer.addChild(tagGeomtry, background);
    const renderTexture = this.appRenderer.generateTexture(renderContainer);
    const tag = new PIXI.Sprite(renderTexture);
    renderContainer.destroy({ children: true }); // clean up

    tag.x = SCREEN.WIDTH - 5;
    tag.y = SCREEN.BORDER_WIDTH - 5 - TAG_BORDER_WIDTH;
    return { tag: tag, borderColor: tint };
  }

  drawBorders() {
    // draw initial border geometry
    this.borders[0]
      .beginFill(0xffffff)
      .lineStyle(0)
      .drawRect(0, 0, this.gaugeWidth, SCREEN.BORDER_WIDTH - 5)
      .endFill();
    this.borders[1]
      .beginFill(0xffffff)
      .lineStyle(0)
      .drawRect(0, 0, SCREEN.BORDER_WIDTH - 5, this.gaugeHeight)
      .endFill();
    this.borders[2]
      .beginFill(0xffffff)
      .lineStyle(0)
      .drawRect(0, 0, this.gaugeWidth, SCREEN.BORDER_WIDTH - 5)
      .endFill();
    this.borders[3]
      .beginFill(0xffffff)
      .lineStyle(0)
      .drawRect(0, 0, SCREEN.BORDER_WIDTH - 5, this.gaugeHeight)
      .endFill();
    this.borders[2].y = this.gaugeHeight - SCREEN.BORDER_WIDTH + 5;
    this.borders[3].x = this.gaugeWidth - SCREEN.BORDER_WIDTH + 5;
  }

  drawTags() {
    // if already initialized, destroy old tags before regenerating
    if (this.initialized) {
      Object.values(this.tags)
        .map((d) => d.data.tag)
        .forEach((g) =>
          g.destroy({
            children: true,
            texture: true,
            baseTexture: true,
          })
        );
    }

    this.tags.gpsError.data = this.createTag(
      0xff7c00,
      PIXI.utils.TextureCache["GPS_error.png"]
    );
    this.tags.gpsNotAcquired.data = this.createTag(
      0x00ff00,
      PIXI.utils.TextureCache["GPS_no_signal.png"]
    );
    this.tags.commError.data = this.createTag(
      this.theme.dangerColor,
      PIXI.utils.TextureCache["warning.png"]
    );
    this.tags.battery.data = this.createTag(
      0xffae42,
      PIXI.utils.TextureCache["battery.png"]
    );
    this.tags.lowFuel.data = this.createTag(
      0xffeb00,
      PIXI.utils.TextureCache["fuel.png"]
    );
    this.tags.oil.data = this.createTag(
      this.theme.dangerColor,
      PIXI.utils.TextureCache["oil.png"]
    );
    this.tags.temp.data = this.createTag(
      this.theme.dangerColor,
      PIXI.utils.TextureCache["temp.png"]
    );
  }

  initialize() {
    this.drawBorders();
    this.drawTags();
    
    if (!this.initialized) {
      // reminder: last added is the last drawn (painters algorithm)
      Object.values(this.tags)
        .map((d) => d.data.tag)
        .reverse()
        .forEach((g) => this.addChild(g));
      this.addChild(...this.borders);
      this.initialized = true;
    }
  }

  // TODO: Clean all this up buddy, jeez
  update() {
    if (this._value != this.renderedValue) {
      // this only gets called if there is a change; so iterate through all tags
      // and send them to their new spots
      let offset = 0;
      let currentTint = null;
      for (const [key, tagData] of Object.entries(this.tags)) {
        if (this.valueOf(tagData.mask)) {
          // if current tag is active...
          if (!currentTint) currentTint = tagData.data.borderColor;
          tagData.tl.clear();
          tagData.tl.to(tagData.data.tag, {
            x: SCREEN.WIDTH - tagWidth - offset - 5,
            duration: 0.7,
            onStart: () => {
              tagData.data.tag.visible = true;
            },
            onComplete: () => {},
          });
          offset += tagRctSize - 2;
        } else {
          tagData.tl.clear();
          tagData.tl.to(tagData.data.tag, {
            x: SCREEN.WIDTH,
            duration: 1,
            onStart: () => {},
            onComplete: () => {
              tagData.data.tag.visible = false;
              if (!this._value) {
                this.visible = false;
              }
            },
          });
        }
      }

      if (this._value && this._value != this.renderedValue) {
        this.visible = true;

        if (currentTint) {
          // make sure the border takes on the issue with the highest priority/severity
          this.borders.forEach((gfx) => (gfx.tint = currentTint));
        }
      }

      this.renderedValue = this._value;
    }
  }
}

BorderWarnings.ID = ID;
export default BorderWarnings;
