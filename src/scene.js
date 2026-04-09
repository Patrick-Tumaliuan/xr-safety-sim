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
        .IsSessionSupportedAsync("immersive-ar");

    if (supported) {
        xrHelper = await scene.createDefaultXRExperienceAsync({
            disableDefaultUI: true,
            uiOptions: { sessionMode: "immersive-ar" },
            optionalFeatures: ["hit-test", "anchors"]
        });

        // Enable anchor system
        const anchorSystem = xrHelper.baseExperience.featuresManager.enableFeature(
            BABYLON.WebXRFeatureName.ANCHOR_SYSTEM,
            "latest",
            { worldParentNode: scene }
        );

        // Enable hit-test
        const hitTest = xrHelper.baseExperience.featuresManager.enableFeature(
            BABYLON.WebXRFeatureName.HIT_TEST,
            "latest"
        );

        // Tap to place anchor
        scene.onPointerDown = () => {
            const hit = hitTest.latestHitTestResult;
            if (!hit) return;

            anchorSystem.addAnchorPointUsingHitTestResultAsync(hit).then(anchor => {
                const box = BABYLON.MeshBuilder.CreateBox("box", { size: 0.1 }, scene);
                box.material = new BABYLON.StandardMaterial("mat", scene);
                box.material.diffuseColor = new BABYLON.Color3(1, 0, 0);

                anchor.attachedNode = box;
            });
        };

        console.log("WebXR AR ready");
    } else {
        console.log("immersive-ar not supported — flat mode");
    }
} catch (e) {
    console.warn("WebXR setup error:", e);
}
    // Enable anchor system
const anchorSystem = xrHelper.baseExperience.featuresManager.enableFeature(
    BABYLON.WebXRFeatureName.ANCHOR_SYSTEM,
    "latest",
    { worldParentNode: scene }
);

// Enable hit-test
const hitTest = xrHelper.baseExperience.featuresManager.enableFeature(
    BABYLON.WebXRFeatureName.HIT_TEST,
    "latest"
);


scene.onPointerDown = () => {
    const hit = hitTest.latestHitTestResult;
    if (!hit) return;

    anchorSystem.addAnchorPointUsingHitTestResultAsync(hit).then(anchor => {
        const box = BABYLON.MeshBuilder.CreateBox("box", { size: 0.1 }, scene);
        box.material = new BABYLON.StandardMaterial("mat", scene);
        box.material.diffuseColor = new BABYLON.Color3(1, 0, 0);

        anchor.attachedNode = box;
    });
};
    return { scene, engine, xrHelper };
}