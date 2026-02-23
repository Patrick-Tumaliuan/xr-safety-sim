import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders"
import { startQR, ensureScanLoopOnce, stopQR } from "./qrScanner";
import {getSceneSetup} from "./scene";

//global variable
let showMain = true;

//HTML CSS Elements
let mainCanvas = document.getElementById("babylonCanvas");
let qrCanvas = document.getElementById("qrCanvas");

let toggleButton = document.getElementById("toggleScene-btn");

const {scene, engine} = getSceneSetup();

//const deviceCamera = new BABYLON.DeviceOrientationCamera("deviceCamera", BABYLON.Vector3.Zero(), scene);
const uniCamera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene, true);
uniCamera.setTarget(BABYLON.Vector3.Zero());
uniCamera.attachControl(mainCanvas, true);

const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0,1,0), scene);
light.intensity = 0.7;



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
