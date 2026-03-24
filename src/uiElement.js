import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui"
import { getSceneSetup } from "./scene";

const {scene, engine} = getSceneSetup();
function makeSquare(){
    const r = new GUI.Rectangle();
    r.width = "70%";
    r.height = "70%";
    r.cornerRadius = 12;
    r.color = "#000000";
    r.thickness = 0;
    r.background = "#22222288";
    return r;
  }

function videoUI(slate = GUI.HolographicSlate){
  const videoPlane = BABYLON.MeshBuilder.CreatePlane("videoUI",{
    width: slate.dimensions.x * 0.9,
    height: slate.dimensions.y * 0.9
  }, scene);

  const videoTex = new BABYLON.VideoTexture(
    "clip",
    ["/test.mp4"],
    scene,
    true,
    false,
    BABYLON.VideoTexture.TRILINEAR_SAMPLINGMODE,
    {autoPlay: true, loop: true, muted: true}
  );

  const videoMat = new BABYLON.StandardMaterial("clipMat", scene);
  videoMat.diffuseTexture = videoTex;
  videoMat.emissiveColor = BABYLON.Color3.White();
  videoMat.backFaceCulling = false;
  videoPlane.material = videoMat;
  videoPlane.parent = slate.mesh;
  videoPlane.translate(BABYLON.Axis.Z, -0.5 , BABYLON.Space.LOCAL);
  videoPlane.translate(BABYLON.Axis.Y, -2.5 , BABYLON.Space.LOCAL);
  videoPlane.translate(BABYLON.Axis.X, 4 , BABYLON.Space.LOCAL);
  // store original scale for fullscreen toggle
  const originalScale = videoPlane.scaling.clone();
  let isFullscreen = false;
  const FULLSCREEN_SCALE = 1.6;

  const ctrlSize = (slate.dimensions.x * 0.18); // tweak this factor to change square size
  const controlsPlane = BABYLON.MeshBuilder.CreatePlane("controlsPlane", {
    width: ctrlSize,
    height: ctrlSize
  }, scene);

  // parent to the same slate so it moves with the slate
  controlsPlane.parent = slate.mesh;
  const localPos = videoPlane.position.clone();
  controlsPlane.position = localPos;

  controlsPlane.translate(BABYLON.Axis.Y, - (videoPlane.getBoundingInfo().boundingBox.extendSize.y * 2) * 0.65, BABYLON.Space.LOCAL);
  controlsPlane.translate(BABYLON.Axis.Z, -0.02, BABYLON.Space.LOCAL);
  controlsPlane.rotation = videoPlane.rotation.clone();
  // invisible material so plane receives GUI but is not visible
  const ctrlMat = new BABYLON.StandardMaterial("ctrlMat", scene);
  ctrlMat.diffuseColor = new BABYLON.Color3(0,0,0);
  ctrlMat.alpha = 0; // fully transparent
  controlsPlane.material = ctrlMat;
  const controlsADT = GUI.AdvancedDynamicTexture.CreateForMesh(controlsPlane, 512, 512, false);

  // row container: center contents
  const row = new GUI.StackPanel("ctrlRow");
  row.isVertical = false;
  row.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  row.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
  row.width = "100%";
  row.height = "100%";
  row.background = "transparent";
  controlsADT.addControl(row);
  
  
  // PLAY BUTTON
  const playContainer = makeSquare();
  const playBtn = GUI.Button.CreateSimpleButton("playPause", "⏸");
  playBtn.width = "100%";
  playBtn.height = "100%";
  playBtn.color = "white";
  playBtn.background = "transparent";
  playBtn.onPointerUpObservable.add(() => {
    const vid = videoTex.video;
    if (!vid) return;
    if (vid.paused) {
      vid.play();
      playBtn.textBlock.text = "⏸";
    } else {
      vid.pause();
      playBtn.textBlock.text = "▶";
    }
  });
  playContainer.addControl(playBtn);

// spacer between buttons
  const spacer = new GUI.Rectangle();
  spacer.width = "10%";
  spacer.height = "100%";
  spacer.background = "transparent";
  spacer.thickness = 0;

  // FULLSCREEN BUTTON
  const fsContainer = makeSquare();
  const fsBtn = GUI.Button.CreateSimpleButton("fullscreen", "⤢");
  fsBtn.width = "100%";
  fsBtn.height = "100%";
  fsBtn.color = "white";
  fsBtn.background = "transparent";

  fsBtn.onPointerUpObservable.add(() => {
    isFullscreen = !isFullscreen;

    if (isFullscreen) {
      videoPlane.scaling = originalScale.multiplyByFloats(
        FULLSCREEN_SCALE,
        FULLSCREEN_SCALE,
        FULLSCREEN_SCALE
      );
      fsBtn.textBlock.text = "⤡"; // restore icon
    } else {
      videoPlane.scaling = originalScale.clone();
      fsBtn.textBlock.text = "⤢"; // fullscreen icon
    }
  });

  fsContainer.addControl(fsBtn);

  // add both buttons to the row
  row.addControl(playContainer);
  row.addControl(spacer);
  row.addControl(fsContainer);

  return { videoPlane, videoTex, controlsPlane, controlsADT, playBtn, fsBtn };
}


function textUI(slate){
    var textGrid = new GUI.Grid("textGrid");

    const textContent = new GUI.TextBlock();
    textContent.fontSize = 40;
    textContent.height = "60px";
    textContent.color = "white";
    textGrid.addControl(textContent);
    try {
        fetch("/textAssets/test.txt")
        .then(response => response.text())
        .then(data => {
            textContent.text = data;
        })
    }
    catch(e){
        console.error("text went wrong");
    }
    
    

    slate.content = textGrid;

}

export function createUI(qrValue){
    console.log("This is the qrValue:", qrValue);
    var manager = new GUI.GUI3DManager(scene);
    const slate = new GUI.HolographicSlate("test");
    slate.minDimensions = new BABYLON.Vector2(8,4.5);
    slate.dimensions = new BABYLON.Vector2(8,4.5);
    slate.titleBarHeight = 0.75;
    manager.addControl(slate);


    if(qrValue == "text"){
        console.log("buh");
        textUI(slate);
    }
    if(qrValue == "video"){
        console.log("zuh")
        videoUI(slate);
    }
    if (qrValue === "textvideo") {
    combinedUI(slate);
    }
}

