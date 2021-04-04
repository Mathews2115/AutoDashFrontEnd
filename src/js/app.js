// ideas - keep track of background, active, etc colors!
// redraw if theme change
// TODO: make this be the one that contructs the scene

import * as PIXI from "pixi.js";
import { PedalGauge } from "../js/gauges/PedalGauge";
import { SCREEN } from "./appConfig";

//Aliases
let Container = PIXI.Container;

export class DashApp {
  /**
   * @param { PIXI.Application } renderer
   */
  constructor(renderer) {
    this.renderer = renderer;

    this.gaugeBgColor = "0xFFFFFF";
    this.gaugeActiveColor = "0xFFFFFF";
    this.dangerColor = "0xFFFFFF";
    this.warningColor = "0xFFFFFF";
    this.nominalColor = "0xFFFFFF";

    this.pedalGauge = new PedalGauge({
      backgroundColor: this.gaugeBgColor,
      activeColor: this.gaugeActiveColor,
    });
  }

  start() {
    // RPM container
    const rpmCluster = new Container();
    rpmCluster.x = SCREEN.BORDER_WIDTH;
    rpmCluster.y = SCREEN.BORDER_WIDTH;

    rpmCluster.addChild(this.pedalGauge);

    this.renderer.stage.addChild(rpmCluster);

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
