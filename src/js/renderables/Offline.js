import {BitmapText, Graphics, Sprite, Texture} from "pixi.js";
import { SCREEN } from "../appConfig";
import Renderable from "./Renderable";
import { RENDER_KEYS } from "./Renderables";
import { DATA_KEYS, WARNING_KEYS } from "../common/dataMap";
import { gsap } from "gsap";


const ID = RENDER_KEYS.OFFLINE;

const valueOf = (data, mask) => {
  return !!(data & (128 >> mask % 8));
}

class Offline extends Renderable {
  constructor({ renderer, theme }) {
    super({ renderer, theme });
    this._dashID = ID;
    this._value = null;
    this.background = null;
    this.text = null;
    this.textAnim = gsap.timeline();
  }
  

  get gaugeWidth() {
    return SCREEN.WIDTH;
  }

  get gaugeHeight() {
    return SCREEN.HEIGHT;
  }

  initialize() {
    if (!this.initialized) {
      // draw full screen sprite
      this.background = Sprite.from(Texture.WHITE);
      this.background.scale.set(
        SCREEN.WIDTH / this.background.width,
        SCREEN.HEIGHT / this.background.height
      );

      this.renderedValue = null;
      this.text = new BitmapText("OFFLINE!!!", {
        fontName: "Orbitron",
        fontSize: 142,
        align: "center",
      });
      // center text in screen
      this.text.x = SCREEN.WIDTH / 2;
      this.text.y = SCREEN.HEIGHT / 2;
      this.text.anchor.set(0.5);
      this.text.rotation = Math.PI;

      this.addChild(this.background, this.text);
    }
    this.text.tint = this.theme.dangerColor;
    this.background.tint = this.theme.backgroundColor;
  }

  set value(dataSet) {
    this._value  = valueOf(dataSet[DATA_KEYS.WARNINGS], WARNING_KEYS.ECU_COMM) || valueOf(dataSet[DATA_KEYS.WARNINGS], WARNING_KEYS.ECU_COMM);
  }

  update() {
    if (this._value != this.renderedValue) {
      if (this._value) {
        this.visible = true;
        this.textAnim
          .to(this.text, {
            alpha: 0,
            duration: 1,
            ease: "power2.inOut",
          })
          .to(this.text, {
            alpha: 1,
            duration: 1,
            ease: "power2.inOut",
          })
          .repeat(-1);

      } else {
        this.textAnim.clear();
        this.visible = false;
      }
      this.renderedValue = this._value;
    }
  }
}

Offline.ID = ID;
export default Offline;
