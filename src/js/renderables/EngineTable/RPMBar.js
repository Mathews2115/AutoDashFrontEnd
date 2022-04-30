import { BitmapText, Graphics, RenderTexture, Sprite } from "pixi.js";
import EngineTable from "./EngineTable";
import LabelBar from "./LabelBar";

export default class RPMBar extends LabelBar {
  constructor(options, renderer, texture) {
    super(options, renderer, texture);
    this.initialize(options, texture);
  }

  initialize({theme, xCellUnit, totalXCells}, texture) {
    if (!texture) {
      const labelBarGraphics = new Graphics();
      // draw tick marks every
      const length = totalXCells / 2;
      const tickSpace =  EngineTable.cellWidth * 2;
      for (let i = 0; i < length; i++) {
        if(i === 0) {
          labelBarGraphics
            .beginFill( theme.gaugeActiveColor)
            .drawRect((i * tickSpace), 0, 2, 40)
            .endFill();
        } else if (i % 2 === 0) {
          const text = new BitmapText(`${i * xCellUnit * 2}`, {
            fontName: "Orbitron",
            fontSize: 16,
            align: "center",
          });
          text.anchor.set(0.5, 0);
          text.x = i * tickSpace;
          text.y = 7;
          text.angle = 180;
          text.tint =  theme.gaugeActiveColor;
          labelBarGraphics.addChild(text);
          labelBarGraphics
            .beginFill( theme.gaugeActiveColor)
            .drawRect((i * tickSpace)-2, 0, 4, 8)
            .endFill();
        } else {
          labelBarGraphics
            .beginFill( theme.gaugeActiveColor)
            .drawRect((i * tickSpace)-2, 0, 4, 20)
            .endFill();
        }
      }
      this.barTexture = this.renderer.generateTexture(labelBarGraphics);
      this.labelBar.texture = this.barTexture;
      labelBarGraphics.destroy(true);
    }   
    
    this.indicator
      .beginFill(0xFFFFFF)
      .drawRect(0-2, 0, 4, 30)
      .endFill();
    this.indicator.tint = theme.warningColor 
    this.indicator.cacheAsBitmap = true;
  }

  scaleAnimate(x,y, scaleFactor, animationDuration) {
    this.animate({ x: x, scaleX: scaleFactor, }, animationDuration)
  }
}