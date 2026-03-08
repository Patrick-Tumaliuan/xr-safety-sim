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
  showVideoPlane();
}, 2000);

/* ======================
   SHOW/HIDE FUNCTIONS
====================== */

function createVideoControls() {
  const meshUI = GUI.AdvancedDynamicTexture.CreateForMesh(videoPlane);
  meshUI.idealWidth = 1024;
   

  //  CONTROL BAR 
  const bar = new GUI.Rectangle();
  bar.height = "120px";
  bar.width = 1;
  bar.thickness = 0;
  bar.background = "rgba(0,0,0,0.55)";
  bar.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  meshUI.addControl(bar);

  //  PLAY BUTTON 
  const playBtn = GUI.Button.CreateSimpleButton("playBtn", "▶");
  playBtn.width = "120px";
  playBtn.height = "120px";
  playBtn.color = "white";
  playBtn.fontSize = 60;
  playBtn.background = "rgba(0,0,0,0.3)";
  playBtn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  playBtn.left = "20px";

  playBtn.onPointerUpObservable.add(() => {
    const video = videoTexture.video;
   // video.paused ? video.play() : video.pause();
   video.play();
   console.log("Video playing?", !video.paused);

  });

  bar.addControl(playBtn);

  //  VOLUME SLIDER 
  const volumeSlider = new GUI.Slider();
  volumeSlider.minimum = 0;
  volumeSlider.maximum = 1;
  volumeSlider.value = 1;
  volumeSlider.height = "40px";
  volumeSlider.width = "300px";
  volumeSlider.color = "white";
  volumeSlider.background = "gray";
  volumeSlider.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  volumeSlider.right = "20px";

  volumeSlider.onValueChangedObservable.add((value) => {
    videoTexture.video.volume = value;
  });

  bar.addControl(volumeSlider);
}
function showVideoPlane() {
   console.log("readyState:", videoTexture.video.readyState);
 
  textPlane.setEnabled(false);
  videoPlane.setEnabled(true);
  createVideoControls();   //  control bar appears here
  
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