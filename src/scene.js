import * as BABYLON from "@babylonjs/core";

let mainCanvas = document.getElementById("babylonCanvas");

//create scene
const engine = new BABYLON.Engine(mainCanvas, true);
const scene = new BABYLON.Scene(engine);

const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0,1,0), scene);
light.intensity = 0.7;


const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene, true);
camera.setTarget(BABYLON.Vector3.Zero());
camera.attachControl(mainCanvas, true);


//create webXR
/*
const xr = await scene.createDefaultXRExperienceAsync({
  uiOptions: {
    sessionMode: "immersive-ar"
  }
});
*/

window.addEventListener("resize", function () {
                engine.resize();
        });
engine.runRenderLoop(function() {
  scene.render()
});

//getter for scene
export function getSceneSetup(){
    return {scene, engine, camera};
}