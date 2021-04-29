// ideas - keep track of background, active, etc colors!
// redraw if theme change
// TODO: make this be the one that contructs the scene

import * as PIXI from "pixi.js";
import { PedalGauge } from "../js/gauges/PedalGauge";
import { PEDAL_CONFIG, RPM_CONFIG, SCREEN, DEFAULT_COLORS } from "./appConfig";
import { RPMGauge } from "./gauges/RPMGauge";
import PixiFps from "pixi-fps";

//Aliases
let Container = PIXI.Container;

const MODES = { TEST: "test", LIVE: "live" };

function createRPMLogo() {
  const slantStart = 5;
  const totalWidth =
    this.pedalGauge.gaugeWidth +
    this.rpmGauge.gaugeWidth +
    SCREEN.PADDING +
    SCREEN.PADDING;
  const firstEnd = totalWidth *.25
  const secondStart = totalWidth * .75;
  const rpmLogo = new PIXI.Graphics();
  rpmLogo
    .beginFill(this.theme.gaugeActiveColor)
    .drawPolygon([
      slantStart, 0,
      0, SCREEN.PADDING,
      firstEnd, SCREEN.PADDING,
      firstEnd, 0,
    ])
    .drawPolygon([
      secondStart, 0,
      secondStart, SCREEN.PADDING,
      totalWidth, SCREEN.PADDING,
      totalWidth + slantStart, 0,
    ])
    .endFill();

  const text =  new PIXI.BitmapText('RPM', { fontName: 'Orbitron', fontSize: 50, align: 'left' });
  text.angle = 180;  // no idea what this is flipped??
  text.x = firstEnd + 5;
  text.y = -SCREEN.PADDING*2
  rpmLogo.addChild(text);

  const renderedTexture = this.renderer.generateTexture(rpmLogo);
  rpmLogo.destroy(true);
  return new PIXI.Sprite(renderedTexture);
}

export class DashApp {
  /**
   * @param { PIXI.Renderer } renderer
   * @param { PIXI.Ticker } ticker
   */
  constructor(renderer, ticker) {
    this.renderer = renderer;
    this.ticker = ticker;
    this.stage = new PIXI.Container();
    this.stage.interactiveChildren = false; // dont bother checking anyone for interactions

    this.setColors();
    this.state = (/** @type {Number} */ delta) => {};
  }

  setColors() {
    this.theme = {
      gaugeBgColor: DEFAULT_COLORS.gaugeBgColor,
      gaugeActiveColor: DEFAULT_COLORS.gaugeActiveColor,
      dangerColor: DEFAULT_COLORS.dangerColor,
      warningColor: DEFAULT_COLORS.warningColor,
      nominalColor: DEFAULT_COLORS.nominalColor,
    };
  }

  initialize() {
    // initialize all children
    // TODO; iterate through each draw objects children
    // this.children.forEach(drawable => {
    //   if ("initialize" in drawable) {
    //     drawable.initialize();
    //   }
    // });
    // RPM container
    const rpmCluster = new Container();
    rpmCluster.x = SCREEN.BORDER_WIDTH;
    rpmCluster.y = SCREEN.RPM_CLUSTER_Y;

    this.pedalGauge = new PedalGauge({
      renderer: this.renderer,
      theme: this.theme,
    });
    this.rpmGauge = new RPMGauge({
      renderer: this.renderer,
      theme: this.theme,
    });

    const rpmLogoTexture = createRPMLogo.apply(this);
    rpmLogoTexture.x = SCREEN.BORDER_WIDTH;
    rpmLogoTexture.y = SCREEN.PADDING;
    this.stage.addChild(rpmLogoTexture);

    this.rpmGauge.x = this.pedalGauge.gaugeWidth + SCREEN.PADDING;
    rpmCluster.addChild(this.pedalGauge, this.rpmGauge);

    // create other clusters...
    this.stage.addChild(rpmCluster);

    this.rpmGauge.initialize();
    this.pedalGauge.initialize();

    // start rendering
    this.state = this.stateTesting; //this.stateStartup;
    // const fpsCounter = new PixiFps();

    // this.stage.addChild(s);
    this.ticker.add((delta) => this.drawLoop(delta));
  }

  /**
   * @param {number} delta - milliseconds passed since last update
   */
  stateRunning(delta) {
    //call gauges animation function
  }

  /**
   * @param {number} delta - milliseconds passed since last update
   */
  stateStartup(delta) {
    // TODO; testing phase of gauages
    this.state = this.stateRunning;
  }

  /**
   * @param {number} delta - milliseconds passed since last update
   */
  stateTesting(delta) {
    // like startup but it just keeps going and going
    if (this.pedalGauge.value == PEDAL_CONFIG.MAX) {
      this.pedalGauge.testGoBackwards = true;
    } else if (this.pedalGauge.value == PEDAL_CONFIG.MIN) {
      this.pedalGauge.testGoBackwards = false;
    }

    this.pedalGauge.value =
      this.pedalGauge.value + (this.pedalGauge.testGoBackwards ? -1 : 1);
    this.pedalGauge.update(delta);

    if (this.rpmGauge.value == RPM_CONFIG.MAX) {
      this.rpmGauge.testGoBackwards = true;
    } else if (this.rpmGauge.value == RPM_CONFIG.MIN) {
      this.rpmGauge.testGoBackwards = false;
    }
    this.rpmGauge.value =
      this.rpmGauge.value + (this.rpmGauge.testGoBackwards ? -50 : 50);
    this.rpmGauge.update(delta);
  }

  /**
   * @param {number} delta - milliseconds passed since last update
   */
  stateShutdown(delta) {
    // show MPG stats?
  }

  /**
   * @param {number} delta - milliseconds passed since last update
   */
  drawLoop(delta) {
    this.state(delta);
  }
}
