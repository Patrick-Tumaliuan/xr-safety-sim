import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import { scene, setupXR } from "./scene";

export async function loadModule() {
    // Create 3D Slate
    const manager = new GUI.GUI3DManager(scene);
    const slate = new GUI.HolographicSlate("moduleSlate");
    slate.minDimensions = new BABYLON.Vector2(4, 2);
    slate.dimensions = new BABYLON.Vector2(4, 2);
    slate.titleBarHeight = 0.2;
    manager.addControl(slate);

    // Text
    const textBlock = new GUI.TextBlock();
    textBlock.text = "Hello from QR Module!";
    textBlock.color = "white";
    textBlock.fontSize = 40;
    slate.content.addControl(textBlock);

    // Image
    const img = new GUI.Image("pic", "/sample.jpg"); // put a sample.jpg in /public
    img.width = "80%";
    img.height = "60%";
    img.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    slate.content.addControl(img);

    // Button
    const button = GUI.Button.CreateSimpleButton("btn", "Toggle Image");
    button.width = "40%";
    button.height = "20%";
    button.color = "white";
    button.background = "green";
    button.onPointerUpObservable.add(() => {
        img.isVisible = !img.isVisible;
    });
    slate.content.addControl(button);

    // Start WebXR
    try {
        const xr = await setupXR();
        if (xr) await xr.baseExperience.enterXRAsync("immersive-vr", "local-floor");
    } catch (e) {
        console.error("XR failed:", e);
        alert("XR not available");
    }
}