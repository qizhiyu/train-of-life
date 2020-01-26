import * as THREE from 'three';

export const loadRail = () => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('skyblue');

  const geometry = new THREE.CircleBufferGeometry(2, 2, 2);
  return !!geometry;
};
