import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui"
import { initScene } from "./scene";

const { scene, engine, xrHelper } = await initScene();
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
        {autoPlay: true, loop: true, muted: true}
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
    }


   

}


