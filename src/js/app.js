// ideas - keep track of background, active, etc colors!
// redraw if theme change
// TODO: make this be the one that contructs the scene

import * as PIXI from "pixi.js";
import { PedalGauge } from "../js/gauges/PedalGauge";
import { SCREEN } from "./appConfig";

//Aliases
let Container = PIXI.Container;

const DEFAULT_COLORS = {
  gaugeBgColor: 0x2b2b2b,
  gaugeActiveColor: 0xFFFFFF,
  dangerColor: 0xF00,
  warningColor: 0xff7c00,
  nominalColor: 0x121BE0
}

export class DashApp {
  /**
   * @param { PIXI.Application } app
   */
  constructor(app) {
    this.app = app;
    this.setColors();

    this.pedalGauge = new PedalGauge({
      backgroundColor: this.gaugeBgColor,
      activeColor: this.gaugeActiveColor,
      renderer: this.app.renderer
    });
  }

  setColors() {
    this.gaugeBgColor = DEFAULT_COLORS.gaugeBgColor;
    this.gaugeActiveColor = DEFAULT_COLORS.gaugeActiveColor;
    this.dangerColor = DEFAULT_COLORS.dangerColor;
    this.warningColor = DEFAULT_COLORS.warningColor;
    this.nominalColor = DEFAULT_COLORS.nominalColor;
  }

  start() {
    // RPM container
    const rpmCluster = new Container();
    rpmCluster.x = SCREEN.BORDER_WIDTH;
    rpmCluster.y = SCREEN.BORDER_WIDTH;

    rpmCluster.addChild(this.pedalGauge);

    this.app.stage.addChild(rpmCluster);

    //  RPM Gauge (container)
    //   rmp background
    //   rpm active container
    //     rpm active full
    //     rpm segment mask and glow
    //   rpm mask

    //.mask = new Graphics()
    //  .beginFill(0xffffff)
    //  .drawCircle(sprite.width / 2, sprite.height / 2, Math.min(sprite.width, sprite.height) / 2)
    //  .endFill();

    // rpmCluster.addChild(pedalGauge);

    // add container to renderer stage
  }
}
