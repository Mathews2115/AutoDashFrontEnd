import * as PIXI from "pixi.js";
import { SCREEN } from "./appConfig";
import theme from "./common/theme";
import BorderWarnings from "./renderables/BorderWarnings";
import FuelGauge from "./renderables/FuelGauge";
import Odometer from "./renderables/odometer";
import PedalGauge from "./renderables/PedalGauge";
import { Renderables, RENDER_KEYS } from "./renderables/Renderables";
import RPMGauge from "./renderables/RPMGauge";
import SpeedoReadout from "./renderables/SpeedoReadout";
import SpeedoSweep from "./renderables/SpeedoSweep";

/**
 *  @param {Object} config
 *  @param {PIXI.Renderer } config.renderer
 *  @param {PIXI.Container} config.stage
 */
export default ({renderer, stage}) => {
  const renderables = new Renderables({
    renderer: renderer,
    theme: theme,
  });
  /** @type {PedalGauge} */
  const pedalGauge = renderables.createRenderable(PedalGauge);
  /** @type {RPMGauge} */
  const rpmGauge = renderables.createRenderable(RPMGauge);
  /** @type {SpeedoSweep} */
  const speedoSpeed = renderables.createRenderable(SpeedoSweep);
  /** @type {SpeedoReadout} */
  const speedoReadout = renderables.createRenderable(SpeedoReadout);
  /** @type {BorderWarnings} */
  const borderWarnings = renderables.createRenderable(BorderWarnings);
  /** @type {FuelGauge} */
  const fuelGauge = renderables.createRenderable(FuelGauge);
  /** @type {Odometer} */
  const odometer = renderables.createRenderable(Odometer);
  
  
  const mpgCluster = new PIXI.Container();
  const fuelLogo = new PIXI.Graphics();

  /**
   * Generates texture for  to draw the ====RPM==== logo
   * @returns {PIXI.Sprite}
   */
  const createRPMLogo = () => {
    const rpmLogo = new PIXI.Graphics();
    const slantStart = 5;
    const totalWidth =
      renderables[RENDER_KEYS.PEDAL_GAUGE].gaugeWidth +
      renderables[RENDER_KEYS.RPM_GAUGE].gaugeWidth +
      SCREEN.PADDING +
      SCREEN.PADDING;
    const firstEnd = totalWidth * 0.25;
    const secondStart = totalWidth * 0.75;
    rpmLogo
      .beginFill(theme.gaugeActiveColor)
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

    const text = new PIXI.BitmapText("RPM", {
      fontName: "Orbitron",
      fontSize: 50,
      align: "left",
    });
    text.angle = 180; // no idea what app is flipped??
    text.x = firstEnd + 5;
    text.y = -SCREEN.PADDING;
    rpmLogo.addChild(text);

    const renderedTexture = renderer.generateTexture(rpmLogo);
    rpmLogo.destroy(true);
    return new PIXI.Sprite(renderedTexture);
  }
  
  const createRpmCluster = () => {     
    const rpmCluster = new PIXI.Container();
    rpmCluster.x = SCREEN.BORDER_WIDTH;
    rpmCluster.y = SCREEN.RPM_CLUSTER_Y;

    const rpmLogoTexture = createRPMLogo();
    rpmLogoTexture.x = SCREEN.BORDER_WIDTH;
    rpmLogoTexture.y = SCREEN.PADDING;

    rpmGauge.x = pedalGauge.gaugeWidth + SCREEN.PADDING;
    rpmCluster.addChild(pedalGauge, rpmGauge);

    return {rpmLogoTexture, rpmCluster};
  };
  
  const createSpeedoCluster = () => {
    const speedoCluster = new PIXI.Container();
    speedoCluster.x = rpmGauge.x + rpmGauge.gaugeWidth * 0.50; //magic fudge mumber
    speedoCluster.y = SCREEN.SPEEDO_CLUSTER_Y;

    speedoReadout.x = speedoSpeed.width - speedoReadout.width;
    speedoReadout.y = SCREEN.BOTTOM_CONTENT_Y - speedoReadout.height;
  
    const text = new PIXI.BitmapText("MPH", {
      fontName: "Orbitron",
      fontSize: 50,
      align: "left",
    });
    text.angle = 180; // no idea what app is flipped??
    text.x = speedoReadout.x - text.width - 22;; // fudge number lol
    text.y = speedoReadout.y;

    odometer.x =  speedoSpeed.width * .25
    odometer.y =  SCREEN.BOTTOM_CONTENT_Y - odometer.gaugeHeight;

    speedoCluster.addChild(speedoSpeed, speedoReadout, text, odometer);

    return speedoCluster;
  }

  const configureFuelGauge = () => {
    fuelGauge.x = SCREEN.FUEL_GAUGE_X;
    fuelGauge.y = SCREEN.BORDER_WIDTH;

    const tx = new PIXI.Sprite(PIXI.utils.TextureCache["fuel.png"]);

    tx.anchor.set(0.5,0);
    tx.x = fuelGauge.x + (fuelGauge.gaugeWidth * 0.55);
    tx.y = fuelGauge.y + fuelGauge.gaugeHeight + 10  ;
    tx.scale.set(0.6);
    return tx;
  }

  const createMpyLogo = (mpgClusterWidth) => {
    const totalWidth = mpgClusterWidth
    const firstEnd = totalWidth * 0.25; 
    const secondStart = totalWidth * 0.75;
    fuelLogo
      .beginFill(theme.gaugeActiveColor)
      .drawPolygon([
        0, 0,
        0, SCREEN.PADDING,
        firstEnd, SCREEN.PADDING,
        firstEnd, 0,
      ])
      .drawPolygon([
        secondStart, 0,
        secondStart, SCREEN.PADDING,
        totalWidth, SCREEN.PADDING,
        totalWidth, 0,
      ])
      .endFill();

    const text = new PIXI.BitmapText("MPG", {
      fontName: "Orbitron",
      fontSize: 50,
      align: "left",
    });
    text.angle = 180; // no idea what app is flipped??
    text.x = firstEnd + 5;
    text.y = -SCREEN.PADDING;
    fuelLogo.addChild(text);

    const renderedTexture = renderer.generateTexture(fuelLogo);
    fuelLogo.destroy(true);
    return new PIXI.Sprite(renderedTexture);
  }

  const createMPGCluser = (/** @type {PIXI.Container} */ speedoCluster) => {

    const mpgClusterX = speedoCluster.x + speedoSpeed.gaugeWidth + (3*SCREEN.PADDING);;
    const mpgClusterWidth = fuelGauge.x - mpgClusterX - (3*SCREEN.PADDING);
    const mpgLogo = createMpyLogo(mpgClusterWidth);
    mpgLogo.x = mpgClusterX;
    mpgLogo.y = SCREEN.PADDING;

    const mpgClusterY = mpgLogo.y +mpgLogo.height + SCREEN.PADDING;
    // const mpgClusterHeight = SCREEN.CONTENT_HEIGHT - mpgClusterY;
    mpgCluster.x = mpgClusterX;
    mpgCluster.y = mpgClusterY;

    // ---- histogram
    const background = new PIXI.Graphics();
    background
      .beginFill(theme.gaugeBgColor)
      .drawRect(0, 0, mpgClusterWidth, SCREEN.CONTENT_HEIGHT/3)
      .endFill();
    mpgCluster.addChild(background);

    // ---- current mpg bar

    // ---- text readouts
    // average

    // current

    return {mpgLogo, mpgCluster};
  }

  return {
    renderables,
    createLayout: () => {
      const {rpmLogoTexture, rpmCluster} = createRpmCluster();
      const speedoCluster = createSpeedoCluster();
      const fuelSymbol = configureFuelGauge();
      const {mpgLogo, mpgCluster} = createMPGCluser(speedoCluster);

      stage.addChild(
        fuelGauge, 
        rpmCluster, 
        speedoCluster,
        mpgCluster, 
        mpgLogo,
        rpmLogoTexture, 
        fuelSymbol,
        borderWarnings);
    },
  }
}