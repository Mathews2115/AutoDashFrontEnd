import { gsap } from "gsap";
import { Container, Graphics, Sprite, Texture } from "pixi.js";

export default class LabelBar extends Container {
  constructor({theme, xCellUnit, totalXCells, yCellUnit, totalYCells}, renderer, texture) {
    super();
    this.labelbarAnim = gsap.timeline();
    this.indicatorAnim = gsap.timeline();
    this.indicator = new Graphics();
    /** @type {Sprite} */
    this.labelBar = Sprite.from(texture || Texture.WHITE);
    this.labelBar.addChild(this.indicator);
    this.addChild(this.labelBar);
    this.renderer = renderer;
  }

  get x() {
    return this.indicator.x;
  }
  set x(newX) {
    this.indicator.x = newX;
  }
  get y() {
    return this.indicator.y;
  }
  set y(newY) {
    this.indicatorAnim.clear();
    this.indicatorAnim.to(this.indicator, {
      pixi: { y: newY },
      duration: 0.1,
    });
  }

  animate(options={}, animationDuration) {
    this.labelbarAnim.clear();
    this.labelbarAnim.to(this.labelBar, {
      pixi: options,
      duration: animationDuration,
    });
  }

  scaleAnimate(x,y, scaleFactor, animationDuration) {
    throw new Error("Not implemented");
  }
}