import * as PIXI from "pixi.js";
import { BitmapText, Container, Graphics } from "pixi.js";
import { SCREEN } from "../../appConfig";
import FuelGauge from "../FuelGauge";
import MpgGauge from "../MpgGauge";
import MpgHistogram from "../MpgHistogram";
import { RENDER_KEYS } from "../Renderables";
import SpeedoSweep from "../SpeedoSweep";
import { createLogo } from "./commonGraphics";
import speedoClusterControl from "./speedoClusterControl";

const mpgLogoSprite = new PIXI.Sprite();
/**
 * @type {BitmapText}
 */
let avgMpgText, currentMpgText;
let mpgClusterWidth = 0;

/**
 * @returns {StaticObject}
 */
const mpgClusterControl = {
  /**
   * Creates the Fuel cluster logo
   * @returns {Array<Container>}
   */
  create: ({ stage, renderer, theme, renderables }) => {
    /** @type {FuelGauge} */
    const fuelGauge = renderables[RENDER_KEYS.FUEL_GAUGE];
    /** @type {SpeedoSweep} */
    const speedoSweep = renderables[RENDER_KEYS.SPEEDO_SWEEP];
    /** @type {MpgGauge} */
    const mpgGauge = renderables[RENDER_KEYS.MPG_GAUGE];
    const speedoCluster = stage.getChildByName(speedoClusterControl.name);
    const mpgClusterX =
      speedoCluster.x + speedoSweep.gaugeWidth + 3 * SCREEN.PADDING;
    mpgClusterWidth = fuelGauge.x - mpgClusterX - 3 * SCREEN.PADDING;

    mpgLogoSprite.texture = createLogo(renderer, mpgClusterWidth, "MPG");
    mpgLogoSprite.tint = theme.gaugeActiveColor;

    mpgLogoSprite.x = mpgClusterX;
    mpgLogoSprite.y = SCREEN.PADDING;
    const mpgClusterY = mpgLogoSprite.y + mpgLogoSprite.height + SCREEN.PADDING;

    // ---- histogram
    /** @type {MpgHistogram} */
    const mpgHistogram = renderables[RENDER_KEYS.AVG_MPG_HISTOGRAM];
    // HACK ALERT: lol, here is me re-calling init again because I engineered myself in a corner....
    // ANyway, I'll come back later and refactor the layout to be more sane
    mpgHistogram.gaugeHeight = SCREEN.CONTENT_HEIGHT / 3;
    mpgHistogram.gaugeWidth = mpgClusterWidth;
    mpgHistogram.x = mpgClusterX;
    mpgHistogram.y = mpgClusterY;
    mpgHistogram.initialize(); // <------------  lol again

    // ---- current mpg bar
    mpgGauge.height = mpgClusterWidth; // force scale it down (ugh i engineered myself into a corner here)
    mpgGauge.angle = 90;
    mpgGauge.x = mpgClusterX + mpgClusterWidth;
    mpgGauge.y = mpgClusterY + mpgHistogram.height + 15;

    // ---- text readouts
    const readoutY =
      mpgClusterY + mpgHistogram.height + mpgGauge.gaugeWidth + 30;

    // average
    const averageMpgReadout = renderables[RENDER_KEYS.AVG_MPG_READOUT];
    avgMpgText = new BitmapText("AVERAGE", {
      fontName: "Orbitron",
      fontSize: 22,
      align: "left",
    });
    avgMpgText.tint = theme.gaugeActiveColor;
    avgMpgText.angle = 180;
    avgMpgText.x = mpgClusterX;
    avgMpgText.y = readoutY;
    // center it under the text
    averageMpgReadout.x =
      avgMpgText.x + avgMpgText.width / 2 - averageMpgReadout.width / 2;
    averageMpgReadout.y = avgMpgText.y + avgMpgText.height + 10;

    // current
    const currentMpgReadout = renderables[RENDER_KEYS.MPG_READOUT];
    currentMpgText = new BitmapText("CURRENT", {
      fontName: "Orbitron",
      fontSize: 24,
      align: "center",
    });
    currentMpgText.tint = theme.gaugeActiveColor;
    currentMpgText.angle = 180;
    currentMpgText.x = mpgClusterX + mpgClusterWidth * 0.5;
    currentMpgText.y = readoutY;
    currentMpgReadout.x = currentMpgText.x;
    currentMpgReadout.y = currentMpgText.y + currentMpgText.height + 10;
    return [
      mpgLogoSprite,
      mpgHistogram,
      mpgGauge,
      avgMpgText,
      averageMpgReadout,
      currentMpgText,
      currentMpgReadout,
    ];
  },
  refresh: ({ renderables, theme, renderer }) => {
    mpgLogoSprite.tint = theme.gaugeActiveColor;
    avgMpgText.tint = theme.gaugeActiveColor;
    currentMpgText.tint = theme.gaugeActiveColor;

    // center it under the text
    const averageMpgReadout = renderables[RENDER_KEYS.AVG_MPG_READOUT];
    averageMpgReadout.x =
      avgMpgText.x + avgMpgText.width / 2 - averageMpgReadout.width / 2;
    averageMpgReadout.y = avgMpgText.y + avgMpgText.height + 10;
    const currentMpgReadout = renderables[RENDER_KEYS.MPG_READOUT];
    currentMpgReadout.x = currentMpgText.x;
    currentMpgReadout.y = currentMpgText.y + currentMpgText.height + 10;
  },
};

export default mpgClusterControl;
