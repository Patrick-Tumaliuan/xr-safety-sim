import * as BABYLON from "babylonjs";
export function createVideoPlane(scene) {
  const videoTexture = new BABYLON.VideoTexture(
    "video",
    "/video/test.mp4",
    scene,
    true,
    true,
    BABYLON.VideoTexture.TRILINEAR_SAMPLINGMODE,
    {
      autoPlay: false,
      loop: true,
      muted: true
    }
  );

  // Fix upside-down video
  videoTexture.uScale = 1;
  videoTexture.vScale = -1;
  videoTexture.vOffset = 1;

  const videoPlane = BABYLON.MeshBuilder.CreatePlane(
    "videoPlane",
    { width: 4, height: 2.25, sideOrientation: BABYLON.Mesh.DOUBLESIDE },
    scene
  );

  const videoMat = new BABYLON.StandardMaterial("videoMat", scene);
  videoMat.emissiveTexture = videoTexture;
  videoMat.disableLighting = true;

  videoPlane.material = videoMat;
  videoPlane.position.z = 2;
  videoPlane.setEnabled(false); // hidden by default

  return { videoPlane, videoTexture };
}