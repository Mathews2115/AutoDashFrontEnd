import { BitmapText, Container, Graphics, Renderer, Sprite, Texture } from "pixi.js";
import { Renderables, RENDER_KEYS } from "../Renderables";
import { gsap } from "gsap";
import FPSTextField from "../FPSTextField";

const testingContainter = new Container();
/** @type {BitmapText} */
let testText = null;
const testGraphics = new Graphics();
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
  testingContainter.x = afrGraph.x + afrGraph.width;
  testingContainter.y = 10;

  testGraphics.beginFill(theme.dangerColor)
    .drawPolygon([ 
      5, 0,
      0, 15, 
      390, 15,
      395, 0,
    ])
    .endFill();
  const texture = renderer.generateTexture(testGraphics);
  testGraphics.destroy(true);
  const sprite = new Sprite(texture);
  const sprite2 = new Sprite(texture);
  sprite2.y = 70;
  

  testText = new BitmapText("  TEST MODE", {
    fontName: "Orbitron",
    fontSize: 48,
    align: "center",
  });
  testText.y = 10
  testText.x = 15 
  testText.angle = 180;
  testText.tint = theme.dangerColor;
  const fps = new FPSTextField()
  fps.x = sprite.x + sprite.width + 10;
  fps.y = sprite.y;
  testingContainter.addChild(sprite,sprite2, testText, fps);
  const animTest = () => {
    anim.to(testText, {
       alpha: 0,
      
      duration: 1,
      ease: "power2.inOut",
      onComplete: () => {
        anim.to(testText, {
          alpha: 1,
          
          duration: 1,
          ease: "power2.inOut",
          onComplete: animTest,
        });
      }
    });
  }
  
  animTest();

  const oilPressureReadout = renderables[RENDER_KEYS.OIL_PRESSURE];
  oilPressureReadout.x = testingContainter.x
  oilPressureReadout.y = testingContainter.y + testingContainter.height + 10;

  const volt = renderables[RENDER_KEYS.VOLTAGE_READOUT];
  volt.x = oilPressureReadout.x;
  volt.y = oilPressureReadout.y + oilPressureReadout.gaugeHeight + 10;

    const cts = renderables[RENDER_KEYS.CTS_READOUT];
  cts.x = volt.x;
  cts.y = volt.y + volt.gaugeHeight + 10;

  const mat = renderables[RENDER_KEYS.MAT_READOUT];
  mat.x = volt.x;
  mat.y = cts.y + cts.gaugeHeight + 10;

  return [testingContainter, oilPressureReadout, volt, cts, mat];
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