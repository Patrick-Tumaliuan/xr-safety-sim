import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders"
import { createUI } from "./uiElement";
import { startQR, ensureScanLoopOnce, stopQR } from "./qrScanner";

//global variable
let showMain = true;

//HTML CSS Elements
let qrCanvas = document.getElementById("qrCanvas");

let toggleButton = document.getElementById("toggleScene-btn");

//testing button

toggleButton.addEventListener("click", async ()=>{

  qrCanvas.classList.remove("hidden");
  await startQR();
  ensureScanLoopOnce();
  /*showMain = !showMain;
  
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
  */
} )






