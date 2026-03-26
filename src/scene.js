export async function initScene() {
    const canvas = document.getElementById("babylon-canvas");

    //Engine 
    const engine = new BABYLON.Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil:              true,
        alpha:                true,   // transparent canvas → camera feed visible beneath
        premultipliedAlpha:   false,
    });

    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

    //  Camera 
    const camera = new BABYLON.ArcRotateCamera(
        "cam", -Math.PI / 2, Math.PI / 2.5, 5, BABYLON.Vector3.Zero(), scene
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 20;
    camera.wheelPrecision   = 50;

    //  Lighting
    const hemi = new BABYLON.HemisphericLight(
        "hemi", new BABYLON.Vector3(0, 1, 0), scene
    );
    hemi.intensity = 1.2;

    // Render loop
    engine.runRenderLoop(() => scene.render());
    window.addEventListener("resize", () => engine.resize());

    // WebXR
    let xrHelper = null;
    try {
        const supported = await BABYLON.WebXRSessionManager
            .IsSessionSupportedAsync("immersive-vr");

        if (supported) {
            xrHelper = await scene.createDefaultXRExperienceAsync({
                disableDefaultUI: true,  
                optionalFeatures: true,
            });

            // Not sure what this should tell us the state but idk if it actually works or not could remove this whole thing. 
            xrHelper.baseExperience.onStateChangedObservable.add((state) => {
                const label = {
                    [BABYLON.WebXRState.NOT_IN_XR]:   "NOT_IN_XR",
                    [BABYLON.WebXRState.ENTERING_XR]: "ENTERING_XR ⏳",
                    [BABYLON.WebXRState.IN_XR]:       "IN_XR ✅",
                    [BABYLON.WebXRState.EXITING_XR]:  "EXITING_XR 🔄",
                }[state] ?? `UNKNOWN (${state})`;

                console.log(`WebXR state → ${label}`);

                if (state === BABYLON.WebXRState.IN_XR) {
                    alert("WebXR session started!");
                }
            });

            console.log("WebXR helper ready");
        } else {
            console.log("immersive-vr not supported — flat mode");
        }
    } catch (e) {
        console.warn("WebXR setup error:", e);
    }

    return { scene, engine, xrHelper };
}