import * as PIXI from "pixi.js";
import { SCREEN } from "../../appConfig";
import FuelGauge from "../FuelGauge";
import { RENDER_KEYS } from "../Renderables";

const fuelIconSprite = new PIXI.Sprite();

const renderIcon = ({ theme, renderer }) => {
  const fuelMask = new PIXI.Sprite();
  const fuelIcon = new PIXI.Graphics();

  fuelMask.texture = PIXI.utils.TextureCache["fuel.png"];
  fuelMask.anchor.set(0);
  fuelMask.scale.set(0.6);

  fuelIcon
    .beginFill(theme.gaugeActiveColor)
    .lineStyle(0)
    .drawRect(0, 0, fuelMask.width, fuelMask.height)
    .endFill();
  fuelIcon.addChild(fuelMask);
  fuelIcon.mask = fuelMask;
  const fuelMaskWidth = fuelMask.width; //used for a later measurement

  const renderContainer = new PIXI.Container();
  renderContainer.addChild(fuelIcon);
  const fuelTexture = renderer.generateTexture(renderContainer);
  renderContainer.destroy({ children: true }); // clean up

  return { fuelTexture, fuelMaskWidth };
};

/**
 * @returns {StaticObject}
 */
const fuelClusterControl = {
  /**
   * Creates the Fuel cluster logo
   * @returns {Array<PIXI.Container>}
   */
  create: ({ stage, renderer, theme, renderables }) => {
    /** @type {FuelGauge} */
    const fuelGauge = renderables[RENDER_KEYS.FUEL_GAUGE];
    fuelGauge.x = SCREEN.FUEL_GAUGE_X;
    fuelGauge.y = SCREEN.BORDER_WIDTH;

    // create and position fuel icon logo
    const { fuelMaskWidth, fuelTexture } = renderIcon({ theme, renderer });
    fuelIconSprite.texture = fuelTexture;
    fuelIconSprite.x = fuelGauge.x + (fuelGauge.width - fuelMaskWidth);
    fuelIconSprite.y = fuelGauge.y + fuelGauge.gaugeHeight + 10;
    return [fuelGauge, fuelIconSprite];
  },
  refresh: ({ renderables, theme, renderer }) => {
    // refresh fuel logo to new theme
    fuelIconSprite.texture.destroy();
    const { fuelTexture } = renderIcon({ theme, renderer });
    fuelIconSprite.texture = fuelTexture;
  },
};

export default fuelClusterControl;
