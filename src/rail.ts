import * as THREE from 'three';

export const loadRail = (scene: THREE.Scene) => {
  const geometry = new THREE.CircleBufferGeometry(2, 2, 2);
  return !!geometry;
};
