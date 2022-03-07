import * as PIXI from "pixi.js";
import { SCREEN } from "../../appConfig";
import PedalGauge from "../PedalGauge";
import { RENDER_KEYS } from "../Renderables";
import RPMGauge from "../RPMGauge";

/**
   * Generates texture for  to draw the ====RPM==== logo
   * @returns {PIXI.Texture}
   */
const createRPMLogoTexture = ({ renderables, theme, renderer }) => {
  const rpmLogo = new PIXI.Graphics();
  const slantStart = 5;
  const totalWidth = renderables[RENDER_KEYS.PEDAL_GAUGE].gaugeWidth
      + renderables[RENDER_KEYS.RPM_GAUGE].gaugeWidth
      + SCREEN.PADDING
      + SCREEN.PADDING;
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
  text.tint = theme.gaugeActiveColor;
  rpmLogo.addChild(text);

  const renderedTexture = renderer.generateTexture(rpmLogo);
  rpmLogo.destroy(true);
  return renderedTexture;
};
const rpmCluster = new PIXI.Container();
const rpmLogoSprite = new PIXI.Sprite();
/**  @type {PIXI.Texture} */
let rpmLogoTexture = null;

/**
 * @returns {StaticObject}
 */
const rpmClusterControl = {
  /**
     * Creates the RPM cluster logo and houses the PedalGauge and RpmGauge
     * @returns {Array<PIXI.Container>}
     */
  create: ({ stage, renderables, theme, renderer }) => {
    rpmCluster.x = SCREEN.BORDER_WIDTH;
    rpmCluster.y = SCREEN.RPM_CLUSTER_Y;
    rpmLogoTexture = createRPMLogoTexture({ renderables, theme, renderer });
    rpmLogoSprite.texture = rpmLogoTexture;
    rpmLogoSprite.x = SCREEN.BORDER_WIDTH;
    rpmLogoSprite.y = SCREEN.PADDING;

    /** @type {RPMGauge} */
    const rpmGauge = renderables[RENDER_KEYS.RPM_GAUGE];
    /** @type {PedalGauge} */
    const pedalGauge = renderables[RENDER_KEYS.PEDAL_GAUGE];
    rpmGauge.x = pedalGauge.gaugeWidth + SCREEN.PADDING;
    rpmCluster.addChild(pedalGauge, rpmGauge);
    return [rpmLogoSprite, rpmCluster];
  },
  refresh: ({ renderables, theme, renderer }) => {
    rpmLogoTexture.destroy(true);
    rpmLogoTexture = createRPMLogoTexture({ renderables, theme, renderer });
    rpmLogoSprite.texture = rpmLogoTexture;
  },
};

export default rpmClusterControl;
