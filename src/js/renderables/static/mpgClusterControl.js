import * as PIXI from "pixi.js";
import { BitmapText, Container, Graphics } from "pixi.js";
import { SCREEN } from "../../appConfig";
import FuelGauge from "../FuelGauge";
import MpgGauge from "../MpgGauge";
import MpgHistogram from "../MpgHistogram";
import { RENDER_KEYS } from "../Renderables";
import SpeedoSweep from "../SpeedoSweep";
import speedoClusterControl from "./speedoClusterControl";

const mpgLogoSprite = new PIXI.Sprite();
/**
 * @type {BitmapText}
 */
let avgMpgText, currentMpgText;
let mpgClusterWidth = 0;

const createMpyLogo = ({ renderer, theme, mpgClusterWidth }) => {
  const totalWidth = mpgClusterWidth;
  const firstEnd = totalWidth * 0.25;
  const secondStart = totalWidth * 0.75;
  const logo = new Graphics();
  logo
    .beginFill(theme.gaugeActiveColor)
    .drawPolygon([
      0, 0,
      0, SCREEN.PADDING,
      firstEnd,  SCREEN.PADDING,
      firstEnd, 0,
    ])
    .drawPolygon([
      secondStart,  0,
      secondStart, SCREEN.PADDING,
      totalWidth, SCREEN.PADDING,
      totalWidth, 0,
    ])
    .endFill();

  const text = new BitmapText("MPG", {
    fontName: "Orbitron",
    fontSize: 50,
    align: "left",
  });
  text.angle = 180; // no idea what app is flipped??
  text.x = firstEnd + 5;
  text.y = -SCREEN.PADDING;
  text.tint = theme.gaugeActiveColor;
  logo.addChild(text);

  const renderedTexture = renderer.generateTexture(logo);
  logo.destroy(true);
  return renderedTexture;
};

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

    mpgLogoSprite.texture = createMpyLogo({ renderer, theme, mpgClusterWidth });

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
      align: "left",
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
    mpgLogoSprite.texture.destroy();
    mpgLogoSprite.texture = createMpyLogo({ renderer, theme, mpgClusterWidth });

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
