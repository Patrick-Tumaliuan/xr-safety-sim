// mainscript.js
import { initQRScene } from "./qrScanner.js";
import { createVideoPlane } from "./videoPlane.js";
import {
  Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight,
  MeshBuilder, StandardMaterial, Color3, VideoTexture, 
} from "babylonjs";

console.log("[main] script loaded");

const canvas = document.getElementById("renderCanvas");
const startBtn = document.getElementById("startBtn");


if (!canvas) {
  throw new Error("Canvas with id 'renderCanvas' not found");
}
if (!startBtn) {
  throw new Error("Button with id 'startBtn' not found");
}

let cleanup = null;

startBtn.addEventListener("click", async () => {
  console.log("[main] Start button clicked");

  startBtn.disabled = true;
  startBtn.textContent = "Starting camera…";

  try {
    cleanup = await initQRScene(canvas, (qrText) => {
      console.log("[QR DETECTED]", qrText);
      alert("QR detected:\n" + qrText);

      // Optional: stop scanning after first detection
      // cleanup?.();
    });
    const { videoPlane, videoTexture } = createVideoPlane(cleanup.scene);
    if(cleanup.qrText == "1"){
      videoPlane.setEnabled(true);
      videoTexture.video.play();
    }
    startBtn.style.display = "none";
    console.log("[main] QR scene started");

  } catch (err) {
    console.error("[main] Failed to start QR scene", err);

    startBtn.disabled = false;
    startBtn.textContent = "Start Camera";

    alert(
      "Failed to start camera.\n\n" +
      (err?.message || err)
    );
  }
});

// Clean up camera + engine when leaving page
window.addEventListener("beforeunload", () => {
  cleanup?.();
});