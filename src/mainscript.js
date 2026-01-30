// mainscript.js
import { initQRScene } from "./qrScanner.js";

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