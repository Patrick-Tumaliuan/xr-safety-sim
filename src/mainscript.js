import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders"
import { createUI } from "./uiElement";
import { startQR, ensureScanLoopOnce, stopQR } from "./qrScanner";
import {getSceneSetup} from "./scene";

//global variable
let showMain = true;

//HTML CSS Elements
let mainCanvas = document.getElementById("babylonCanvas");
let qrCanvas = document.getElementById("qrCanvas");

let toggleButton = document.getElementById("toggleScene-btn");

const {scene, engine, camera} = getSceneSetup();





createUI("video");



//testing button

toggleButton.addEventListener("click", async ()=>{

  showMain = !showMain;
  
  if(showMain){
    mainCanvas.classList.remove("hidden");
    qrCanvas.classList.add("hidden");
    stopQR();
  }
  else{
    mainCanvas.classList.add("hidden");
    qrCanvas.classList.remove("hidden");
    await startQR();
    ensureScanLoopOnce();
  }

} )





window.addEventListener("resize", function () {
                engine.resize();
        });
engine.runRenderLoop(function() {
  scene.render()
});
