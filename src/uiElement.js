import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui"
import { getSceneSetup } from "./scene";

const {scene, engine, camera} = getSceneSetup();
let lastW = -1, lastH = -1;
let resizeAdded = false;

function videoUI(slate){
    const videoPlane = BABYLON.MeshBuilder.CreatePlane("videoUI",{
        width: 1.6,
        height: 0.9
    }, scene);

    //anchor medium for video to attach to
    const centerAnchor = new BABYLON.TransformNode("slateCenter", scene);
    centerAnchor.parent = slate.node;

    const videoTex = new BABYLON.VideoTexture(
        "clip",
        ["/test.mp4"],
        scene,
        true,
        false,
        BABYLON.VideoTexture.TRILINEAR_SAMPLINGMODE,
        {autoPlay: false, loop: false, muted: true}
    );

    const videoMat = new BABYLON.StandardMaterial("clipMat", scene);
    videoMat.diffuseTexture = videoTex;
    videoMat.emissiveColor = BABYLON.Color3.White();
    videoMat.backFaceCulling = false;
    videoPlane.material = videoMat;
    videoPlane.parent = centerAnchor;
    centerAnchor.position.z = -0.005;

    let baseSlate = slate.minDimensions.clone();
    let basePlaneSize = new BABYLON.Vector2(1.6, 0.9);

    //GUI Testing
    const GUIPlane = BABYLON.MeshBuilder.CreatePlane("videoUI",{
        width: 1.6,
        height: 0.9
    }, scene);
    GUIPlane.parent = centerAnchor;
    GUIPlane.position.z = -0.002;
    const adtGUI = GUI.AdvancedDynamicTexture.CreateForMeshTexture(GUIPlane, 1.6, 0.9, true, true, BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
    const adtGUImat = new BABYLON.StandardMaterial("GUImat", scene);
    const loadedGUI = GUI.AdvancedDynamicTexture.ParseFromSnippetAsync("#0MECMH", true, adtGUI).then(() => {

//VIDEO SLIDER BAR IMPLEMENTATION
        const slider = adtGUI.getControlByName("Slider");
        slider.minimum = 0;
        slider.maximum = 1;
        slider.value = 0;

        let isUserSeeking = false;

        slider.onPointerDownObservable.add(() => {
            isUserSeekingserSeeking = true;
        });
        slider.onPointerUpObservable.add(() => {
            isUserSeekingserSeeking = false;
        });
        slider.onValueChangedObservable.add((value) => {
        if (!isUserSeeking) return;
        if (!videoTex.video.duration || isNaN(videoTex.video.duration)) return;

        videoTex.video.currentTime = value * videoTex.video.duration;
        });
        
        scene.registerBeforeRender(() => {
        if (isUserSeeking) return;
        if (!videoTex.video.duration || videoTex.video.paused) return;

        slider.value = videoTex.video.currentTime /videoTex.video.duration;
        });
//VIDEO PLAY BUTTON IMPLEMENTATION
        const playButton = adtGUI.getControlByName("PlayButton-bjs");
        playButton.onPointerClickObservable.add(() => {
            if(!videoTex.video.paused){
                videoTex.video.pause();
                paused = true;
            }
            else{
                videoTex.video.play();
                paused = false;
            }   
        });
//VIDEO VOLUME BUTTON IMPLEMENTATION
        const volumeButton = adtGUI.getControlByName("VolumeButton-bjs");
        volumeButton.onPointerClickObservable.add(() => {
            if(videoTex.video.muted){
                videoTex.video.muted = false;
            }
            else
                videoTex.video.muted = true;
        });
    });

    adtGUImat.diffuseTexture = adtGUI;
    GUIPlane.material = adtGUImat;

    
    
    function updateVideoOnResize(){
        const slateW = slate.dimensions.x;
        const slateH = slate.dimensions.y;
        const sx = slateW / basePlaneSize.x; 
        const sy = slateH / basePlaneSize.y ;

        centerAnchor.position.x = slateW*0.5;
        centerAnchor.position.y = -slateH*0.5 - slate.titleBarHeight;
        console.log(centerAnchor.absolutePosition);

        videoPlane.scaling.x = sx;
        videoPlane.scaling.y = sy;
    }
    scene.onBeforeRenderObservable.add(() => {
        if(slate.dimensions.x !== lastW || slate.dimensions.y !== lastH){
            updateVideoOnResize();
            lastW = slate.dimensions.x;
            lastH = slate.dimensions.y;
        }
    });
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
    let camFront = camera.getFrontPosition(3);
    slate.minDimensions = new BABYLON.Vector2(1.6,0.9);
    slate.dimensions = new BABYLON.Vector2(1.6,0.9);
    slate.titleBarHeight = 0.1;
    manager.addControl(slate);
  

    const cleanedQR = qrValue.trim().toLowerCase();


    if(cleanedQR.includes("text")){
        console.log("buh");
        textUI(slate);
    }
    if(cleanedQR.includes("video")){
        console.log("zuh")
        videoUI(slate);
    slate.position = new BABYLON.Vector3(camFront.x - 0.75, camFront.y + 0.5, camFront.z);
    console.log("slate position:" + slate.position);
    }


   

}


