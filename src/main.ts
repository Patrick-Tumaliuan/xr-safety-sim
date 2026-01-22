import * as BABYLON from "@babylonjs/core";
// Stuff that is always included
const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);
const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
camera.setTarget(BABYLON.Vector3.Zero());
camera.attachControl(canvas, true);
const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);


// This is just to draw something doens't matter
const circle = BABYLON.MeshBuilder.CreateDisc("circle", {
  radius: 2,
  tessellation: 64,
  sideOrientation: BABYLON.Mesh.DOUBLESIDE // Makes it visible from both sides
}, scene);

circle.position.y = 1;
circle.rotation.x = Math.PI / 2;


engine.runRenderLoop(() => {
  scene.render();
});
