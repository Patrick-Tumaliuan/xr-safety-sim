import jsQR from "jsqr";
import {
  Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight,
  MeshBuilder, StandardMaterial, Color3, VideoTexture, 
} from "babylonjs";

export async function initQRScene(canvas, onDetected) {
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);

  const camera = new ArcRotateCamera("cam", Math.PI/2, Math.PI/3, 3, Vector3.Zero(), scene);
  camera.attachControl(canvas, true);
  new HemisphericLight("light", new Vector3(0, 1, 0), scene);

  // GUI popup: use your own UI system or Babylon GUI if you added it
  const video = document.createElement("video");
  video.setAttribute("playsinline", "true");
  video.muted = true;

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
    audio: false
  });
  video.srcObject = stream;
  await video.play();

  //Look at this
  const plane = MeshBuilder.CreatePlane("videoPlane", { width: 2, height: 2 }, scene);
  plane.parent = camera;
  plane.position = new Vector3(0, 0, 1);
  
  const tex = new VideoTexture("camTex", video, scene, true, false, VideoTexture.TRILINEAR_SAMPLINGMODE, { autoPlay: true });
  const mat = new StandardMaterial("videoMat", scene);
  mat.diffuseTexture = tex;
  mat.emissiveColor = new Color3(1,1,1);
  mat.disableLighting = true;
  plane.material = mat;

  function syncPlaneToFrustum(engine, camera, plane, distance = 1){
    
    const frustumHeight = 2 * distance * Math.tan(camera.fov / 2);
    const aspect = engine.getRenderWidth() / engine.getRenderHeight();
    const frustumWidth = frustumHeight * aspect;

    plane.position.set(0, 0, distance);
    plane.scaling.x = frustumWidth;  // plane created with size=1 → scale to fit width
    plane.scaling.y = frustumHeight; // scale to fit height

  }
  syncPlaneToFrustum(engine, camera, plane, 1);
 
  window.addEventListener("resize", () => { engine.resize(); syncPlaneToFrustum(engine, camera, plane, 1);});

  // Hidden canvas for decoding
  const qrCanvas = document.createElement("canvas");
  const qrCtx = qrCanvas.getContext("2d", { willReadFrequently: true });

  let lastResult = "";
  let lastTime = 0;

  function scanLoop(ts) {
    const interval = 150; // ms
    if (!lastTime || ts - lastTime >= interval) {
      lastTime = ts;

      const vw = video.videoWidth || 640;
      const vh = video.videoHeight || 480;
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
        onDetected?.(code.data);
      }
    }
    requestAnimationFrame(scanLoop);
  }
  requestAnimationFrame(scanLoop);

  engine.runRenderLoop(() => scene.render());

  // Return a cleanup handle
  return () => {
    scene.dispose();
    stream.getTracks().forEach(t => t.stop());
    engine.dispose();
  };
}

