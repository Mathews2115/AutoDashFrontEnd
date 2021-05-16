import { SCREEN } from "./appConfig";
import * as PIXI from "pixi.js";
import PedalGauge from "./renderables/PedalGauge";
import RPMGauge from "./renderables/RPMGauge";
import { RENDER_KEYS } from "./renderables/Renderables";
import SpeedoSweep from "./renderables/SpeedoSweep";
import SpeedoReadout from "./renderables/SpeedoReadout";

/**
 * Generates texture for  to draw the ====RPM==== logo
 * @param {*} app
 * @returns {PIXI.Sprite}
 */
export function createRPMLogo(app) {
  const slantStart = 5;
  const totalWidth =
    app.renderables[RENDER_KEYS.PEDAL_GAUGE].gaugeWidth +
    app.renderables[RENDER_KEYS.RPM_GAUGE].gaugeWidth +
    SCREEN.PADDING +
    SCREEN.PADDING;
  const firstEnd = totalWidth * 0.25;
  const secondStart = totalWidth * 0.75;
  const rpmLogo = new PIXI.Graphics();
  rpmLogo
    .beginFill(app.theme.gaugeActiveColor)
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

  const renderedTexture = app.renderer.generateTexture(rpmLogo);
  rpmLogo.destroy(true);
  return new PIXI.Sprite(renderedTexture);
}

/**
 *
 * @param {PedalGauge} pedalGauge
 * @param {RPMGauge} rpmGauge
 * @param {{stage: PIXI.Container}} app
 */
export const createRpmCluster = (pedalGauge, rpmGauge, app) => {
  const rpmCluster = new PIXI.Container();
  rpmCluster.x = SCREEN.BORDER_WIDTH;
  rpmCluster.y = SCREEN.RPM_CLUSTER_Y;

  const rpmLogoTexture = createRPMLogo(app);
  rpmLogoTexture.x = SCREEN.BORDER_WIDTH;
  rpmLogoTexture.y = SCREEN.PADDING;

  rpmGauge.x = pedalGauge.gaugeWidth + SCREEN.PADDING;
  rpmCluster.addChild(pedalGauge, rpmGauge);

  app.stage.addChild(rpmLogoTexture, rpmCluster);
  return rpmCluster
};

/**
 * 
 * @param {SpeedoSweep} speedGauge 
 * @param {SpeedoReadout} speedoReadout 
 * @param {RPMGauge} rpmGauge 
 * @param {*} app 
 */
export const createSpeedoCluster = (speedGauge, speedoReadout, rpmGauge, app) => {
  const speedoCluster = new PIXI.Container();
  speedoCluster.x = rpmGauge.x + rpmGauge.gaugeWidth * 0.45; //magic fudge mumber
  speedoCluster.y = SCREEN.SPEEDO_CLUSTER_Y;

  const text = new PIXI.BitmapText("MPH", {
    fontName: "Orbitron",
    fontSize: 50,
    align: "left",
  });
  text.angle = 180; // no idea what app is flipped??
  text.x = speedGauge.gaugeWidth * .25
  text.y = speedGauge.gaugeHeight - text.height- SCREEN.PADDING;

  speedoReadout.x = text.x + text.width + SCREEN.PADDING + 50;
  speedoReadout.y = speedGauge.sweepSize + SCREEN.PADDING;
  speedoReadout.gaugeHeight = speedGauge.gaugeHeight - speedGauge.sweepSize - SCREEN.PADDING;;
  
  speedoCluster.addChild(speedGauge, speedoReadout, text);

  app.stage.addChild(speedoCluster);
}
