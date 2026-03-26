import { startQR, stopQR, hardStopQR } from "./qrScanner.js";
import { initScene }                    from "./scene.js";
import { createUI }             from "./module.js";
import "@babylonjs/loaders/"

const statusEl    = document.getElementById("status");
const scanOverlay = document.getElementById("scan-overlay");
const xrBtn       = document.getElementById("xr-btn");
const videoEl     = document.getElementById("camera-feed");

function setStatus(msg) { statusEl.textContent = msg; } // This is the top message when you scan something
const { scene, engine, xrHelper } = await initScene();

// QR scanner
setStatus("Camera ready — scan a QR code");

let scanned = false;

await startQR((qrValue) => {
    if (scanned) return;
    scanned = true;

    stopQR();                          
    scanOverlay.classList.add("hidden");
    hardStopQR();                      // kill stream + turns off camera light
    videoEl.style.display = "none";   

    console.log("QR scanned:", qrValue);
    setStatus("QR scanned — slate ready");

    createUI(qrValue);

    if (xrHelper) {
        xrBtn.style.display = "block";
    } else {
        setStatus("WebXR not available on this device");
    }
});

// Enter XR button (Only if its supported so not on ios btu should be on android and vr)
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

/*
  The way that it works is in this order:
    1. Camera opens; scan area is visible.
    2. QR detected → scan loop stopped → camera fully killed → video hidden.
    3. Slate will spawn with text.(In theory haven't tested)
    4. "Enter XR" button shown (not on ios because its not supported but should work with andorid or vrheadset).(In theory haven't tested)
    
 */