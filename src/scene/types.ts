import * as THREE from 'three';

export type TrainRig = {
  root: THREE.Group;
  lamp: THREE.SpotLight;
  lampTarget: THREE.Object3D;
};

export type SceneObjects = {
  train: TrainRig;
  cameraTarget: THREE.Vector3;
};

export type TrackSample = {
  position: THREE.Vector3;
  tangent: THREE.Vector3;
};
