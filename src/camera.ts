import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
/**
 * Set a camera at 0, 0, 10
 */
export const setupCamera = (container: Element): THREE.PerspectiveCamera => {
  const fov = 35; // AKA Field of View

  const aspect = container.clientWidth / container.clientHeight;

  const near = 0.1; // the near clipping plane
  const far = 100; // the far clipping plane

  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.set(0, 2, 0.1);
  camera.lookAt(3, 0, 3);

  return camera;
};
