import * as THREE from 'three';
import { loadRail as addRail } from './rail';
import { setupCamera } from './camera';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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
  private _controls: OrbitControls;
  private _camera: THREE.Camera;

  constructor(container: Element) {
    this._container = container;

    this._renderer = new THREE.WebGLRenderer();
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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
  const controls = new OrbitControls(camera, domElement);
  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.0;
  controls.panSpeed = 1.0;
  controls.enabled = true;
  return controls;
};

const addRoom = (scene: THREE.Scene): void => {
  // add spotlight for the shadows
  const spotLight = new THREE.SpotLight('white', 1, 50, Math.PI / 6);

  // spotLight.target = cube;
  spotLight.visible = true;
  spotLight.position.set(1, 0.1, 1);
  spotLight.lookAt(2, 0.1, 1);
  spotLight.castShadow = true;
  scene.add(spotLight);

  const geometry = new THREE.BoxBufferGeometry(6, 4, 6);

  // var geometry = new THREE.PlaneGeometry(60, 20);
  const cubeMaterial = new THREE.MeshLambertMaterial({
    color: 'darkgray',
    side: THREE.DoubleSide,
  });
  const cube = new THREE.Mesh(geometry, cubeMaterial);
  // cube.position.set(0, -1, 0);
  // cube.rotation.x = -Math.PI * 0.5;

  cube.position.set(3, 2, 3);
  // cube.position.set(-0.1, -0.1, -0.1);
  cube.receiveShadow = true;
  cube.castShadow = true;

  scene.add(cube);

  // const material = new THREE.MeshPhongMaterial({
  //   color: 0x4080ff,
  //   dithering: true,
  // });

  // var box = new THREE.BoxBufferGeometry(3, 1, 2);

  // var mesh = new THREE.Mesh(box, material);
  // mesh.position.set(0, 2, 0);
  // mesh.castShadow = true;
  // scene.add(mesh);

  // var spotLightHelper = new THREE.SpotLightHelper(spotLight);
  // scene.add(spotLightHelper);
  // const ambientLight = new THREE.AmbientLight('white');
  // scene.add(ambientLight);
};

const setupScene = () => {
  // create a Scene
  const scene = new THREE.Scene();

  // Set the background color
  scene.background = new THREE.Color('skyblue');
  const axes = new THREE.AxesHelper(6);
  scene.add(axes);

  addRoom(scene);
  addRail(scene);
  // addLocomotive(scene);

  // loadBridge();
  // loadVillages();
  // loadForest();

  return scene;
};
