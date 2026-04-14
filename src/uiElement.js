import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui"
import { getSceneSetup } from "./scene";

const {scene, engine, camera} = getSceneSetup();
let lastW = -1, lastH = -1;
let resizeAdded = false;

function videoUI(slate, filepath){

    const root = new BABYLON.TransformNode("videoUIRoot", scene);
    root.parent = slate.node;


    const videoPlane = BABYLON.MeshBuilder.CreatePlane("videoUI",{
        width: 1.6,
        height: 0.9
    }, scene);

    //anchor medium for video to attach to
    const centerAnchor = new BABYLON.TransformNode("slateCenter", scene);
    centerAnchor.parent = root;

    const videoTex = new BABYLON.VideoTexture(
        "clip",
        [filepath],
        scene,
        true,
        false,
        BABYLON.VideoTexture.TRILINEAR_SAMPLINGMODE,
        {autoPlay: false, loop: true, muted: true}
    );

    videoTex.video.crossOrigin = "anonymous";
    videoTex.video.setAttribute("crossorigin", "anonymous");

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
        const playButton = adtGUI.getControlByName("PlayButton-bjs");'
        playButton.alpha = 0;
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
    return{root, videoTex};
}


function textUI(filepath) {
    const grid = new GUI.Grid("textGrid");

    // Background
    const background = new GUI.Rectangle("bg");
    background.width = "100%";
    background.height = "100%";
    background.thickness = 0;
    background.background = "black";
    background.alpha = 0.95;

    // ScrollViewer
    const scroll = new GUI.ScrollViewer();
    scroll.width = "100%";
    scroll.height = "100%";
    scroll.thickness = 0;
    scroll.barSize = 12;
    scroll.color = "white";

    // Content container (THIS is what we size manually)
    const contentContainer = new GUI.Rectangle("contentContainer");
    contentContainer.width = "100%";
    contentContainer.thickness = 0;

    // Text
    const text = new GUI.TextBlock("textContent");
    text.fontSize = 15;
    text.color = "white";
    text.textWrapping = true;
    text.resizeToFit = false;
    text.textHorizontalAlignment =
        GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    text.textVerticalAlignment =
        GUI.Control.VERTICAL_ALIGNMENT_TOP;

    text.paddingTop = "16px";
    text.paddingLeft = "16px";
    text.paddingRight = "16px";
    text.paddingBottom = "16px";

    contentContainer.addControl(text);
    scroll.addControl(contentContainer);
    background.addControl(scroll);
    grid.addControl(background);

    // Load text
    fetch(filepath)
        .then(r => r.text())
        .then(data => {
            text.text = data;

            // ✅ CRITICAL FIX
            requestAnimationFrame(() => {
                const expectedHeight = text.computeExpectedHeight();

                // Force container height to match text
                contentContainer.height =
                    expectedHeight + 32 + "px"; // padding safety

                scroll._markAsDirty();
                scroll.verticalBar.value = 0; // start at TOP
            });
        })
        .catch(() => {
            text.text = "Failed to load text.";
        });

    return grid;
}

function imageUI(imagePath) {

    const grid = new GUI.Grid("imageGrid");
    const image = new GUI.Image("Image", imagePath);
    grid.addControl(image);

    return grid;
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

    /*
    const exitBtn = new GUI.HolographicButton("exitBtn");
    exitBtn.text = "X";
    manager.addControl(exitBtn);
    exitBtn.linkToTransformNode(buttonRoot);
    exitBtn.node.scaling = new BABYLON.Vector3(0.2, 0.2, 1);
    exitBtn.node.position = new BABYLON.Vector3(
        slate.dimensions.x + 0.25,
        0,
        0
    );

    exitBtn.onPointerUpObservable.add(async () => {
        await xr.baseExperience.exitXRAsync();
        window.location.reload();
        exitBtn.onPointerUpObservable = null
    });
    */

    return buttonRoot;
}


function createSlateSlides(slate, videoRoot, videoTex) {
    const slides = [];
    let currentIndex = 0;

    function show(index) {
        const slide = slides[index];

        // ✅ Always stop & hide video first
        if (videoRoot) {
            videoRoot.setEnabled(false);
        }
        if (videoTex?.video && !videoTex.video.paused) {
            videoTex.video.pause();
            videoTex.video.muted = true;
        }

        // ✅ Switch by slide type
        if (slide.type === "text" || slide.type === "image") {
            slate.content = slide.content; // GUI.Control
        }

        else if (slide.type === "video") {
            slate.content = null; // clear GUI
            videoRoot.setEnabled(true);

            if (videoTex?.video) {
                videoTex.video.muted = false;
                videoTex.video.play();
            }
        }

        // ✅ Update title
        slate.title = `Step ${index + 1}`;

        currentIndex = index;
    }

    return {
        slides,
        show,
        next() {
            show((currentIndex + 1) % slides.length);
        },
        prev() {
            show((currentIndex - 1 + slides.length) % slides.length);
        }
    };
}


export async function createUI(qrValue){
    console.log("This is the qrValue:", qrValue);
    var manager = new GUI.GUI3DManager(scene);
    const slate = new GUI.HolographicSlate("test");
    slate.minDimensions = new BABYLON.Vector2(1.6,0.9);
    slate.dimensions = new BABYLON.Vector2(1.6,0.9);
    slate.titleBarHeight = 0.1;
    manager.addControl(slate);
    slate.removeBehavior(slate._sixDofDragBehavior);

    const cleanedQR = qrValue.trim().toLowerCase();

    const response = await fetch(qrValue);
    const files = await response.json();

    
    let videoRoot = null;
    let videoTex = null;

    
    
const firstVideo = files.find(f => f.type === "video");
    if (firstVideo) {
        const video = videoUI(slate, firstVideo.src);
        videoRoot = video.root;
        videoTex = video.videoTex;
    }

    // ─────────────────────────────────────────────
    // 4️⃣ Create hybrid slideshow controller
    // ─────────────────────────────────────────────
    const slideShow = createSlateSlides(slate, videoRoot, videoTex);

    // ─────────────────────────────────────────────
    // 5️⃣ Populate slides (DATA, not nodes)
    // ─────────────────────────────────────────────
    for (const file of files) {
        switch (file.type) {
            case "text":
                slideShow.slides.push({
                    type: "text",
                    content: textUI(file.src)
                });
                break;

            case "image":
                slideShow.slides.push({
                    type: "image",
                    content: imageUI(file.src)
                });
                break;

            case "video":
                slideShow.slides.push({
                    type: "video"
                });
                break;

            default:
                console.warn("Unknown slide type:", file);
        }
    }

    // ─────────────────────────────────────────────
    // 6️⃣ Show first slide
    // ─────────────────────────────────────────────
    if (slideShow.slides.length > 0) {
        slideShow.show(0);
    }


    const xr = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
            sessionMode: "immersive-ar"
        }
    });

    createSlideNavButtons(slate, slideShow, manager, xr);

    const xrCamera = xr.baseExperience.camera;
    const camFront = xrCamera.getFrontPosition(2);
    //Temporary control//Temporary control:
    slate.position = new BABYLON.Vector3(camFront.x - 0.75, camFront.y + 1, camFront.z);

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










