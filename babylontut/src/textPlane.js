import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";

export function createTextPlane(scene) {
  const plane = BABYLON.MeshBuilder.CreatePlane(
    "textPlane",
    { width: 4, height: 2.5 },
    scene
  );

  const texture = GUI.AdvancedDynamicTexture.CreateForMesh(plane);

  const text = new GUI.TextBlock();
  text.text =
    "LASER CUTTER SAFETY\n\n" +
    "- Wear protective goggles\n" +
    "- Avoid direct eye exposure\n" +
    "- Maintain proper ventilation";
  text.color = "white";
  text.fontSize = 48;
  text.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  text.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
  text.textWrapping = true;

  texture.addControl(text);

  plane.position.z = 2;
  plane.setEnabled(false);

  return plane;
}