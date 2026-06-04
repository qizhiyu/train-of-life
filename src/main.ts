import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Missing #app mount point');
}

app.innerHTML = `
  <section class="scene-shell"></section>
  <div class="scene-title">
    <strong>Train of Life</strong>
  </div>
`;

const shell = app.querySelector<HTMLElement>('.scene-shell');

if (!shell) {
  throw new Error('Missing scene shell');
}

type TrainRig = {
  root: THREE.Group;
  lamp: THREE.SpotLight;
  lampTarget: THREE.Object3D;
};

type SceneObjects = {
  train: TrainRig;
  cameraTarget: THREE.Vector3;
};

class TrainOfLifeScene {
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
  });
  private readonly controls: OrbitControls;
  private readonly clock = new THREE.Clock();
  private readonly train: TrainRig;
  private readonly cameraTarget = new THREE.Vector3(0, 1.4, -2.6);
  private frameId = 0;

  constructor(private readonly container: HTMLElement) {
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
    this.camera.position.set(6.8, 4.6, 8.5);

    this.renderer.setClearColor(0x020202, 1);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.4;

    this.container.append(this.renderer.domElement);

    const objects = this.buildScene();
    this.train = objects.train;
    this.cameraTarget.copy(objects.cameraTarget);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.target.copy(this.cameraTarget);
    this.controls.minDistance = 4;
    this.controls.maxDistance = 18;
    this.controls.maxPolarAngle = Math.PI * 0.48;

    this.resize = this.resize.bind(this);
    this.animate = this.animate.bind(this);

    window.addEventListener('resize', this.resize);
    this.resize();
  }

  start() {
    this.animate();
  }

  dispose() {
    window.removeEventListener('resize', this.resize);
    cancelAnimationFrame(this.frameId);
    this.controls.dispose();
    this.renderer.dispose();
  }

  private buildScene(): SceneObjects {
    this.scene.background = new THREE.Color(0x020202);
    this.scene.fog = new THREE.FogExp2(0x020202, 0.055);

    const room = createRoom();
    this.scene.add(room);

    const rail = createRail();
    this.scene.add(rail);

    const scenery = createScenery();
    this.scene.add(scenery);

    const train = createTrain();
    this.scene.add(train.root);
    this.scene.add(train.lampTarget);

    const lowGlow = new THREE.HemisphereLight(0x3f4855, 0x050402, 0.018);
    this.scene.add(lowGlow);

    return {
      train,
      cameraTarget: new THREE.Vector3(0, 1.2, -2.6),
    };
  }

  private resize() {
    const { clientWidth, clientHeight } = this.container;
    const width = Math.max(clientWidth, 1);
    const height = Math.max(clientHeight, 1);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private animate() {
    const elapsed = this.clock.getElapsedTime();
    const railLength = 12.4;
    const cycle = 13.5;
    const phase = (elapsed % cycle) / cycle;
    const x = THREE.MathUtils.lerp(-railLength / 2, railLength / 2, phase);
    const sway = Math.sin(elapsed * 3.2) * 0.025;

    this.train.root.position.set(x, 0.38 + sway, 0);
    this.train.lampTarget.position.set(x + 4.2, 1.08, -4.6);
    this.train.lamp.intensity = 42 + Math.sin(elapsed * 8.8) * 2.6;
    this.train.lamp.angle = 0.36 + Math.sin(elapsed * 1.7) * 0.018;

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(this.animate);
  }
}

function createRoom() {
  const group = new THREE.Group();
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x11100d,
    roughness: 0.93,
    metalness: 0,
  });

  const floor = createPlane(15, 10, wallMaterial);
  floor.name = 'floor';
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, -1.7);
  group.add(floor);

  const backWall = createPlane(15, 5.4, wallMaterial);
  backWall.name = 'back wall';
  backWall.position.set(0, 2.7, -6.7);
  group.add(backWall);

  const leftWall = createPlane(10, 5.4, wallMaterial);
  leftWall.name = 'left wall';
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-7.5, 2.7, -1.7);
  group.add(leftWall);

  const rightWall = createPlane(10, 5.4, wallMaterial);
  rightWall.name = 'right wall';
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(7.5, 2.7, -1.7);
  group.add(rightWall);

  return group;
}

function createPlane(width: number, height: number, material: THREE.Material) {
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  plane.receiveShadow = true;
  return plane;
}

function createRail() {
  const group = new THREE.Group();
  const railMaterial = new THREE.MeshStandardMaterial({
    color: 0x3d3931,
    roughness: 0.55,
    metalness: 0.25,
  });
  const tieMaterial = new THREE.MeshStandardMaterial({
    color: 0x271b15,
    roughness: 0.8,
  });

  const railGeometry = new THREE.BoxGeometry(12.8, 0.045, 0.055);
  const leftRail = new THREE.Mesh(railGeometry, railMaterial);
  leftRail.position.set(0, 0.08, -0.23);
  leftRail.castShadow = true;
  leftRail.receiveShadow = true;
  group.add(leftRail);

  const rightRail = leftRail.clone();
  rightRail.position.z = 0.23;
  group.add(rightRail);

  const tieGeometry = new THREE.BoxGeometry(0.08, 0.045, 0.82);
  for (let index = 0; index < 30; index += 1) {
    const tie = new THREE.Mesh(tieGeometry, tieMaterial);
    tie.position.set(-6.2 + index * 0.43, 0.045, 0);
    tie.castShadow = true;
    tie.receiveShadow = true;
    group.add(tie);
  }

  return group;
}

function createTrain(): TrainRig {
  const root = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x15110e,
    roughness: 0.62,
    metalness: 0.08,
  });
  const lampMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd184,
    emissive: 0xff9f2a,
    emissiveIntensity: 4.2,
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.54, 0.58), bodyMaterial);
  body.position.y = 0.34;
  body.castShadow = true;
  body.receiveShadow = true;
  root.add(body);

  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.52, 0.52), bodyMaterial);
  cab.position.set(-0.22, 0.78, 0);
  cab.castShadow = true;
  cab.receiveShadow = true;
  root.add(cab);

  const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.34, 18), bodyMaterial);
  chimney.position.set(0.28, 0.85, 0);
  chimney.castShadow = true;
  root.add(chimney);

  const lampFace = new THREE.Mesh(new THREE.CircleGeometry(0.14, 32), lampMaterial);
  lampFace.position.set(0.49, 0.56, 0);
  lampFace.rotation.y = Math.PI / 2;
  root.add(lampFace);

  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: 0x0d0b09,
    roughness: 0.45,
    metalness: 0.2,
  });
  const wheelGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 24);

  for (const x of [-0.28, 0.24]) {
    for (const z of [-0.31, 0.31]) {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.position.set(x, 0.16, z);
      wheel.rotation.x = Math.PI / 2;
      wheel.castShadow = true;
      root.add(wheel);
    }
  }

  const lamp = new THREE.SpotLight(0xffc978, 44, 15, 0.38, 0.82, 1.4);
  lamp.position.set(0.56, 0.58, 0);
  lamp.castShadow = true;
  lamp.shadow.mapSize.set(2048, 2048);
  lamp.shadow.camera.near = 0.1;
  lamp.shadow.camera.far = 18;
  lamp.shadow.bias = -0.00008;
  root.add(lamp);

  const lampTarget = new THREE.Object3D();
  lampTarget.position.set(4.2, 1.08, -4.6);
  lamp.target = lampTarget;

  return {
    root,
    lamp,
    lampTarget,
  };
}

function createScenery() {
  const group = new THREE.Group();
  const silhouette = new THREE.MeshStandardMaterial({
    color: 0x080705,
    roughness: 0.86,
  });

  addHouse(group, silhouette, -4.35, -2.05, 0.86, 0.74);
  addHouse(group, silhouette, -0.75, -2.45, 0.66, 0.58);
  addHouse(group, silhouette, 3.7, -2.0, 0.78, 0.8);
  addTree(group, silhouette, -5.7, -1.72, 1.18);
  addTree(group, silhouette, -3.2, -2.75, 0.94);
  addTree(group, silhouette, 1.48, -2.22, 1.32);
  addTree(group, silhouette, 5.45, -2.78, 1.05);
  addBridge(group, silhouette, 2.25, -1.48);

  return group;
}

function addHouse(
  group: THREE.Group,
  material: THREE.Material,
  x: number,
  z: number,
  width: number,
  height: number,
) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.28), material);
  body.position.set(x, height / 2, z);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(width * 0.62, height * 0.46, 4), material);
  roof.position.set(x, height + height * 0.22, z);
  roof.rotation.y = Math.PI / 4;
  roof.scale.z = 0.54;
  roof.castShadow = true;
  group.add(roof);
}

function addTree(
  group: THREE.Group,
  material: THREE.Material,
  x: number,
  z: number,
  height: number,
) {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.065, height * 0.58, 8), material);
  trunk.position.set(x, height * 0.29, z);
  trunk.castShadow = true;
  group.add(trunk);

  const crown = new THREE.Mesh(new THREE.ConeGeometry(height * 0.24, height * 0.72, 9), material);
  crown.position.set(x, height * 0.82, z);
  crown.castShadow = true;
  group.add(crown);
}

function addBridge(group: THREE.Group, material: THREE.Material, x: number, z: number) {
  const deck = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.1, 0.2), material);
  deck.position.set(x, 0.58, z);
  deck.castShadow = true;
  deck.receiveShadow = true;
  group.add(deck);

  for (const offset of [-0.62, 0.62]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.78, 0.16), material);
    post.position.set(x + offset, 0.35, z);
    post.castShadow = true;
    group.add(post);
  }

  const arch = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.032, 8, 32, Math.PI), material);
  arch.position.set(x, 0.56, z);
  arch.rotation.z = Math.PI;
  arch.scale.y = 0.52;
  arch.castShadow = true;
  group.add(arch);
}

const experience = new TrainOfLifeScene(shell);
experience.start();
