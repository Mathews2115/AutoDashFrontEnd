import { BitmapText, Container, Graphics, Renderer, Sprite, Texture } from "pixi.js";
import { Renderables, RENDER_KEYS } from "../Renderables";
import { gsap } from "gsap";
import FPSTextField from "../FPSTextField";
import { SCREEN } from "../../appConfig";
import { createLogo } from "./commonGraphics";
import SideReadout from "../SideReadout";

const testingContainter = new Container();
/** @type {BitmapText} */
let testText = null;
/**
 * 
 * @param {Object} options 
 * @param {import("../../appConfig").ThemeData} options.theme
 * @param {Renderer} options.renderer
 * @param {Renderables} options.renderables
 * @returns Array<Container>
 */
const testingArea = ({renderer, theme, renderables}) => {
  const afrGraph = renderables[RENDER_KEYS.FUEL_MAP];
  const anim = gsap.timeline();
  // TESTING STUFF

  const padding = 60;
  const vert_padding = 60;
  const gaugeContainer = new Container();
  const width = SideReadout.FIXED_LENGTH * 2 + padding;
  const oilPressureReadout = renderables[RENDER_KEYS.OIL_PRESSURE];
  const vacReadout = renderables[RENDER_KEYS.MAP_READOUT];
  const ign = renderables[RENDER_KEYS.IGN_TIMING_READOUT];
  const volt = renderables[RENDER_KEYS.VOLTAGE_READOUT];
  const cts = renderables[RENDER_KEYS.CTS_READOUT];
  const mat = renderables[RENDER_KEYS.MAT_READOUT];
  

  let readoutLogo = new Sprite();
  readoutLogo.tint = theme.gaugeActiveColor;
  readoutLogo.texture = createLogo(renderer,
    oilPressureReadout.width * 2 + padding,
    "ENGINE"
  );



  const fps = new FPSTextField()
  fps.x = SCREEN.WIDTH - 60;
  fps.y = SCREEN.HEIGHT - fps.height - 10;
  
  oilPressureReadout.y = readoutLogo.height + vert_padding;
  vacReadout.y = oilPressureReadout.y + oilPressureReadout.height + vert_padding;
  ign.y = vacReadout.y + vacReadout.gaugeHeight + vert_padding;

  volt.x = oilPressureReadout.x + oilPressureReadout.width + padding;
  volt.y = oilPressureReadout.y;

  cts.x = volt.x;
  cts.y = volt.y + volt.gaugeHeight + vert_padding;

  mat.x = volt.x;
  mat.y = cts.y + cts.gaugeHeight + vert_padding;


  gaugeContainer.addChild(readoutLogo, oilPressureReadout, volt, cts, mat, ign, vacReadout, readoutLogo);
  const x = afrGraph.x + afrGraph.width + 50;
  gaugeContainer.x = x;
  gaugeContainer.y = 5;

  return [fps, gaugeContainer];
}

/**
 * @returns {StaticObject}
 */
const testReadOutsControl = {
  /**
   * Creates the Fuel cluster logo
   * @returns {Array<Container>}
   */
   create: ({ stage, renderer, theme, renderables }) => {
     return testingArea({renderer, theme, renderables});
   },
   refresh: ({ renderables, theme, renderer }) => {
   },
};

export default testReadOutsControl;