//qrScanner.js  is for [Camera feed + jsQR scanning]
const videoEl  = document.getElementById("camera-feed");
const qrCanvas = document.getElementById("qr-canvas");
const qrCtx    = qrCanvas.getContext("2d", { willReadFrequently: true });

let stream     = null;
let scanning   = false;
let lastResult = "";
const INTERVAL = 60;
let lastTime   = 0;
let rafId      = null;

export async function startQR(onDetected) {
    if (stream) return;

    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: "environment" },
                width:  { ideal: 1280 },
                height: { ideal: 720 },
            },
            audio: false,
        });

        videoEl.srcObject = stream;
        await videoEl.play().catch(() => {});

        scanning = true;
        rafId = requestAnimationFrame(function loop(ts) {
            if (!scanning) return;
            if (ts - lastTime >= INTERVAL) {
                lastTime = ts;
                tryDecode(onDetected);
            }
            rafId = requestAnimationFrame(loop);
        });

        document.getElementById("status").textContent = "Camera ready — scan a QR code";
    } catch (e) {
        console.error("Camera error:", e);
        document.getElementById("status").textContent = "Camera access denied";
    }
}

// Stop the decode loop only — does NOT touch stream or videoEl. 
export function stopQR() {
    scanning = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
}

// Fully kills camera and hides video stream. 
export function hardStopQR() { //
  alert("hard Stop QR");
    stopQR();
    if (stream) {
        stream.getTracks().forEach(t => t.stop());
        stream = null;
    }
    videoEl.srcObject = null;
    videoEl.style.display = "none";
    lastResult = "";
}

function tryDecode(onDetected) {
    if (!videoEl.readyState || videoEl.videoWidth === 0) return;

    if (qrCanvas.width  !== videoEl.videoWidth ||
        qrCanvas.height !== videoEl.videoHeight) {
        qrCanvas.width  = videoEl.videoWidth;
        qrCanvas.height = videoEl.videoHeight;
    }

    qrCtx.drawImage(videoEl, 0, 0, qrCanvas.width, qrCanvas.height);

    let imgData;
    try {
        imgData = qrCtx.getImageData(0, 0, qrCanvas.width, qrCanvas.height);
    } catch {
        return;
    }

    const code = jsQR(imgData.data, imgData.width, imgData.height, {
        inversionAttempts: "dontInvert",
    });

    if (code?.data && code.data.trim() !== lastResult) {
        lastResult = code.data.trim();
        onDetected(lastResult);
    }
}
