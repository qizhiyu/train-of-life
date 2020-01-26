import * as THREE from 'three';
import { loadRail } from './rail';
import { setupCamera } from './camera';

// let camera, scene, renderer;
// let geometry, material, mesh;

{
  console.log('Started at', new Date());
  init();
  animate();
}

const loadRoom = (): void => {
  //const container = document.querySelector('#container');

  // create a Scene
  const scene = new THREE.Scene();

  // Set the background color
  scene.background = new THREE.Color('skyblue');
};

function init() {
  loadRoom();
  loadRail();
  // loadBridge();
  // loadVillages();
  // loadForest();

  // setupTrain({ speed: 1.0, withLight: true, forward: true });

  setupCamera();
}

function animate() {
  return;

  // requestAnimationFrame(animate);

  // mesh.rotation.x += 0.01;
  // mesh.rotation.y += 0.02;

  // renderer.render(scene, camera);
}
