"use strict";
import * as PIXI from "pixi.js";
import { DashApp } from "./js/app";
import { SCREEN } from "./js/appConfig";

//Aliases
let Application = PIXI.Application;

const renderer = new Application({
  width: SCREEN.WIDTH,
  height: SCREEN.HEIGHT,
  antialias: true, // default: false
  resolution: 1,
  backgroundColor: 0x000000,
});
const dashApp = new DashApp(renderer);
document.body.appendChild(renderer.view);

dashApp.start();