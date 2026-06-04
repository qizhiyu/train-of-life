import * as THREE from 'three';
import { TRACK_DEPTH, TRAIN_HEADLAMP_DISTANCE, TRAIN_HEIGHT } from './constants';
import type { TrainRig } from './types';

export function createTrain(): TrainRig {
  const root = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x46382b,
    emissive: 0x120b05,
    emissiveIntensity: 0.08,
    roughness: 0.68,
    metalness: 0.06,
  });
  const lampMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd59a,
    emissive: 0xffa12a,
    emissiveIntensity: 2.9,
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.13, TRAIN_HEIGHT * 0.58, 0.045), bodyMaterial);
  body.position.y = TRAIN_HEIGHT * 0.42;
  body.castShadow = true;
  body.receiveShadow = true;
  root.add(body);

  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.043, TRAIN_HEIGHT * 0.62, 0.043), bodyMaterial);
  cab.position.set(-0.032, TRAIN_HEIGHT * 0.78, 0);
  cab.castShadow = true;
  cab.receiveShadow = true;
  root.add(cab);

  const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.007, 0.025, 12), bodyMaterial);
  chimney.position.set(0.035, TRAIN_HEIGHT * 1.03, 0);
  chimney.castShadow = true;
  root.add(chimney);

  const lampFace = new THREE.Mesh(new THREE.CircleGeometry(0.011, 24), lampMaterial);
  lampFace.position.set(0.068, TRAIN_HEIGHT * 0.72, 0);
  lampFace.rotation.y = Math.PI / 2;
  root.add(lampFace);

  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: 0x12100d,
    roughness: 0.5,
    metalness: 0.18,
  });
  const wheelGeometry = new THREE.CylinderGeometry(0.009, 0.009, 0.006, 16);

  for (const x of [-0.038, 0.036]) {
    for (const z of [-0.026, 0.026]) {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.position.set(x, 0.012, z);
      wheel.rotation.x = Math.PI / 2;
      wheel.castShadow = true;
      root.add(wheel);
    }
  }

  const bodyGlow = new THREE.PointLight(0xffb36a, 0.08, 0.35, 2);
  bodyGlow.position.set(-0.02, TRAIN_HEIGHT * 0.8, 0);
  root.add(bodyGlow);

  const lamp = new THREE.SpotLight(0xffc475, 42, 7, 0.72, 0.35, 1.0);
  lamp.position.set(0.07, TRAIN_HEIGHT * 0.72, 0);
  lamp.castShadow = true;
  lamp.shadow.mapSize.set(4096, 4096);
  lamp.shadow.camera.near = 0.01;
  lamp.shadow.camera.far = 6;
  lamp.shadow.bias = -0.00001;
  lamp.shadow.normalBias = 0.001;
  root.add(lamp);

  const lampTarget = new THREE.Object3D();
  lampTarget.position.set(TRAIN_HEADLAMP_DISTANCE, TRAIN_HEIGHT, TRACK_DEPTH / 2);
  lamp.target = lampTarget;

  return {
    root,
    lamp,
    lampTarget,
  };
}
