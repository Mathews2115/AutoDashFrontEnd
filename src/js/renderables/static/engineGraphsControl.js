import {
  BitmapText,
  Container,
  Graphics,
  Renderer,
  Sprite,
  Texture,
} from "pixi.js";
import EngineTable from "../EngineTable/EngineTable";
import KPABar from "../EngineTable/KPAbar";
import RPMBar from "../EngineTable/RPMBar";
import { Renderables, RENDER_KEYS } from "../Renderables";
import { app_settings, ENGINE_GRAPH_TYPES, SCREEN } from "../../appConfig";
import { createLogo } from "./commonGraphics";

/** @type {KPABar} */
let kpaBar = null;
/** @type {RPMBar} */
let rpmFirstGuage = null;
const backgroundSprite = Sprite.from(Texture.WHITE);
let secondGraphLogo = new Sprite();
let firstGraphLogo = new Sprite();


function configBackground(firstGraphWidget, totalWidth, theme, left, top) {
  const totalHeight = firstGraphWidget.height + 10;
  backgroundSprite.scale.set(
    totalWidth / backgroundSprite.width,
    totalHeight / backgroundSprite.height
  );
  backgroundSprite.tint = theme.gaugeActiveColor;

  // position it within out borders - and position entire thing
  backgroundSprite.x = left;
  backgroundSprite.y = top;
}

function createLogos(usingBothGraphs, renderer, firstGraphWidget, secondGraphWidget) {
  if (usingBothGraphs ||
    app_settings.engine_gragh_type === ENGINE_GRAPH_TYPES.TIMING) {
    firstGraphLogo.texture = createLogo(
      renderer,
      firstGraphWidget.width,
      "TIMING"
    );
    secondGraphLogo.texture = createLogo(
      renderer,
      secondGraphWidget.background.width,
      "AFR"
    );
  } else if (app_settings.engine_gragh_type === ENGINE_GRAPH_TYPES.AFR) {
    firstGraphLogo.texture = createLogo(
      renderer,
      backgroundSprite.width,
      "AFR"
    );
  } else {
    firstGraphLogo.texture = createLogo(
      renderer,
      firstGraphWidget.width,
      "TIMING"
    );
  }
}

const createBars = ({
  renderer,
  firstGraphWidget,
  secondGraphWidget,
  usingBothGraphs,
}) => {
  kpaBar = new KPABar(firstGraphWidget.labelData, renderer);
  rpmFirstGuage = new RPMBar(firstGraphWidget.labelData, renderer);
  firstGraphWidget.xLabelBar = rpmFirstGuage;
  if (usingBothGraphs) {
    secondGraphWidget.yLabelBar = kpaBar;
    secondGraphWidget.xLabelBar = new RPMBar(
      firstGraphWidget.labelData,
      renderer,
      rpmFirstGuage.barTexture
    );
  } else {
    firstGraphWidget.yLabelBar = kpaBar;
  }
};

function getWidgets({ renderables }) {
  const afrGraph = renderables[RENDER_KEYS.FUEL_MAP];
  const timingGraph = renderables[RENDER_KEYS.IGN_TIMING_MAP];
  const usingBothGraphs = app_settings.engine_gragh_type === ENGINE_GRAPH_TYPES.BOTH
  return {
    /**  @type {EngineTable} */
    afrGraph: afrGraph,
    /**  @type {EngineTable} */
    timingGraph: timingGraph,
    /**  @type {EngineTable} */
    firstGraphWidget:
      app_settings.engine_gragh_type === ENGINE_GRAPH_TYPES.BOTH ||
      app_settings.engine_gragh_type === ENGINE_GRAPH_TYPES.TIMING
        ? timingGraph
        : afrGraph,
    /**  @type {EngineTable} */
    secondGraphWidget: usingBothGraphs ? afrGraph : null,
    usingBothGraphs: usingBothGraphs,
  };
}

/**
 *
 * @param {Object} options
 * @param {import("../../appConfig").ThemeData} options.theme
 * @param {Renderer} options.renderer
 * @param {Renderables} options.renderables
 * @returns Array<Container>
 */
const layoutGraphs = ({ renderer, theme, renderables }) => {
  const { firstGraphWidget, secondGraphWidget, usingBothGraphs } = getWidgets({
    renderables,
  });
  createBars({
    renderer,
    firstGraphWidget,
    secondGraphWidget,
    usingBothGraphs,
  });

  const top = SCREEN.HEIGHT - firstGraphWidget.height - 15;
  const left = 15;

  // draw border around graphs
  let totalWidth = 0
  if (usingBothGraphs) {
    totalWidth = firstGraphWidget.gaugeWidth + secondGraphWidget.width + 10;
  } else {
    totalWidth = firstGraphWidget.width + 10;
  }

  configBackground(firstGraphWidget, totalWidth, theme, left, top);
  createLogos(usingBothGraphs, renderer, firstGraphWidget, secondGraphWidget);

  firstGraphLogo.tint = theme.gaugeActiveColor;
  firstGraphLogo.x = left;
  firstGraphLogo.y = 5;

  if (usingBothGraphs) {
    firstGraphWidget.x = 5 + backgroundSprite.x;
    firstGraphWidget.y = 5 + backgroundSprite.y;
    secondGraphLogo.tint = theme.gaugeActiveColor;
    secondGraphWidget.x = firstGraphWidget.x + secondGraphWidget.gaugeWidth;
    secondGraphWidget.y = 5 + backgroundSprite.y;
    secondGraphLogo.x = secondGraphWidget.x + 5;
    secondGraphLogo.y = 5;
  } else {
    firstGraphWidget.x = 5 + backgroundSprite.x;
    firstGraphWidget.y = 5 + backgroundSprite.y;
  }

  const childrenToAdd = new Container();
  childrenToAdd.addChild(backgroundSprite, firstGraphWidget, firstGraphLogo);
  if (usingBothGraphs) {
    childrenToAdd.addChild(secondGraphWidget, secondGraphLogo);
  }
  return childrenToAdd;
};

/**
 * @returns {StaticObject}
 */
const engineGraphsControl = {
  /**
   * Creates the Fuel cluster logo
   * @returns {Array<Container>}
   */
  create: ({ renderer, theme, renderables }) => {
    return [layoutGraphs({ renderer, theme, renderables })];
  },
  refresh: ({ renderables, theme, renderer }) => {
    backgroundSprite.tint = theme.gaugeBgColorExtra;
    createBars({ renderer, ...getWidgets({ renderables }) });
    firstGraphLogo.tint = theme.gaugeActiveColor;
    secondGraphLogo.tint = theme.gaugeActiveColor;
  },
};

export default engineGraphsControl;
