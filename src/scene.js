export async function initScene() {
    const canvas = document.getElementById("babylon-canvas");

    //Engine
    const engine = new BABYLON.Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
        alpha: true,
        premultipliedAlpha: false,
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
    camera.wheelPrecision = 50;

    //  Lighting
    const hemi = new BABYLON.HemisphericLight(
        "hemi", new BABYLON.Vector3(0, 1, 0), scene
    );
    hemi.intensity = 1.2;

    // Large floor for controller ray picks (VR / Quest browser; no WebXR hit-test)
    const placementGround = BABYLON.MeshBuilder.CreateGround(
        "xrPlacementGround",
        { width: 80, height: 80 },
        scene
    );
    placementGround.position.y = 0;
    placementGround.isPickable = true;
    placementGround.visibility = 0;

    const pickRay = new BABYLON.Ray(
        BABYLON.Vector3.Zero(),
        new BABYLON.Vector3(0, 0, 1),
        100
    );

    let placedInfoRoot = null;

    function disposePlacedInfoUI() {
        if (placedInfoRoot) {
            placedInfoRoot.dispose(false, true);
            placedInfoRoot = null;
        }
    }

    function orientUprightTowardCamera(root, worldPos, cameraWorldPos) {
        const dx = cameraWorldPos.x - worldPos.x;
        const dz = cameraWorldPos.z - worldPos.z;
        root.rotation.x = 0;
        root.rotation.z = 0;
        root.rotation.y = Math.atan2(dx, dz);
    }

    function buildPrinterInfoUIGroup() {
        const root = new BABYLON.TransformNode("printerInfoUIRoot", scene);

        const panel = BABYLON.MeshBuilder.CreatePlane(
            "printerInfoPanel",
            { width: 0.55, height: 0.35 },
            scene
        );
        panel.parent = root;
        panel.isPickable = false;

        const adt = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(panel, 1024, 640);

        const bg = new BABYLON.GUI.Rectangle("printerInfoBg");
        bg.width = "92%";
        bg.height = "92%";
        bg.thickness = 2;
        bg.color = "#00ffe0";
        bg.background = "rgba(10, 10, 20, 0.92)";
        adt.addControl(bg);

        const stack = new BABYLON.GUI.StackPanel("printerInfoStack");
        stack.width = "100%";
        stack.height = "100%";
        stack.paddingTop = "12px";
        stack.spacing = 10;
        bg.addControl(stack);

        const title = new BABYLON.GUI.TextBlock("printerInfoTitle");
        title.text = "Printer info";
        title.color = "white";
        title.fontSize = 44;
        title.height = "80px";
        stack.addControl(title);

        const body = new BABYLON.GUI.TextBlock("printerInfoBody");
        body.text = "Status / details (placeholder)";
        body.color = "#e8eaf0";
        body.fontSize = 26;
        body.height = "160px";
        stack.addControl(body);

        const btn = BABYLON.GUI.Button.CreateSimpleButton("printerInfoBtn", "OK");
        btn.width = "36%";
        btn.height = "64px";
        btn.color = "#0a0a0f";
        btn.fontSize = 22;
        btn.background = "#00ffe0";
        stack.addControl(btn);

        return root;
    }

    function placeInfoUIAt(worldPosition, cameraWorldPosition) {
        disposePlacedInfoUI();
        const root = buildPrinterInfoUIGroup();
        root.position.copyFrom(worldPosition);
        orientUprightTowardCamera(root, worldPosition, cameraWorldPosition);
        placedInfoRoot = root;
    }

    function tryPlaceFromController(xrInputSource) {
        const cam = scene.activeCamera;
        if (!cam) return;

        const headPos = cam.globalPosition.clone();

        xrInputSource.getWorldPointerRayToRef(pickRay, false);

        const hit = scene.pickWithRay(pickRay, (mesh) => {
            if (!mesh || !mesh.isPickable) return false;
            const n = mesh.name || "";
            if (n.startsWith("printerInfo")) return false;
            return true;
        });

        let worldPos;
        if (hit && hit.hit && hit.pickedPoint) {
            worldPos = hit.pickedPoint.clone();
            worldPos.y += 0.05;
        } else {
            const fr = cam.getForwardRay(2);
            worldPos = fr.origin.add(fr.direction.scale(1.75));
        }

        placeInfoUIAt(worldPos, headPos);
    }

    let xrHelper = null;
    try {
        const vrSupported = await BABYLON.WebXRSessionManager.IsSessionSupportedAsync(
            "immersive-vr"
        );

        if (vrSupported) {
            xrHelper = await scene.createDefaultXRExperienceAsync({
                disableDefaultUI: true,
                disablePointerSelection: true,
                disableTeleportation: true,
                floorMeshes: [placementGround],
                uiOptions: { sessionMode: "immersive-vr" },
            });

            xrHelper.input.onControllerAddedObservable.add((xrInputSource) => {
                let triggerWasPressed = false;

                xrInputSource.onMotionControllerInitObservable.add((motionController) => {
                    const trigger = motionController.getComponent("xr-standard-trigger");
                    if (!trigger) return;

                    trigger.onButtonStateChangedObservable.add(() => {
                        const down = !!trigger.pressed;
                        if (
                            down &&
                            !triggerWasPressed &&
                            xrHelper.baseExperience.state === BABYLON.WebXRState.IN_XR
                        ) {
                            tryPlaceFromController(xrInputSource);
                        }
                        triggerWasPressed = down;
                    });
                });
            });
        } else {
            console.log("immersive-vr not supported — flat mode only");
        }
    } catch (e) {
        console.warn("WebXR setup error:", e);
    }

    engine.runRenderLoop(() => scene.render());
    window.addEventListener("resize", () => engine.resize());

    return { scene, engine, xrHelper };
}
