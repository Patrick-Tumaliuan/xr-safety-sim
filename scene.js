import * as BABYLON from "@babylonjs/core";

let mainCanvas = document.getElementById("babylonCanvas");
export const engine = new BABYLON.Engine(mainCanvas, true);
export const scene = new BABYLON.Scene(engine);

export async function setupXR() {
    try {
        const xr = await scene.createDefaultXRExperienceAsync({
            uiOptions: { sessionMode: "immersive-vr" }
        });
        return xr;
    } catch (e) {
        console.error("XR setup failed:", e);
        return null;
    }
}

// Render loop
window.addEventListener("resize", () => engine.resize());
engine.runRenderLoop(() => scene.render());