import { BitmapText, Container, Graphics, Renderer, Sprite, Texture } from "pixi.js";
import EngineTable from "../EngineTable/EngineTable";
import KPABar from "../EngineTable/KPAbar";
import RPMBar from "../EngineTable/RPMBar";
import { Renderables, RENDER_KEYS } from "../Renderables";
import { gsap } from "gsap";

/** @type {KPABar} */
let kpaBar = null;
/** @type {RPMBar} */
let rpmBarForIgn = null;
/** @type {RPMBar} */
let rpmBarForAfr = null;

const testingContainter = new Container();
const backgroundSprite = Sprite.from(Texture.WHITE);
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
const layoutGraphs = ({renderer, theme, renderables}) => {
  /**  @type {EngineTable} */
  const afrGraph = renderables[RENDER_KEYS.FUEL_MAP];
  const timingGraph = renderables[RENDER_KEYS.IGN_TIMING_MAP];

  kpaBar = new KPABar(afrGraph.labelData, renderer);
  rpmBarForIgn = new RPMBar(afrGraph.labelData, renderer);
  rpmBarForAfr = new RPMBar(afrGraph.labelData, renderer, rpmBarForIgn.barTexture);
  afrGraph.xLabelBar = rpmBarForAfr;
  afrGraph.yLabelBar = kpaBar;
  timingGraph.xLabelBar = rpmBarForIgn;

  // draw border around graphs
  const totalWidth = afrGraph.width+timingGraph.width+15;
  const totalHeight = afrGraph.height+10;
  backgroundSprite.scale.set(totalWidth/backgroundSprite.width, totalHeight/backgroundSprite.height);
  backgroundSprite.tint = theme.gaugeBgColorExtra;

  // position it within out borders
  backgroundSprite.x = 5;
  backgroundSprite.y = 5;
  timingGraph.x = 5 + backgroundSprite.x;
  afrGraph.x = timingGraph.x + afrGraph.width + backgroundSprite.x;
  timingGraph.y = 5 + backgroundSprite.y;
  afrGraph.y = 5 + backgroundSprite.y;


  const anim = gsap.timeline();
  // TESTING STUFF
  testingContainter.x = afrGraph.x + afrGraph.width;
  testingContainter.y = 10;
  const mask = new Graphics();
  mask.beginFill(0x000000)
    .drawRect(0, 0, 300, 400)
  testingContainter.mask = mask;

  testGraphics.beginFill(theme.dangerColor)
    .drawPolygon([
      5, 0,
      0, 15,
      280, 15,
      285, 0,
    ])
    .endFill();
  const texture = renderer.generateTexture(testGraphics);
  testGraphics.destroy(true);
  const sprite = new Sprite(texture);
  const sprite2 = new Sprite(texture);
  sprite2.y = 70;
  

  testText = new BitmapText("TESTING", {
    fontName: "Orbitron",
    fontSize: 48,
    align: "center",
  });
  testText.y = 10
  testText.x = 15 
  testText.angle = 180;
  testText.tint = theme.dangerColor;
  testingContainter.addChild(mask, sprite,sprite2, testText);
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
  
  return [backgroundSprite, afrGraph, timingGraph, testingContainter]
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
   },
};

export default engineGraphsControl;