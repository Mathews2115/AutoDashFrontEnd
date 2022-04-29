import * as PIXI from "pixi.js";
import { BitmapText } from "pixi.js";


// based on the npm pixi fps 

const DEFAULT_FONT_SIZE = 30;
const DEFAULT_FONT_COLOR = 0xfff000;

class FPSTextField extends PIXI.Container {
  constructor() {
    super();
    const defaultStyle = new PIXI.TextStyle({
      fontSize: DEFAULT_FONT_SIZE,
      fill: DEFAULT_FONT_COLOR,
    });
    this._timeValues = [];
    this._lastTime = new Date().getTime();
    // this._fpsTextField = new PIXI.Text("", { ...defaultStyle, ...this.style });

    this._fpsTextField = new BitmapText("0", {
      fontName: "Orbitron",
      fontSize: 16,
      align: "center",
    });
    this._fpsTextField.angle = 180;
    this._fpsTextField.tint = 0xf00000;

    this._fpsTicker = new PIXI.Ticker();
    this._fpsTicker.add(() => {
      this.measureFPS();
    });
    this._fpsTicker.start();
    this.addChild(this._fpsTextField);
  }

  set style(style) {
    // this._fpsTextField.style = style;
  }

  measureFPS()  {
    const currentTime = new Date().getTime();
    this._timeValues.push(1000 / (currentTime - this._lastTime));
    if (this._timeValues.length === 30) {
        let total = 0;
        for (let i = 0; i < 30; i++) {
            total += this._timeValues[i];
        }
        this._fpsTextField.text = (total / 30).toFixed(2);
        this._timeValues.length = 0;
    }
    this._lastTime = currentTime;
  }
}

export default FPSTextField;