import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui"
import { getSceneSetup } from "./scene";

const {scene, engine} = getSceneSetup();

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

}

