import jsQR from "jsqr";
import * as BABYLON from "babylonjs";

let canvas = document.getElementById("renderCanvas");
let video = document.createElement("video"); //video element in html
video.playsInline = true;


let qrCanvas = document.getElementById("hiddenCanvas"); //grabbing the canvas used for QR Scanning
const qrContext = qrCanvas.getContext("2d", {willReadFrequently: true});


let engine = new BABYLON.Engine(canvas, true);
let scene = new BABYLON.Scene(engine);
let camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 3, 3, BABYLON.Vector3.Zero(), scene);

const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

scene.activeCamera = camera;
camera.attachControl(canvas, true);

light.intensity = 0.7;

//webXR default template
const xr = await scene.createDefaultXRExperienceAsync({
  uiOptions: { sessionMode: "immersive-ar" } // webXR default settings
});


//Video Plane

const videoPlane = BABYLON.MeshBuilder.CreatePlane("videoPlane", {width: 1, height: 1}, scene);
videoPlane.parent = camera;
videoPlane.position = new BABYLON.Vector3(0,0,1);


const stream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
  audio: false
});

video.srcObject = stream;
await video.play();

const videoTex = new BABYLON.VideoTexture("camTex", video, scene, true, false, BABYLON.VideoTexture.TRILINEAR_SAMPLINGMODE, {autoPlay: true});
const mat = new BABYLON.StandardMaterial("videoMat", scene);
mat.diffuseTexture = videoTex;
mat.emissiveColor = new BABYLON.Color3(1,1,1);
videoPlane.material = mat;

//Adjust the videoPlane to the projection volume(the frustum)
const frustumHeight = 2 * 1 * Math.tan(camera.fov / 2);
const aspect = engine.getRenderWidth() / engine.getRenderHeight();
const frustumWidth = frustumHeight * aspect;

videoPlane.position.set(0, 0, 1);
videoPlane.scaling.x = frustumWidth;  // plane created with size=1 → scale to fit width
videoPlane.scaling.y = frustumHeight; // scale to fit height

// --------------------------------------------------SCAN FOR QR HERE----------------------------------------------------------------------------------
let lastResult = "";
let lastTime = 0;
const SCAN_INTERVAL_MS = 150;
const tracks = stream?.getTracks?.() ?? [];


//Pop up button (This is forced because entering XR requires user activation Event)
function showPopup() {
  document.getElementById("popupOverlay").classList.remove("hidden");
}

document.getElementById("enterARBtn").addEventListener("click", async () => {

  // Hide popup immediately
  document.getElementById("popupOverlay").classList.add("hidden");

  // THIS MUST BE INSIDE THE BUTTON CLICK
  try {
    const xr = await scene.createDefaultXRExperienceAsync({
      uiOptions: { sessionMode: "immersive-ar" }
    });

    await xr.baseExperience.enterXRAsync(); 
  } catch (e) {
    console.error("Failed to start AR:", e);
  }
});

//What happens with detected Value
const testingVideoTex = new BABYLON.VideoTexture("testTex", "/test.mp4", scene, true, false, BABYLON.VideoTexture.TRILINEAR_SAMPLINGMODE, {autoPlay: false});
function onDetected(value) {
  console.log("[QR] Detected:", value);
  if(value == "1"){
    alert("Switching");
      
      //stop camera from playing in background
      tracks.forEach(t => t.stop());
      video.pause();
      video.srcObject = null;

      xr.baseExperience.enterXRAsync();

      videoPlane.parent = null;
      videoPlane.position.copyFrom(camera.getFrontPosition(2));
      mat.diffuseTexture = testingVideoTex;
      testingVideoTex.video.play();
  }
  else
    alert("QR:" + value);
}


// QR Scan Loop
function scanLoop(ts) {
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

        qrContext.drawImage(video, 0, 0, w, h);
        const imgData = qrContext.getImageData(0, 0, w, h);

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
  requestAnimationFrame(scanLoop);

//render loop
engine.runRenderLoop(() => {
  scene.render()
});


window.addEventListener("resize", () => engine.resize());


