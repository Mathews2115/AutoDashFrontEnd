import { BitmapText, Graphics, Sprite, Texture } from "pixi.js";
import EngineTable from "./EngineTable";
import LabelBar from "./LabelBar";

const TICK_HEIGHT = 4;
const TICK_WIDTH = 10;
const TICK_OFFSET = 30;
const NUMBER_PADDING = 4;
const NUMBER_SPACE = 28;
const BAR_WIDTH = TICK_WIDTH + NUMBER_PADDING + NUMBER_SPACE + NUMBER_PADDING + TICK_WIDTH;

export default class KPABar extends LabelBar {
  constructor(options, renderer, texture) {
    super(options, renderer, texture);
    this.initialize(options, texture);
  }

  /**
   * 
   * @param {Object} options 
   * @param {import("../../appConfig").ThemeData} options.theme
   * @param {number} options.yCellUnit
   * @param {number} options.totalYCells
   * @param {Texture} texture 
   */
  initialize({theme, yCellUnit, totalYCells}, texture) {
    // if we arent providing a texture, the create a new one
    if (!texture) {
      const labelBarGraphics = new Graphics();

      // draw tick marks every
      const length = totalYCells;
      const tickSpace = EngineTable.cellHeight;

      // labelBarGraphics
        // .beginFill(theme.gaugeBgColorExtra)
        // .drawRect(0, 0, BAR_WIDTH, totalYCells * tickSpace)
        // .endFill();

      for (let i = 0; i < length; i++) {
        if (i === 0) {
          // top tick
          labelBarGraphics
            .beginFill(theme.gaugeActiveColor)
            .drawRect(TICK_OFFSET, 0, TICK_WIDTH, TICK_HEIGHT)
            .endFill();
        } else if (i == length) {
          // bottom tick
          labelBarGraphics
            .beginFill(theme.gaugeActiveColor)
            .drawRect(TICK_OFFSET, -(TICK_HEIGHT / 2), TICK_WIDTH, TICK_HEIGHT)
            .endFill();
        } else {
          // middle ticks
          const text = new BitmapText(`${(length - i) * yCellUnit}`, {
            fontName: "Orbitron",
            fontSize: 16,
            align: "center",
          });
          text.y = i * tickSpace - tickSpace / 2;
          text.x = TICK_WIDTH + NUMBER_PADDING;
          text.angle = 180;
          text.tint = theme.gaugeActiveColor;
          labelBarGraphics.addChild(text);
          const secondtickX = TICK_WIDTH + NUMBER_SPACE + NUMBER_PADDING * 2;
          labelBarGraphics
            .beginFill(theme.gaugeActiveColor)
            .drawRect(
              0,  (i * tickSpace) - (TICK_HEIGHT / 2),
              TICK_WIDTH, TICK_HEIGHT
            )
            .drawRect(
              secondtickX,  (i * tickSpace) - (TICK_HEIGHT / 2),
              TICK_WIDTH, TICK_HEIGHT
            )
            .endFill();
        }
      }
      this.barTexture = this.renderer.generateTexture(labelBarGraphics);
      this.labelBar.texture = this.barTexture;
      labelBarGraphics.destroy(true);
    }

    this.indicator
      .beginFill(theme.warningColor)
      .drawRect(
        0, -2,
        BAR_WIDTH, TICK_HEIGHT
      )
      .endFill();
    this.indicator.cacheAsBitmap = true;
  }

  scaleAnimate(x,y, scaleFactor, animationDuration) {
    this.animate({ y: y, scaleY: scaleFactor, }, animationDuration)
  }
}