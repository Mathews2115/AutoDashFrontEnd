import { BitmapText, Container, Graphics, Renderer, Sprite, Texture } from "pixi.js";
import EngineTable from "../EngineTable/EngineTable";
import KPABar from "../EngineTable/KPAbar";
import RPMBar from "../EngineTable/RPMBar";
import { Renderables, RENDER_KEYS } from "../Renderables";
import { SCREEN } from "../../appConfig";
import { createLogo } from "./commonGraphics";

/** @type {KPABar} */
let kpaBar = null;
/** @type {RPMBar} */
let rpmBarForIgn = null;
/** @type {RPMBar} */
let rpmBarForAfr = null;
const backgroundSprite = Sprite.from(Texture.WHITE);
let afrLogo = new Sprite();
let timingLogo = new Sprite();

const createBars = ({renderer, renderables}) => {
  /**  @type {EngineTable} */
  const afrGraph = renderables[RENDER_KEYS.FUEL_MAP];
  const timingGraph = renderables[RENDER_KEYS.IGN_TIMING_MAP];

  kpaBar = new KPABar(afrGraph.labelData, renderer);
  rpmBarForIgn = new RPMBar(afrGraph.labelData, renderer);
  rpmBarForAfr = new RPMBar(afrGraph.labelData, renderer, rpmBarForIgn.barTexture);
  afrGraph.xLabelBar = rpmBarForAfr;
  afrGraph.yLabelBar = kpaBar;
  timingGraph.xLabelBar = rpmBarForIgn;
}

/**
 * 
 * @param {Object} options 
 * @param {import("../../appConfig").ThemeData} options.theme
 * @param {Renderer} options.renderer
 * @param {Renderables} options.renderables
 * @returns Array<Container>
 */
const layoutGraphs = ({renderer, theme, renderables}) => {
  /**  @type {EngineTable} */
  const afrGraph = renderables[RENDER_KEYS.FUEL_MAP];
  const timingGraph = renderables[RENDER_KEYS.IGN_TIMING_MAP];

  createBars({renderer, renderables});

  // draw border around graphs
  const totalWidth = afrGraph.gaugeWidth+timingGraph.width+10;
  const totalHeight = afrGraph.height+10;
  backgroundSprite.scale.set(totalWidth/backgroundSprite.width, totalHeight/backgroundSprite.height);
  backgroundSprite.tint = theme.gaugeActiveColor;

  const top = SCREEN.HEIGHT - afrGraph.height - 15;
  const left = 15;
  // position it within out borders - and position entire thing
  backgroundSprite.x = left;
  backgroundSprite.y = top;
  timingGraph.x = 5 + backgroundSprite.x;
  afrGraph.x = timingGraph.x + afrGraph.gaugeWidth;
  timingGraph.y = 5 + backgroundSprite.y;
  afrGraph.y = 5 + backgroundSprite.y;

  timingLogo.texture = createLogo(renderer, timingGraph.width, "TIMING");
  afrLogo.texture = createLogo(renderer, afrGraph.background.width, "AFR");

  timingLogo.tint = theme.gaugeActiveColor;
  afrLogo.tint = theme.gaugeActiveColor;
  timingLogo.x = left;
  timingLogo.y = 5;
  afrLogo.x = afrGraph.x + 5;
  afrLogo.y = 5;
  
  return [backgroundSprite, timingGraph, afrGraph, timingLogo, afrLogo]
}

/**
 * @returns {StaticObject}
 */
const engineGraphsControl = {
  /**
   * Creates the Fuel cluster logo
   * @returns {Array<Container>}
   */
   create: ({ stage, renderer, theme, renderables }) => {
     return layoutGraphs({renderer, theme, renderables});
   },
   refresh: ({ renderables, theme, renderer }) => {
      backgroundSprite.tint = theme.gaugeBgColorExtra;
      createBars({renderer, renderables});
      timingLogo.tint = theme.gaugeActiveColor;
      afrLogo.tint = theme.gaugeActiveColor;
   },
};

export default engineGraphsControl;