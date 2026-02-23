import * as BABYLON from "@babylonjs/core";

let mainCanvas = document.getElementById("babylonCanvas");

//create scene
const engine = new BABYLON.Engine(mainCanvas, true);
const scene = new BABYLON.Scene(engine);

//getter for scene
export function getSceneSetup(){
    return {scene, engine};
}