"use strict";
import * as PIXI from "pixi.js";
import { DashApp } from "./js/app";
import { SCREEN, DEFAULT_COLORS } from "./js/appConfig";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin.js";

delete PIXI.Renderer.__plugins.interaction; // removing the interactoins manager; we dont need it
// it also adds another RAF, which we dont need

//without this line, PixiPlugin may get dropped by your bundler (tree shaking)...
gsap.registerPlugin(PixiPlugin);
// give the plugin a reference to the PIXI object
PixiPlugin.registerPIXI(PIXI);
gsap.ticker.fps(45);

const ticker = PIXI.Ticker.shared;
// Set this to prevent starting this ticker when listeners are added.
// By default this is true only for the PIXI.Ticker.shared instance.
ticker.autoStart = false;
// FYI, call this to ensure the ticker is stopped. It should be stopped
// if you have not attempted to render anything yet.
ticker.stop();

// RENDERER and TICKER
// setup renderer and ticker
const renderer = new PIXI.Renderer({
  width: SCREEN.WIDTH,
  height: SCREEN.HEIGHT,
  backgroundColor: DEFAULT_COLORS.backgroundColor,
});
const dash = new DashApp(renderer);
const dataWorker = new Worker(new URL('./js/comms/drawDataWorker.js', import.meta.url));
let updateData = []; // TODO: make this a typed array?  try transfer data in worker?
let readyForData = true;

// all external assets loaded, initalize app and run
const initializeApp = (_loader, resources) => {
  // start ticker
  gsap.ticker.add((time,_deltaTime,_frame) => ticker.update(time))
  dash.initialize();

  // init worker
  dataWorker.postMessage({msg: "start"}); 

  // hook up update loop
  ticker.add(function(dt){
    if (readyForData) {
      dataWorker.postMessage({msg: 'process_update_data', updateData: updateData})
      readyForData = false;
    }
    dash.update(updateData);
  })
}

dataWorker.onmessage = (event) => {
  switch (event.data.msg) {
    case 'update_data_ready':
      try {
        // data is ready, do the animation and request another update frame
        updateData = event.data.updateData;
        readyForData = true;
      } catch (error) {
        console.error(error);
        // put state to error?
      }

      break;
    case 'error':
      // put to state error?
      // dash.errorOccured();
      break;
  }
};

document.body.appendChild(renderer.view);
PIXI.Loader.shared
  .add("assets/fonts/orbitron50.xml")
  .add("assets/images/warningSheet.json")
  .load(initializeApp);
  