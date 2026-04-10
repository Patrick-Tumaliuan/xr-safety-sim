import { initScene } from "./scene.js";

const statusEl = document.getElementById("status");
const scanOverlay = document.getElementById("scan-overlay");
const xrBtn = document.getElementById("xr-btn");
const videoEl = document.getElementById("camera-feed");

function setStatus(msg) {
    statusEl.textContent = msg;
}

const { scene, engine, xrHelper } = await initScene();

scanOverlay.classList.add("hidden");
videoEl.style.display = "none";

setStatus(
    xrHelper
        ? "Enter immersive XR, then press a controller trigger to place the UI"
        : "WebXR (immersive-vr) not available on this device"
);

if (xrHelper) {
    xrBtn.style.display = "block";
}

xrBtn.addEventListener("click", async () => {
    if (!xrHelper) return;
    try {
        await xrHelper.baseExperience.enterXRAsync("immersive-vr", "local-floor");
        xrBtn.style.display = "none";
    } catch (e) {
        console.warn("XR entry failed:", e);
        setStatus("XR failed — check browser/device support");
    }
});
