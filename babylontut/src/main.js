import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import { createVideoPlane } from "./videoPlane";
import { createTextPlane } from "./textPlane";

/* ======================
   BABYLON SETUP
====================== */
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color3(0.1, 0.1, 0.1);

const camera = new BABYLON.ArcRotateCamera(
  "camera",
  Math.PI / 2,
  Math.PI / 3,
  6,
  BABYLON.Vector3.Zero(),
  scene
);
camera.attachControl(canvas, true);

new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

/* ======================
   UI PLACEHOLDER
====================== */
const ui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

const popup = new GUI.Rectangle();
popup.width = "60%";
popup.height = "40%";
popup.background = "#222";
popup.color = "white";
popup.thickness = 2;
popup.isVisible = true;
ui.addControl(popup);

const holderText = new GUI.TextBlock();
holderText.text = "Waiting for QR scan…";
holderText.color = "white";
holderText.fontSize = 24;
popup.addControl(holderText);

/* ======================
   QR FLAG
====================== */
let qrScanned = false;

/* ======================
   CREATE VIDEO + TEXT PLANES
====================== */
const { videoPlane, videoTexture } = createVideoPlane(scene);
const textPlane = createTextPlane(scene);

/* ======================
   SIMULATE QR SCAN
====================== */
setTimeout(() => {
  qrScanned = true;
  popup.isVisible = false;
  showTextPlane();
}, 2000);

/* ======================
   SHOW/HIDE FUNCTIONS
====================== */
function showVideoPlane() {
  textPlane.setEnabled(false);
  videoPlane.setEnabled(true);
  videoTexture.video.play();
}

function showTextPlane() {
  videoPlane.setEnabled(false);
  textPlane.setEnabled(true);
}

/* ======================
   RENDER LOOP
====================== */
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());