"use strict";
import * as PIXI from "pixi.js";
import { DashApp } from "./js/app";
import { SCREEN } from "./js/appConfig";
import orbitron50xml from "./fonts/orbitron50.xml";
import orbitron50png1 from "./fonts/orbitron50_0.png";
import orbitron50png2 from "./fonts/orbitron50_1.png";

// setup renderer and ticker
const renderer = new PIXI.Renderer({
  width: SCREEN.WIDTH,
  height: SCREEN.HEIGHT,
  backgroundColor: 0x000000,
});
document.body.appendChild(renderer.view);
const ticker = new PIXI.Ticker();
const dash = new DashApp(renderer, ticker);
const startDrawLoop = () => {
  // setup main ticker
  ticker.add(() => renderer.render(dash.stage), PIXI.UPDATE_PRIORITY.LOW);
  ticker.start();
};

const assetsLoaded = (_loader, resources) => {
  PIXI.BitmapFont.install(orbitron50xml, [
    resources.OrbitronPng1.texture,
    resources.OrbitronPng2.texture,
  ]);

  dash.initialize();
  startDrawLoop();
}
const loader = new PIXI.Loader();
loader
  .add("OrbitronPng1", orbitron50png1)
  .add("OrbitronPng2", orbitron50png2)
  .load(assetsLoaded);
