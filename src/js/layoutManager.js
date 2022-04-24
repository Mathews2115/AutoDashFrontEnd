import * as PIXI from "pixi.js";
import AverageMpgReadout from "./renderables/AverageMpgReadout";
import AvgAfrReadout from "./renderables/AvgAfrReadout";
import BorderWarnings from "./renderables/BorderWarnings";
import CurrentMpgReadout from "./renderables/CurrentMpgReadout";
import FuelGauge from "./renderables/FuelGauge";
import IgnTimingReadout from "./renderables/IgnTimingReadout";
import MAPReadout from "./renderables/MAPReadout";
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
import TargetAfrReadout from "./renderables/TargetAfrReadout";
import TimingGraph from "./renderables/TimingGraph";

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

  renderables.createRenderable(TargetAfrReadout);
  renderables.createRenderable(AvgAfrReadout);
  renderables.createRenderable(IgnTimingReadout);
  renderables.createRenderable(MAPReadout);
  renderables.createRenderable(TimingGraph); 
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

      // auxScreenClusters.forEach((renderable) => {
      //   const controls = renderable.create({ stage: auxScreen, renderer, theme, renderables });
      //   auxScreen.addChild(...controls);
      // });

      // TEST CODE
      auxScreen.addChild(renderables[RENDER_KEYS.IGN_TIMING_READOUT]);
      // auxScreen.addChild(renderables[RENDER_KEYS.AVERAGE_AFR_READOUT]);
      // auxScreen.addChild(renderables[RENDER_KEYS.TARGET_AFR_READOUT]);
      auxScreen.addChild(renderables[RENDER_KEYS.MAP_READOUT]);
      auxScreen.addChild(renderables[RENDER_KEYS.IGN_TIMING_MAP]);

      // renderables[RENDER_KEYS.AVERAGE_AFR_READOUT].x = 400;
      renderables[RENDER_KEYS.IGN_TIMING_READOUT].x = 600;
      renderables[RENDER_KEYS.MAP_READOUT].x = 800;
    },
    /**
     * Refresh all things on screen with the new theme data
     * @param {import("./appConfig").ThemeData} theme 
     */
    refresh: (theme) => {
      renderables.refreshAll(theme)
      clusters.forEach((renderable) => {
        renderable.refresh({ renderer, theme, renderables });
      });
    }
  };
};
