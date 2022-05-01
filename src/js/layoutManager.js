import * as PIXI from "pixi.js";
import AverageMpgReadout from "./renderables/AverageMpgReadout";
import VoltageReadout from "./renderables/VoltageReadout";
import BorderWarnings from "./renderables/BorderWarnings";
import CurrentMpgReadout from "./renderables/CurrentMpgReadout";
import FuelGauge from "./renderables/FuelGauge";
import FuelGraph from "./renderables/FuelGraph";
import IgnTimingReadout from "./renderables/IgnTimingReadout";
import CTSReadout from "./renderables/CTSReadout";
import MpgGauge from "./renderables/MpgGauge";
import MpgHistogram from "./renderables/MpgHistogram";
import Odometer from "./renderables/odometer";
import PedalGauge from "./renderables/PedalGauge";
import { Renderables, RENDER_KEYS } from "./renderables/Renderables";
import RPMGauge from "./renderables/RPMGauge";
import SpeedoReadout from "./renderables/SpeedoReadout";
import SpeedoSweep from "./renderables/SpeedoSweep";
import fuelClusterControl from "./renderables/static/fuelClusterControl";
import mpgClusterControl from "./renderables/static/mpgClusterControl";
import rpmClusterControl from "./renderables/static/rpmClusterControl";
import speedoClusterControl from "./renderables/static/speedoClusterControl";
import OilPressureReadout from "./renderables/OilPressureReadout";
import TimingGraph from "./renderables/TimingGraph";
import KPABar from "./renderables/EngineTable/KPAbar";
import RPMBar from "./renderables/EngineTable/RPMBar";
import EngineTable from "./renderables/EngineTable/EngineTable";
import engineGraphsControl from "./renderables/static/engineGraphsControl";
import testReadOutsControl from "./renderables/static/testReadouts";

// PLEASE NOTE: all this is magic number stuff because I was in "EFF IT ILL DO IT LIVE" mode...
// so...dont get all snooty when you look at this hot garbage while thinking "pssh, i cant believe he didn't use ALGORITHM_X to figure out the placement for everything"

// again - TODO: refactor this into a not garbage mess
const createGauges = ({ renderables }) => {
  // Create all renderables
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
  /** @type {MpgGauge} */
  const mpgGauge = renderables.createRenderable(MpgGauge);
  /** @type {CurrentMpgReadout} */
  const currentMpgReadout = renderables.createRenderable(CurrentMpgReadout);
  /** @type {AverageMpgReadout} */
  const averageMpgReadout = renderables.createRenderable(AverageMpgReadout);
  /** @type {MpgHistogram} */
  const mpgHistogram = renderables.createRenderable(MpgHistogram);

  renderables.createRenderable(OilPressureReadout);
  renderables.createRenderable(VoltageReadout);
  renderables.createRenderable(IgnTimingReadout);
  renderables.createRenderable(CTSReadout);
  renderables.createRenderable(TimingGraph);
  renderables.createRenderable(FuelGraph); 
};
/**
 *  @param {Object} config
 *  @param {PIXI.Renderer } config.renderer
 *  @param {PIXI.Container} config.auxScreen
 *  @param {PIXI.Container} config.gaugeScreen
 *  @param {import("./appConfig").ThemeData} config.theme
 */
export default ({ renderer, auxScreen, gaugeScreen, theme }) => {
  const renderables = new Renderables({ renderer, theme });
  createGauges({ renderables });

  const clusters = [
    rpmClusterControl,
    speedoClusterControl,
    fuelClusterControl,
    mpgClusterControl
  ];

  const auxScreenClusters = [
    engineGraphsControl,
    testReadOutsControl
  ]

  return {
    renderables,
    createLayout: () => {
      // create all gauges first
      renderables.initializeAll(); 
      
      // then create all logos, etc because they will be placed based on the height/width of the gauges
      clusters.forEach((renderable) => {
        const controls = renderable.create({ stage: gaugeScreen, renderer, theme, renderables });
        gaugeScreen.addChild(...controls);
      });
      gaugeScreen.addChild(renderables[RENDER_KEYS.WARNING_BORDER]);

      auxScreenClusters.forEach((renderable) => {
        const controls = renderable.create({ stage: auxScreen, renderer, theme, renderables });
        auxScreen.addChild(...controls);
      });
    },
    /**
     * Refresh all things on screen with the new theme data
     * @param {import("./appConfig").ThemeData} theme 
     */
    refresh: (theme) => {
      renderables.refreshAll(theme);
      clusters.forEach((renderable) => {
        renderable.refresh({ renderer, theme, renderables });
      });
      auxScreenClusters.forEach((renderable) => {
        renderable.refresh({ renderer, theme, renderables });
      });
    },
    updateAll: () => {
      renderables.updateAll();
    }
  };
};
