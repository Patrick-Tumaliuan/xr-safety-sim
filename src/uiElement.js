import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui"
import { getSceneSetup } from "./scene";

const {scene, engine, camera} = getSceneSetup();
let lastW = -1, lastH = -1;
let resizeAdded = false;

function videoUI(slate, parent, filepath){
    const videoPlane = BABYLON.MeshBuilder.CreatePlane("videoUI",{
        width: 1.6,
        height: 0.9
    }, scene);

    //anchor medium for video to attach to
    const centerAnchor = new BABYLON.TransformNode("slateCenter", scene);
    const root = new BABYLON.TransformNode("videoUIRoot", scene);
    centerAnchor.parent = root;
    root.parent = parent;

    const videoTex = new BABYLON.VideoTexture(
        "clip",
        [filepath],
        scene,
        true,
        false,
        BABYLON.VideoTexture.TRILINEAR_SAMPLINGMODE,
        {autoPlay: true, loop: true, muted: true}
    );

    
    root.metadata = {
            type: "video",
            videoTex
        };

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
    const loadedGUI = GUI.AdvancedDynamicTexture.ParseFromFileAsync("guiTexture.json", true, adtGUI).then(() => {

//VIDEO SLIDER BAR IMPLEMENTATION
        const slider = adtGUI.getControlByName("Slider");
        slider.minimum = 0;
        slider.maximum = 1;
        slider.value = 0;
        slider.alpha = 0.5;

        let isUserSeeking = false;

        slider.onPointerDownObservable.add(() => {
            isUserSeeking = true;
        });
        slider.onPointerUpObservable.add(() => {
            isUserSeeking = false;
        });
        slider.onValueChangedObservable.add((value) => {
        if (!isUserSeeking) return;
        if (!videoTex.video.duration || isNaN(videoTex.video.duration)) return;

        videoTex.video.currentTime =  value * videoTex.video.duration;
        });
        
        scene.registerBeforeRender(() => {
        if (isUserSeeking) return;
        if (!videoTex.video.duration || videoTex.video.paused) return;

        slider.value = videoTex.video.currentTime /videoTex.video.duration;
        });
//VIDEO PLAY BUTTON IMPLEMENTATION
        const playButton = adtGUI.getControlByName("PlayButton-bjs");
        playButton.onPointerEnterObservable.add(() => {
            playButton.alpha = 1;
        });
        playButton.onPointerOutObservable.add(() => {
            playButton.alpha = 0;
        });
        
        // Track desired state explicitly
        let wantsPlaying = !videoTex.video.paused;

        playButton.onPointerClickObservable.add(() => {
            wantsPlaying = !wantsPlaying;

            // Defer media calls to avoid XR frame deadlock
            scene.onBeforeRenderObservable.addOnce(() => {
                const video = videoTex.video;

                if (wantsPlaying) {
                    // Only call play if actually paused
                    if (video.paused) {
                        video.play(); // DO NOT await
                    }
                } else {
                    // Only call pause if actually playing
                    if (!video.paused) {
                        video.pause();
                    }
                }
            });
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

    root.setEnabled(false);
    return root;
}


function textUI(slate, parent, filepath){
    var textGrid = new GUI.Grid("textGrid");
    const root = new BABYLON.TransformNode("textUIRoot", scene);
    root.parent = parent;

    const textContent = new GUI.TextBlock();
    textContent.fontSize = 40;
    textContent.height = "60px";
    textContent.color = "white";
    textGrid.addControl(textContent);
    try {
        fetch(filepath)
        .then(response => response.text())
        .then(data => {
            textContent.text = data;
        })
    }
    catch(e){
        console.error("text went wrong");
    }
    
    slate.content = textGrid;

    root.setEnabled(false);
    return root;
}

//Testing for GUI Slides:

function createSlideNavButtons(slate, slideShow, manager) {
    // Parent node so buttons follow the slate
    const buttonRoot = new BABYLON.TransformNode("slideNavRoot", scene);
    buttonRoot.parent = slate.node;

    const nextBtn = new GUI.HolographicButton("nextSlideBtn");
    nextBtn.text = ">";
    manager.addControl(nextBtn);
    nextBtn.linkToTransformNode(buttonRoot);
    nextBtn.scaling = new BABYLON.Vector3(0.2, 0.2, 1);
    nextBtn.node.position = new BABYLON.Vector3(
        slate.dimensions.x + 0.25,
        -0.5,
        0
    );

    nextBtn.onPointerUpObservable.add(() => {
        slideShow.next();
    });

    const prevBtn = new GUI.HolographicButton("prevSlideBtn");
    prevBtn.text = "<";
    manager.addControl(prevBtn);
    prevBtn.linkToTransformNode(buttonRoot);

    prevBtn.scaling = new BABYLON.Vector3(0.2, 0.2, 1);
    prevBtn.node.position = new BABYLON.Vector3(
        slate.dimensions.x - 1.85,
        -0.5,
        0
    );

    prevBtn.onPointerUpObservable.add(() => {
        slideShow.prev();
    });

    return buttonRoot;
}


function createSlateSlides(slate){
    
    const contentRoot = new BABYLON.TransformNode("slateContentRoot", scene);
    contentRoot.parent = slate.node;

    const slides = [];
    var currentIndex = 0;

    return {
        contentRoot,
        slides,
        show(index) {
        slides.forEach((slide, i) => {
            const active = i === index;
            slide.setEnabled(active);

            const meta = slide.metadata;
            if (meta?.type === "video") {
                const video = meta.videoTex.video;

                if (!active) {
                    if (!video.paused) {
                        video.pause();
                    }
                } 
            }
        });

        currentIndex = index;
        slate.title = `Step ${index + 1}`;
        },
        next() {
            this.show((currentIndex + 1) % slides.length);
        },
        prev() {
            this.show((currentIndex - 1 + slides.length) % slides.length);
        }
    }

}

export async function createUI(qrValue){
    console.log("This is the qrValue:", qrValue);
    var manager = new GUI.GUI3DManager(scene);
    const slate = new GUI.HolographicSlate("test");
    slate.minDimensions = new BABYLON.Vector2(1.6,0.9);
    slate.dimensions = new BABYLON.Vector2(1.6,0.9);
    slate.titleBarHeight = 0.1;
    manager.addControl(slate);
    
    

  

    const cleanedQR = qrValue.trim().toLowerCase();

    const slideShow = createSlateSlides(slate);

    const response = await fetch(qrValue);
    const files = await response.json();

    for (const file of files) {
        let slide;

        switch (file.type) {
            case "text":
                slide = textUI(slate, slideShow.contentRoot, file.src);
                break;

            case "video":
                slide = videoUI(slate, slideShow.contentRoot, file.src);
                break;

            default:
                console.warn("Unknown UI type:", file);
                continue;
        }

        slideShow.slides.push(slide);
    }

    if (slideShow.slides.length > 0) {
        slideShow.show(0);
    }

    createSlideNavButtons(slate, slideShow, manager);


    const xr = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
            sessionMode: "immersive-ar"
        }
    });

    const xrCamera = xr.baseExperience.camera;
    const camFront = xrCamera.getFrontPosition(2);
    //Temporary control//Temporary control:
    slate.position = new BABYLON.Vector3(camFront.x - 0.75, camFront.y + 1, camFront.z);
    // Make slate face the camera
    slate.lookAt(xrCamera.position);

   
    window.addEventListener("keydown", (e) => {
        if (e.key === "e") {
            slideShow.next();
            console.log(slideShow.currentIndex);
        }
        if (e.key === "q") {
            slideShow.prev();
        }
    });
    return slate;
}










