import * as THREE from 'three';
import { loadRail as addRail } from './rail';
import { setupCamera } from './camera';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';

window.onload = () => {
  const container = getContainer();
  if (!container) return;

  const scene = new TrainScene(container);
  scene.init();
  scene.animate();
};

const getContainer = () => document.querySelector('#container');

class TrainScene {
  private _scene: THREE.Scene;
  private _renderer: THREE.WebGLRenderer;
  private _container: Element;
  private _controls: TrackballControls;
  private _camera: THREE.Camera;

  constructor(container: Element) {
    this._container = container;

    this._renderer = new THREE.WebGLRenderer();

    // create the renderer
    this._renderer.setSize(
      this._container.clientWidth,
      this._container.clientHeight,
    );
    this._renderer.setPixelRatio(window.devicePixelRatio);
    // add the automatically created <canvas> element to the page
    this._container.appendChild(this._renderer.domElement);

    this._scene = setupScene();

    this._camera = setupCamera(this._container);
    this._controls = setupControls(this._camera, this._renderer.domElement);

    this.init = this.init.bind(this);
    this.animate = this.animate.bind(this);
  }

  init() {
    console.log('Start initializing at', new Date());
  }

  animate() {
    this._controls.update();
    requestAnimationFrame(this.animate);

    this._renderer.render(this._scene, this._camera);
  }
}

const setupControls = (camera: THREE.Camera, domElement: HTMLCanvasElement) => {
  const controls = new TrackballControls(camera, domElement);
  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.0;
  controls.panSpeed = 1.0;
  controls.staticMoving = true;
  controls.keys = [65, 83, 68];
  controls.enabled = true;
  return controls;
};

const addRoom = (scene: THREE.Scene): void => {
  // var cubeGeometry = new THREE.BoxGeometry(4, 3, 4);
  var planeGeometry = new THREE.PlaneGeometry(60, 20);

  var cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
  var cube = new THREE.Mesh(planeGeometry, cubeMaterial);

  cube.position.set(-0.1, -0.1, -0.1);
  cube.receiveShadow = true;
  // scene.add(cube);

  // add spotlight for the shadows
  var spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(1, 0.1, 1);
  spotLight.castShadow = true;
  scene.add(spotLight);
};

const setupScene = () => {
  // create a Scene
  const scene = new THREE.Scene();

  // Set the background color
  scene.background = new THREE.Color('skyblue');
  var axes = new THREE.AxesHelper(20);
  scene.add(axes);

  addRoom(scene);
  addRail(scene);
  // addLocomotive(scene);

  // loadBridge();
  // loadVillages();
  // loadForest();

  return scene;
};
