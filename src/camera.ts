import * as THREE from 'three';

export const setupCamera = (): THREE.PerspectiveCamera | undefined => {
  const fov = 35; // AKA Field of View
  const container = document.querySelector('#container');
  if (!container) return undefined;

  const aspect = container.clientWidth / container.clientHeight;

  const near = 0.1; // the near clipping plane
  const far = 100; // the far clipping plane

  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.set(0, 0, 10);
  return camera;
};
