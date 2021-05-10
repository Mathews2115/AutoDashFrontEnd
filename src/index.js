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
let ticker = PIXI.Ticker.shared;
 // Set this to prevent starting this ticker when listeners are added.
 // By default this is true only for the PIXI.Ticker.shared instance.
 ticker.autoStart = false;
 // FYI, call this to ensure the ticker is stopped. It should be stopped
 // if you have not attempted to render anything yet.
 ticker.stop();

const dash = new DashApp(renderer);
const dataWorker = new Worker(new URL('./js/comms/drawDataWorker.js', import.meta.url));
const updateData = []; // however big the data is;

const animationStep = () => {
  // request data to animate off of
  dataWorker.postMessage({msg: 'process_update_data', updateData: updateData})
}

// all external assets loaded, initalize app and run
const initializeApp = (_loader, resources) => {
  PIXI.BitmapFont.install(orbitron50xml, [
    resources.OrbitronPng1.texture,
    resources.OrbitronPng2.texture,
  ]);

  dash.initialize();
  dash.update(updateData);
  dataWorker.postMessage({msg: "start"});
  requestAnimationFrame(animationStep);
}

dataWorker.addEventListener('message', (evt) => {
  switch (evt.data.msg) {
    case 'update_data_ready':
      // data is ready, do the animation and request another update frame
      dash.update(evt.data.updateData);
      requestAnimationFrame(animationStep);
      break;
    case 'error':
      // put to state error?
      // dash.errorOccured();
      break;
  }
});

document.body.appendChild(renderer.view);
(new PIXI.Loader)
  .add("OrbitronPng1", orbitron50png1)
  .add("OrbitronPng2", orbitron50png2)
  .load(initializeApp);
  