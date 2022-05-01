import { BitmapText, Container, Graphics, Renderer, Sprite, Texture } from "pixi.js";
import { Renderables, RENDER_KEYS } from "../Renderables";
import { gsap } from "gsap";
import FPSTextField from "../FPSTextField";

let oilLogo = null;
let ctsLogo = null;
let voltLogo = null;
const testingContainter = new Container();
/** @type {BitmapText} */
let testText = null;
const testGraphics = new Graphics();

const createOilPressure = (renderer, theme, renderables, x, y) => {
  const oilPressureReadout = renderables[RENDER_KEYS.OIL_PRESSURE];
  oilLogo = new BitmapText("OIL", {
    fontName: "Orbitron",
    fontSize: 48,
    align: "center",
  });
  oilLogo.angle = 180;
  oilLogo.x = x;
  oilLogo.y = y+10;
  oilLogo.tint = theme.gaugeActiveColor;
  oilPressureReadout.x = x + oilLogo.width + 235;
  oilPressureReadout.y = oilLogo.y;
  return [oilLogo, oilPressureReadout];
}
const createCTS = (renderer, theme, renderables, x, y) => {
  const readout = renderables[RENDER_KEYS.CTS_READOUT];
  let logo  = new BitmapText("COOLANT", {
    fontName: "Orbitron",
    fontSize: 48,
    align: "center",
  });
  logo.angle = 180;
  logo.x = x;
  logo.y = y+10;
  logo.tint = theme.gaugeActiveColor;
  readout.x = logo.x + logo.width + 47; 
  readout.y = logo.y
  return [logo, readout];
}
const createVolt = (renderer, theme, renderables, x, y) => {
  const readout = renderables[RENDER_KEYS.VOLTAGE_READOUT];
  let logo = new BitmapText("VOLTAGE", {
    fontName: "Orbitron",
    fontSize: 48,
    align: "center",
  });
  logo.angle = 180;
  logo.x = x;
  logo.y = y+10;
  logo.tint = theme.gaugeActiveColor;
  readout.x = logo.x + logo.width + 30; 
  readout.y = logo.y
  return [logo, readout];
}
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

  const oilStuff = createOilPressure(renderer, theme, renderables, testingContainter.x, testingContainter.height + testingContainter.y)
  const ctsStuff = createCTS(renderer, theme, renderables, oilStuff[0].x, oilStuff[0].height + oilStuff[0].y)
  const voltageStuff = createVolt(renderer, theme, renderables, ctsStuff[0].x, ctsStuff[0].height + ctsStuff[0].y)
  
  ctsLogo = ctsStuff[0];
  voltLogo = voltageStuff[0];
  return [testingContainter, ...oilStuff, ...ctsStuff, ...voltageStuff  ];
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
      oilLogo.tint = theme.gaugeActiveColor;
      ctsLogo.tint = theme.gaugeActiveColor;
      voltLogo.tint = theme.gaugeActiveColor;
   },
};

export default testReadOutsControl;