import { SCREEN } from "./appConfig";
import * as PIXI from "pixi.js";
import PedalGauge from "./renderables/PedalGauge";
import RPMGauge from "./renderables/RPMGauge";
import { Renderables, RENDER_KEYS } from "./renderables/Renderables";
import SpeedoSweep from "./renderables/SpeedoSweep";
import SpeedoReadout from "./renderables/SpeedoReadout";
import FuelGauge from "./renderables/FuelGauge";
import BorderWarnings from "./renderables/BorderWarnings";
import theme from "./common/theme";

/**
 *  @param {Object} config
 *  @param {PIXI.Renderer } config.renderer
 *  @param {PIXI.Container} config.stage
 */
export default ({renderer, stage}) => {
  const resources = PIXI.Loader.shared.resources;
  const renderables = new Renderables({
    renderer: renderer,
    theme: theme,
  });
  const pedalGauge = renderables.createRenderable(PedalGauge);
  const rpmGauge = renderables.createRenderable(RPMGauge);
  const speedoSpeed = renderables.createRenderable(SpeedoSweep);
  const speedoReadout = renderables.createRenderable(SpeedoReadout);
  const borderWarnings = renderables.createRenderable(BorderWarnings);
  const fuelGauge = renderables.createRenderable(FuelGauge);

  const rpmLogo = new PIXI.Graphics();
  const rpmCluster = new PIXI.Container();

  /**
   * Generates texture for  to draw the ====RPM==== logo
   * @returns {PIXI.Sprite}
   */
  const createRPMLogo = () => {
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
    rpmCluster.x = SCREEN.BORDER_WIDTH;
    rpmCluster.y = SCREEN.RPM_CLUSTER_Y;

    const rpmLogoTexture = createRPMLogo();
    rpmLogoTexture.x = SCREEN.BORDER_WIDTH;
    rpmLogoTexture.y = SCREEN.PADDING;

    rpmGauge.x = pedalGauge.gaugeWidth + SCREEN.PADDING;
    rpmCluster.addChild(pedalGauge, rpmGauge);

    stage.addChild(rpmLogoTexture, rpmCluster);
    return rpmCluster
  };
  
  const createSpeedoCluster = () => {
    const speedoCluster = new PIXI.Container();
    speedoCluster.x = rpmGauge.x + rpmGauge.gaugeWidth * 0.45; //magic fudge mumber
    speedoCluster.y = SCREEN.SPEEDO_CLUSTER_Y;

    const text = new PIXI.BitmapText("MPH", {
      fontName: "Orbitron",
      fontSize: 50,
      align: "left",
    });
    text.angle = 180; // no idea what app is flipped??
    text.x = speedoSpeed.gaugeWidth * .25
    text.y = speedoSpeed.gaugeHeight - text.height- SCREEN.PADDING;

    speedoReadout.x = text.x + text.width + SCREEN.PADDING + 50;
    speedoReadout.y = speedoSpeed.sweepSize + SCREEN.PADDING;
    speedoReadout.gaugeHeight = speedoSpeed.gaugeHeight - speedoSpeed.sweepSize - SCREEN.PADDING;;
    
    speedoCluster.addChild(speedoSpeed, speedoReadout, text);

    stage.addChild(speedoCluster);
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

  return {
    renderables,
    createLayout: () => {
      createRpmCluster();
      createSpeedoCluster();
      const fuelLogo = configureFuelGauge();

      stage.addChild(fuelGauge, fuelLogo, borderWarnings);
    },
  }
}