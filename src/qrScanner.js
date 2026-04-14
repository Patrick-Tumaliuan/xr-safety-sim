import jsQR from "jsqr";
import * as BABYLON from "@babylonjs/core";
import { createUI } from "./uiElement";
import {getSceneSetup} from "./scene";

let camStatus = false;
const {scene, engine, camera} = getSceneSetup();

let mainCanvas = document.getElementById("babylonCanvas");
let qrCanvas = document.getElementById("qrCanvas");
let video = document.createElement("video");
video.playsInline = true;

const qrCtx = qrCanvas.getContext("2d", {willReadFrequently: true});

let stream = null;
let scanLooping = false;

let lastResult = "";
let lastTime = 0;
const SCAN_INTERVAL_MS = 50;



async function onDetected(value) {
  console.log("QR Detected:", value);

  alert(`QR Detected:\n\n${value}`);

  const loadModule = confirm(
    "Do you want to load this module?"
  );

  if (!loadModule) {
    return;
  }

  mainCanvas.classList.remove("hidden");
  qrCanvas.classList.add("hidden");
  stopQR();

  await createUI(value);

  alert(
    "Module loaded.\n\n" +
    "To continue, please click the WebXR button\n" +
    "at the bottom-right of the browser."
  );
}
function scanLoop(ts) {
  if(!stream){
    scanLooping = false;
    return;
  }
  if (!lastTime || ts - lastTime >= SCAN_INTERVAL_MS) {
    lastTime = ts;

    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;

    if (vw && vh) {
      const targetW = 640;
      const scale = targetW / vw;
      const w = Math.min(targetW, vw);
      const h = Math.round(vh * scale);

      qrCanvas.width = w;
      qrCanvas.height = h;

      qrCtx.drawImage(video, 0, 0, w, h);
      const imgData = qrCtx.getImageData(0, 0, w, h);

      const code = jsQR(imgData.data, imgData.width, imgData.height, {
        inversionAttempts: "dontInvert"
      });

      if (code?.data && code.data !== lastResult) {
        lastResult = code.data;
        onDetected(code.data);
      }
    }
  }
  requestAnimationFrame(scanLoop);
}
export async function startQR(){
  if(stream)
    return;
  try{
    console.log("debug");
    stream = await navigator.mediaDevices.getUserMedia({
      
      video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,

    });
    video.srcObject = stream;

    
    // Wait for dimensions
    await new Promise((resolve) => {
      if (video.readyState >= 2 && video.videoWidth && video.videoHeight) resolve();
      else video.onloadedmetadata = () => resolve();
    });

    // Try play (should succeed if started by click)
    try { await video.play(); } catch (e) { console.warn("video.play() failed:", e); }

    // Size canvas to video
    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;
    qrCanvas.width = vw;
    qrCanvas.height = vh;

  }
  catch(e){
    console.error("qrScanner->getUserMedia error:", e);
    stream = null;
  }
}
export function stopQR(){
  try{
    video.pause();
    stream?.getTracks?.().forEach(t=> t.stop());
  } finally {
    stream = null;
    lastResult = "";
  }
}

export function ensureScanLoopOnce() {
  if (scanLooping) return;
  scanLooping = true;
  requestAnimationFrame(scanLoop);
}
