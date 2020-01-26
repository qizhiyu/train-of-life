import * as THREE from 'three';
import { loadRail as addRail } from './rail';
import { setupCamera } from './camera';

// let camera, scene, renderer;
// let geometry, material, mesh;

{
  init();
  animate();
}

const getContainer = () => document.querySelector('#container');
const addRoom = (scene: THREE.Scene): void => {};

const setupScene = () => {
  // create a Scene
  const scene = new THREE.Scene();

  // Set the background color
  scene.background = new THREE.Color('skyblue');

  addRoom(scene);
  addRail(scene);
  // addLocomotive(scene);

  // loadBridge();
  // loadVillages();
  // loadForest();

  return scene;
};

function init() {
  console.log('Start initializing at', new Date());
  const scene = setupScene();

  const camera = setupCamera();
  if (!camera) return;

  render(scene, camera);
}

const render = (scene: THREE.Scene, camera: THREE.PerspectiveCamera) => {
  console.log('Start rendering at', new Date());
  const container = getContainer();
  if (!container) return;

  // create the renderer
  const renderer = new THREE.WebGLRenderer();

  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // add the automatically created <canvas> element to the page
  container.appendChild(renderer.domElement);

  // render, or 'create a still image', of the scene
  renderer.render(scene, camera);
};

function animate() {
  return;

  // requestAnimationFrame(animate);

  // mesh.rotation.x += 0.01;
  // mesh.rotation.y += 0.02;

  // renderer.render(scene, camera);
}
