import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Missing #app mount point');
}

app.innerHTML = [
  '<section class="scene-shell"></section>',
  '<div class="scene-title">',
  '<strong>Train of Life</strong>',
  '</div>',
].join('');

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

const ROOM_WIDTH = 6;
const ROOM_DEPTH = 4;
const ROOM_HEIGHT = 3;
const TRACK_WIDTH = 4;
const TRACK_DEPTH = 2;
const TRACK_GAUGE = 0.075;
const TRACK_CORNER_RADIUS = 0.28;
const TRAIN_HEIGHT = 0.05;
const TRAIN_FRONT_Z = TRACK_DEPTH / 2;

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
  private readonly cameraTarget = new THREE.Vector3(0, 0.55, 0);
  private frameId = 0;

  constructor(private readonly container: HTMLElement) {
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.01, 20);
    this.camera.position.set(2.62, 1.62, 1.62);
    this.camera.lookAt(0, 0.45, 0);

    this.renderer.setClearColor(0x020202, 1);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.95;

    this.container.append(this.renderer.domElement);

    const objects = this.buildScene();
    this.train = objects.train;
    this.cameraTarget.copy(objects.cameraTarget);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.target.copy(this.cameraTarget);
    this.controls.minDistance = 0.25;
    this.controls.maxDistance = 6;
    this.controls.maxPolarAngle = Math.PI * 0.49;

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
    this.scene.fog = new THREE.FogExp2(0x020202, 0.18);

    this.scene.add(createRoom());
    this.scene.add(createLoopTrack());
    this.scene.add(createScenery());

    const train = createTrain();
    this.scene.add(train.root);
    this.scene.add(train.lampTarget);

    const ambientScatter = new THREE.AmbientLight(0x4a3a28, 0.04);
    const ceilingBounce = new THREE.HemisphereLight(0x8b7758, 0x080604, 0.14);
    this.scene.add(ambientScatter, ceilingBounce);

    return {
      train,
      cameraTarget: new THREE.Vector3(0, 0.45, 0),
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
    const cycle = 14;
    const phase = (elapsed % cycle) / cycle;
    const x = THREE.MathUtils.lerp(-TRACK_WIDTH / 2 + 0.35, TRACK_WIDTH / 2 - 0.35, phase);
    const sway = Math.sin(elapsed * 8.2) * 0.0018;

    this.train.root.position.set(x, 0.028 + sway, TRAIN_FRONT_Z);
    this.train.lampTarget.position.set(x + 1.85, 0.13, TRAIN_FRONT_Z - 0.55);
    this.train.lamp.intensity = 28 + Math.sin(elapsed * 9.4) * 1.4;
    this.train.lamp.angle = 0.72;

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(this.animate);
  }
}

function createRoom() {
  const group = new THREE.Group();
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x18140f,
    roughness: 0.96,
    metalness: 0,
  });

  const floor = createPlane(ROOM_WIDTH, ROOM_DEPTH, wallMaterial);
  floor.name = 'floor';
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, 0);
  group.add(floor);

  const backWall = createPlane(ROOM_WIDTH, ROOM_HEIGHT, wallMaterial);
  backWall.name = 'back wall';
  backWall.position.set(0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2);
  group.add(backWall);

  const leftWall = createPlane(ROOM_DEPTH, ROOM_HEIGHT, wallMaterial);
  leftWall.name = 'left wall';
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0);
  group.add(leftWall);

  const rightWall = createPlane(ROOM_DEPTH, ROOM_HEIGHT, wallMaterial);
  rightWall.name = 'right wall';
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0);
  group.add(rightWall);

  const ceiling = createPlane(ROOM_WIDTH, ROOM_DEPTH, wallMaterial);
  ceiling.name = 'ceiling';
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, ROOM_HEIGHT, 0);
  group.add(ceiling);

  return group;
}

function createPlane(width: number, height: number, material: THREE.Material) {
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  plane.receiveShadow = true;
  return plane;
}

function createLoopTrack() {
  const group = new THREE.Group();
  const railMaterial = new THREE.MeshStandardMaterial({
    color: 0x3b3830,
    roughness: 0.52,
    metalness: 0.35,
  });
  const tieMaterial = new THREE.MeshStandardMaterial({
    color: 0x261a12,
    roughness: 0.84,
  });

  for (const offset of [-TRACK_GAUGE / 2, TRACK_GAUGE / 2]) {
    const points = createRoundedRectanglePoints(
      TRACK_WIDTH + offset * 2,
      TRACK_DEPTH + offset * 2,
      TRACK_CORNER_RADIUS,
      0.021,
    );
    const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal');
    const rail = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 0.006, 8, true), railMaterial);
    rail.castShadow = true;
    rail.receiveShadow = true;
    group.add(rail);
  }

  addTrackTies(group, tieMaterial);
  return group;
}

function createRoundedRectanglePoints(width: number, depth: number, radius: number, y: number) {
  const points: THREE.Vector3[] = [];
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const segments = 12;

  addLinePoints(points, -halfWidth + radius, halfDepth, halfWidth - radius, halfDepth, y, segments);
  addArcPoints(points, halfWidth - radius, halfDepth - radius, radius, Math.PI / 2, 0, y, segments);
  addLinePoints(points, halfWidth, halfDepth - radius, halfWidth, -halfDepth + radius, y, segments);
  addArcPoints(points, halfWidth - radius, -halfDepth + radius, radius, 0, -Math.PI / 2, y, segments);
  addLinePoints(points, halfWidth - radius, -halfDepth, -halfWidth + radius, -halfDepth, y, segments);
  addArcPoints(points, -halfWidth + radius, -halfDepth + radius, radius, -Math.PI / 2, -Math.PI, y, segments);
  addLinePoints(points, -halfWidth, -halfDepth + radius, -halfWidth, halfDepth - radius, y, segments);
  addArcPoints(points, -halfWidth + radius, halfDepth - radius, radius, Math.PI, Math.PI / 2, y, segments);

  return points;
}

function addLinePoints(
  points: THREE.Vector3[],
  x1: number,
  z1: number,
  x2: number,
  z2: number,
  y: number,
  segments: number,
) {
  for (let index = 0; index < segments; index += 1) {
    const t = index / segments;
    points.push(new THREE.Vector3(THREE.MathUtils.lerp(x1, x2, t), y, THREE.MathUtils.lerp(z1, z2, t)));
  }
}

function addArcPoints(
  points: THREE.Vector3[],
  centerX: number,
  centerZ: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  y: number,
  segments: number,
) {
  for (let index = 0; index < segments; index += 1) {
    const t = index / segments;
    const angle = THREE.MathUtils.lerp(startAngle, endAngle, t);
    points.push(new THREE.Vector3(centerX + Math.cos(angle) * radius, y, centerZ + Math.sin(angle) * radius));
  }
}

function addTrackTies(group: THREE.Group, material: THREE.Material) {
  const tieGeometry = new THREE.BoxGeometry(0.018, 0.008, 0.145);
  const sideTieGeometry = new THREE.BoxGeometry(0.145, 0.008, 0.018);
  const halfWidth = TRACK_WIDTH / 2;
  const halfDepth = TRACK_DEPTH / 2;

  for (let index = 0; index < 24; index += 1) {
    const x = THREE.MathUtils.lerp(-halfWidth + 0.35, halfWidth - 0.35, index / 23);
    addTie(group, tieGeometry, material, x, halfDepth, 0);
    addTie(group, tieGeometry, material, x, -halfDepth, 0);
  }

  for (let index = 0; index < 12; index += 1) {
    const z = THREE.MathUtils.lerp(-halfDepth + 0.35, halfDepth - 0.35, index / 11);
    addTie(group, sideTieGeometry, material, -halfWidth, z, 0);
    addTie(group, sideTieGeometry, material, halfWidth, z, 0);
  }
}

function addTie(
  group: THREE.Group,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  x: number,
  z: number,
  rotationY: number,
) {
  const tie = new THREE.Mesh(geometry, material);
  tie.position.set(x, 0.008, z);
  tie.rotation.y = rotationY;
  tie.castShadow = true;
  tie.receiveShadow = true;
  group.add(tie);
}

function createTrain(): TrainRig {
  const root = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x252019,
    roughness: 0.68,
    metalness: 0.06,
  });
  const lampMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd59a,
    emissive: 0xffa12a,
    emissiveIntensity: 2.9,
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.13, TRAIN_HEIGHT * 0.58, 0.045), bodyMaterial);
  body.position.y = TRAIN_HEIGHT * 0.42;
  body.castShadow = true;
  body.receiveShadow = true;
  root.add(body);

  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.043, TRAIN_HEIGHT * 0.62, 0.043), bodyMaterial);
  cab.position.set(-0.032, TRAIN_HEIGHT * 0.78, 0);
  cab.castShadow = true;
  cab.receiveShadow = true;
  root.add(cab);

  const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.007, 0.025, 12), bodyMaterial);
  chimney.position.set(0.035, TRAIN_HEIGHT * 1.03, 0);
  chimney.castShadow = true;
  root.add(chimney);

  const lampFace = new THREE.Mesh(new THREE.CircleGeometry(0.011, 24), lampMaterial);
  lampFace.position.set(0.068, TRAIN_HEIGHT * 0.72, 0);
  lampFace.rotation.y = Math.PI / 2;
  root.add(lampFace);

  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: 0x12100d,
    roughness: 0.5,
    metalness: 0.18,
  });
  const wheelGeometry = new THREE.CylinderGeometry(0.009, 0.009, 0.006, 16);

  for (const x of [-0.038, 0.036]) {
    for (const z of [-0.026, 0.026]) {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.position.set(x, 0.012, z);
      wheel.rotation.x = Math.PI / 2;
      wheel.castShadow = true;
      root.add(wheel);
    }
  }

  const lamp = new THREE.SpotLight(0xffc475, 28, 5.6, 0.72, 0.62, 1.1);
  lamp.position.set(0.07, TRAIN_HEIGHT * 0.72, 0);
  lamp.castShadow = true;
  lamp.shadow.mapSize.set(4096, 4096);
  lamp.shadow.camera.near = 0.01;
  lamp.shadow.camera.far = 6;
  lamp.shadow.bias = -0.00001;
  lamp.shadow.normalBias = 0.001;
  root.add(lamp);

  const lampTarget = new THREE.Object3D();
  lampTarget.position.set(1.85, 0.13, TRAIN_FRONT_Z - 0.55);
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
    color: 0x100d09,
    roughness: 0.88,
  });
  const steel = new THREE.MeshStandardMaterial({
    color: 0x1a1d1b,
    roughness: 0.62,
    metalness: 0.36,
  });

  addNailForest(group, silhouette, -1.35, -0.72);
  addRoundBarn(group, silhouette, -1.58, 0.35);
  addSteelBridge(group, steel, 0.65, 0.83);
  addFarmhouse(group, silhouette, 1.42, 0.42);
  addWaterTower(group, silhouette, 0.2, 0.2);
  addFenceAndPoles(group, silhouette, 1.65, -0.35);

  return group;
}

function addNailForest(group: THREE.Group, material: THREE.Material, centerX: number, centerZ: number) {
  const positions = [
    [-0.16, -0.08, 0.11],
    [-0.1, 0.02, 0.14],
    [-0.04, -0.11, 0.12],
    [0.02, 0.07, 0.15],
    [0.08, -0.03, 0.1],
    [0.14, 0.09, 0.13],
    [0.17, -0.12, 0.145],
    [-0.18, 0.12, 0.125],
    [0.0, -0.01, 0.108],
  ];

  for (const [xOffset, zOffset, height] of positions) {
    const nail = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, height, 10), material);
    nail.position.set(centerX + xOffset, height / 2, centerZ + zOffset);
    nail.castShadow = true;
    nail.receiveShadow = true;
    group.add(nail);
  }
}

function addRoundBarn(group: THREE.Group, material: THREE.Material, x: number, z: number) {
  const wallHeight = 0.145;
  const barnWall = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, wallHeight, 28), material);
  barnWall.position.set(x, wallHeight / 2, z);
  barnWall.castShadow = true;
  barnWall.receiveShadow = true;
  group.add(barnWall);

  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.09, 28), material);
  cap.position.set(x, wallHeight + 0.045, z);
  cap.castShadow = true;
  group.add(cap);
}

function addSteelBridge(group: THREE.Group, material: THREE.Material, x: number, z: number) {
  const bridge = new THREE.Group();
  bridge.position.set(x, 0, z);

  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.025, 0.19), material);
  deck.position.y = 0.075;
  deck.castShadow = true;
  deck.receiveShadow = true;
  bridge.add(deck);

  const frameZ = 0.12;
  for (const zSide of [-frameZ, frameZ]) {
    addBeam(bridge, material, new THREE.Vector3(-0.39, 0.08, zSide), new THREE.Vector3(-0.39, 0.28, zSide), 0.007);
    addBeam(bridge, material, new THREE.Vector3(0.39, 0.08, zSide), new THREE.Vector3(0.39, 0.28, zSide), 0.007);
    addBeam(bridge, material, new THREE.Vector3(-0.39, 0.28, zSide), new THREE.Vector3(0.39, 0.28, zSide), 0.007);
    addBeam(bridge, material, new THREE.Vector3(-0.39, 0.08, zSide), new THREE.Vector3(0.39, 0.28, zSide), 0.005);
    addBeam(bridge, material, new THREE.Vector3(-0.39, 0.28, zSide), new THREE.Vector3(0.39, 0.08, zSide), 0.005);
  }

  addBeam(bridge, material, new THREE.Vector3(-0.39, 0.28, -frameZ), new THREE.Vector3(-0.39, 0.28, frameZ), 0.005);
  addBeam(bridge, material, new THREE.Vector3(0.39, 0.28, -frameZ), new THREE.Vector3(0.39, 0.28, frameZ), 0.005);

  group.add(bridge);
}

function addFarmhouse(group: THREE.Group, material: THREE.Material, x: number, z: number) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.16), material);
  body.position.set(x, 0.06, z);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.075, 4), material);
  roof.position.set(x, 0.158, z);
  roof.rotation.y = Math.PI / 4;
  roof.scale.z = 0.72;
  roof.castShadow = true;
  group.add(roof);
}

function addWaterTower(group: THREE.Group, material: THREE.Material, x: number, z: number) {
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 18), material);
  tank.position.set(x, 0.225, z);
  tank.castShadow = true;
  tank.receiveShadow = true;
  group.add(tank);

  for (const xOffset of [-0.045, 0.045]) {
    for (const zOffset of [-0.045, 0.045]) {
      addBeam(
        group,
        material,
        new THREE.Vector3(x + xOffset * 0.65, 0.02, z + zOffset * 0.65),
        new THREE.Vector3(x + xOffset, 0.19, z + zOffset),
        0.004,
      );
    }
  }
}

function addFenceAndPoles(group: THREE.Group, material: THREE.Material, x: number, z: number) {
  for (let index = 0; index < 6; index += 1) {
    const postX = x - index * 0.11;
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.11, 0.014), material);
    post.position.set(postX, 0.055, z);
    post.castShadow = true;
    group.add(post);

    if (index < 5) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.012, 0.012), material);
      rail.position.set(postX - 0.055, 0.078, z);
      rail.castShadow = true;
      group.add(rail);
    }
  }

  for (const poleX of [x - 0.05, x - 0.45]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.2, 8), material);
    pole.position.set(poleX, 0.1, z - 0.24);
    pole.castShadow = true;
    group.add(pole);

    const crossbar = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.01, 0.01), material);
    crossbar.position.set(poleX, 0.175, z - 0.24);
    crossbar.castShadow = true;
    group.add(crossbar);
  }
}

function addBeam(
  group: THREE.Group,
  material: THREE.Material,
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
) {
  const length = start.distanceTo(end);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 8), material);
  const midpoint = start.clone().lerp(end, 0.5);
  const direction = end.clone().sub(start).normalize();
  beam.position.copy(midpoint);
  beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  beam.castShadow = true;
  beam.receiveShadow = true;
  group.add(beam);
}

const experience = new TrainOfLifeScene(shell);
experience.start();
