import * as THREE from 'three/src/Three';
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
    this._renderer.shadowMap.type = THREE.PCFShadowMap;

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
  for (let s = Side.Bottom; s <= Side.Right; s++) {
    const cube = createWall(s);
    scene.add(cube);
  }

  // const material = new THREE.MeshPhongMaterial({
  //   color: 0x4080ff,
  //   dithering: true,
  // });

  // var box = new THREE.BoxBufferGeometry(3, 1, 2);

  // var mesh = new THREE.Mesh(box, material);
  // mesh.position.set(0, 2, 0);
  // mesh.castShadow = true;
  // scene.add(mesh);

  // const ambientLight = new THREE.AmbientLight('white');
  // scene.add(ambientLight);
};

const setupScene = () => {
  // create a Scene
  const scene = new THREE.Scene();

  // Set the background color
  scene.background = new THREE.Color('skyblue');
  const axes = new THREE.AxesHelper(30);
  scene.add(axes);

  // add spotlight for the shadows
  addLight(scene);
  addRoom(scene);
  addRail(scene);
  // addLocomotive(scene);

  addHouse(scene);

  // loadBridge();
  // loadVillages();
  // loadForest();

  return scene;
};

const addHouse = (scene: THREE.Scene) => {
  const box = new THREE.BoxBufferGeometry(3, 1, 1);
  const material = new THREE.MeshPhongMaterial({
    color: 'red',
    dithering: true,
  });
  var mesh = new THREE.Mesh(box, material);
  mesh.position.set(6, 0.5, 2);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
};

enum Side {
  Bottom,
  Front,
  Rear,
  Left,
  Right,
}

function addLight(scene: THREE.Scene) {
  // let spotLight = new THREE.SpotLight('white', 1, 50, Math.PI / 6);
  // spotLight.visible = true;
  // spotLight.position.set(5, 5, 4);
  // spotLight.lookAt(6, 0.5, 2);
  // spotLight.castShadow = true;
  // scene.add(spotLight);

  let spotLight = new THREE.SpotLight('white', 1, 50, Math.PI / 6);
  spotLight.visible = true;
  spotLight.position.set(1, 0.2, 4);
  spotLight.lookAt(12, 0.2, 4);
  spotLight.castShadow = true;
  scene.add(spotLight);
  // var spotLightHelper = new THREE.SpotLightHelper(spotLight);
  // scene.add(spotLightHelper);
}

function createWall(side: Side) {
  var geometry = new THREE.PlaneGeometry(20, 20);
  const material = new THREE.MeshLambertMaterial({
    color: 'white',
    side: THREE.DoubleSide,
  });

  const wall = new THREE.Mesh(geometry, material);
  wall.receiveShadow = true;

  switch (side) {
    case Side.Bottom:
      wall.position.set(10, 0, 10);
      wall.rotation.x = -Math.PI * 0.5;
      break;
    case Side.Front:
      wall.position.set(10, 10, 20);
      break;
    case Side.Rear:
      wall.position.set(10, 10, 0);
      break;
    case Side.Left:
      wall.position.set(0, 10, 10);
      wall.rotation.y = Math.PI * 0.5;
      break;
    case Side.Right:
      wall.position.set(20, 10, 10);
      wall.rotation.y = Math.PI * 0.5;
      break;
  }

  return wall;
}
