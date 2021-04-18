"use strict";
import * as PIXI from "pixi.js";
import { DashApp } from "./js/app";
import { SCREEN } from "./js/appConfig";

// setup renderer and ticker
const renderer = new PIXI.Renderer({
  width: SCREEN.WIDTH,
  height: SCREEN.HEIGHT,
  backgroundColor: 0x000000,
});
document.body.appendChild(renderer.view);

const ticker = new PIXI.Ticker();
const dash = new DashApp(renderer, ticker);
dash.initialize();

// setup main ticker
ticker.add(() => {
  renderer.render(dash.stage);
}, PIXI.UPDATE_PRIORITY.LOW);
ticker.start();

