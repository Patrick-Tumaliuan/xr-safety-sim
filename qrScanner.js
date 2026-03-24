import jsQR from "jsqr";

let qrCanvas = document.getElementById("qrCanvas");
let video = document.createElement("video");
video.playsInline = true;
const qrCtx = qrCanvas.getContext("2d", { willReadFrequently: true });

let stream = null;
let scanLooping = false;
let lastResult = "";
const SCAN_INTERVAL_MS = 50;
let lastTime = 0;

export async function startQR(onDetected) {
    if (stream) return;

    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false,
        });
        video.srcObject = stream;
        await video.play();

        if (!scanLooping) {
            scanLooping = true;
            requestAnimationFrame(function scan(ts) {
                if (!stream) return (scanLooping = false);

                if (!lastTime || ts - lastTime >= SCAN_INTERVAL_MS) {
                    lastTime = ts;
                    qrCanvas.width = video.videoWidth;
                    qrCanvas.height = video.videoHeight;
                    qrCtx.drawImage(video, 0, 0);
                    const imgData = qrCtx.getImageData(0, 0, qrCanvas.width, qrCanvas.height);
                    const code = jsQR(imgData.data, imgData.width, imgData.height, { inversionAttempts: "dontInvert" });
                    if (code?.data && code.data !== lastResult) {
                        lastResult = code.data;
                        onDetected(code.data.trim());
                    }
                }
                requestAnimationFrame(scan);
            });
        }
    } catch (e) {
        console.error("Camera failed:", e);
        alert("Camera access failed");
    }
}

export function stopQR() {
    video.pause();
    stream?.getTracks?.forEach(t => t.stop());
    stream = null;
    lastResult = "";
}