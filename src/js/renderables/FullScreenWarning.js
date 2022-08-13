import {BitmapText, Graphics} from "pixi.js";
import { SCREEN } from "../appConfig";
import Renderable from "./Renderable";
import { RENDER_KEYS } from "./Renderables";
import { DATA_KEYS, WARNING_KEYS } from "../common/dataMap";
import { gsap } from "gsap";


const ID = RENDER_KEYS.FULL_SCREEN_WARNING;

class FullScreenWarnings extends Renderable {
  constructor({ renderer, theme }) {
    super({ renderer, theme });
    this._dashID = ID;
    this._value = null;
    this.rpm = 0;
    this._rpm = 0;
    this.renderedValue = null;
    this.revNeededText = null;
    this.noRPMText = null;
    // const animTest = () => {
    //   anim.to(renderedValue, {
    //      alpha: 0,
        
    //     duration: 1,
    //     ease: "power2.inOut",
    //     onComplete: () => {
    //       anim.to(renderedValue, {
    //         alpha: 1,
            
    //         duration: 1,
    //         ease: "power2.inOut",
    //         onComplete: animTest,
    //       });
    //     }
    //   });
    // }
  }
  

  get gaugeWidth() {
    return SCREEN.WIDTH;
  }

  get gaugeHeight() {
    return SCREEN.HEIGHT;
  }

  get noRPM() {
    return this.rpm < 100;
  }

  get revNeeded() {
    return this.rpm > 0 && this.rpm < 650;
  }

  set value(dataSet) {
    // ALL THE DATA
    this._value = dataSet;
    this.rpm = this._value[DATA_KEYS.RPM];
  }

  initialize() {
    if (!this.initialized) {
      this.renderedValue = null;
      this.revNeededText = new BitmapText("REV!!!", {
        fontName: "Orbitron",
        fontSize: 142,
        align: "center",
      });
      this.noRPMText = new BitmapText("WAKE UP!!!", {
        fontName: "Orbitron",
        fontSize: 142,
        align: "center",
      });

      // center text in screen
      this.revNeededText.x = SCREEN.WIDTH / 2;
      this.revNeededText.y = SCREEN.HEIGHT / 2;
      this.revNeededText.anchor.set(0.5);
      this.revNeededText.rotation = Math.PI;
      this.revNeededText.visible = false;

      this.noRPMText.x = SCREEN.WIDTH / 2;
      this.noRPMText.y = SCREEN.HEIGHT / 2;
      this.noRPMText.anchor.set(0.5);
      // roate 180 degrees
      this.noRPMText.rotation =  Math.PI;
      this.noRPMText.visible = false;

      this.addChild(this.revNeededText, this.noRPMText);
    }
    this.revNeededText.tint = this.theme.warningColor;
    this.noRPMText.tint = this.theme.dangerColor;
  }

  update() {
    if (this._rpm != this.rpm) {
      this._rpm = this.rpm;
      if(this.noRPM) {
        this.revNeededText.visible = false;
        this.noRPMText.visible = true;
      } else if (this.revNeeded) {
        this.revNeededText.visible = true;
        this.noRPMText.visible = false;
      } else {
        this.revNeededText.visible = false;
        this.noRPMText.visible = false;
      }
    }
  }
}

FullScreenWarnings.ID = ID;
export default FullScreenWarnings;
