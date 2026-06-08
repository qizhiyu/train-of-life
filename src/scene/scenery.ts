import * as THREE from 'three';
import { TRACK_DEPTH } from './constants';

type Point3 = [x: number, y: number, z: number];

export function createScenery() {
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

  addNailForest(group, silhouette, -1.35, -0.72, SMALL_FOREST);
  addNailForest(group, silhouette, -1.55, -1.28, LARGE_FOREST);
  addNailForest(group, silhouette, -1, 0.72, SMALL_FOREST);
  addNailForest(group, silhouette, -0.82, 1.28, LARGE_FOREST);
  addRoundBarn(group, silhouette, -1.58, 0.35);
  addSteelBridge(group, steel, 0.65, TRACK_DEPTH / 2);
  addFarmhouse(group, silhouette, 1.42, 0.42);
  addWaterTower(group, silhouette, 0.2, 0.2);
  addFenceAndPoles(group, silhouette, 1.65, -0.35);

  return group;
}

// [xOffset, zOffset, height]
type NailPosition = [number, number, number];

const SMALL_FOREST: NailPosition[] = [
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

const LARGE_FOREST: NailPosition[] = [
  [-0.35, -0.09, 0.12],
  [-0.30, 0.07, 0.14],
  [-0.26, -0.11, 0.115],
  [-0.21, 0.03, 0.13],
  [-0.17, -0.07, 0.145],
  [-0.12, 0.10, 0.11],
  [-0.08, -0.04, 0.13],
  [-0.03, 0.08, 0.125],
  [0.01, -0.10, 0.14],
  [0.06, 0.05, 0.108],
  [0.10, -0.02, 0.12],
  [0.15, 0.11, 0.135],
  [0.19, -0.08, 0.115],
  [0.24, 0.04, 0.14],
  [0.28, -0.11, 0.13],
  [0.33, 0.07, 0.12],
  [0.36, -0.05, 0.145],
  [-0.14, -0.09, 0.12],
  [0.08, 0.09, 0.11],
];

function addNailForest(
  group: THREE.Group,
  material: THREE.Material,
  centerX: number,
  centerZ: number,
  positions: NailPosition[],
) {

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

  const halfSpan = 0.39;
  const frameZ = 0.09;
  const chordBottom = 0.016;
  const chordTop = 0.2;
  const postXs = [-halfSpan, -halfSpan / 2, 0, halfSpan / 2, halfSpan];
  const chordSize = 0.014;
  const vertSize = 0.012;
  const diagSize = 0.010;

  const deck = new THREE.Mesh(new THREE.BoxGeometry(2 * halfSpan, 0.012, 2 * frameZ), material);
  deck.position.y = 0.006;
  deck.castShadow = true;
  deck.receiveShadow = true;
  bridge.add(deck);

  for (const zSide of [-frameZ, frameZ]) {
    // Bottom and top chord segments
    for (let i = 0; i < postXs.length - 1; i += 1) {
      addSquareBeam(bridge, material, [postXs[i], chordBottom, zSide], [postXs[i + 1], chordBottom, zSide], chordSize);
      addSquareBeam(bridge, material, [postXs[i], chordTop, zSide], [postXs[i + 1], chordTop, zSide], chordSize);
    }
    // Vertical posts
    for (const px of postXs) {
      addSquareBeam(bridge, material, [px, chordBottom, zSide], [px, chordTop, zSide], vertSize);
    }
    // 4 X crosses
    for (let i = 0; i < postXs.length - 1; i += 1) {
      addSquareBeam(bridge, material, [postXs[i], chordBottom, zSide], [postXs[i + 1], chordTop, zSide], diagSize);
      addSquareBeam(bridge, material, [postXs[i], chordTop, zSide], [postXs[i + 1], chordBottom, zSide], diagSize);
    }
  }

  // Top face: cross beams at each post, 4 X crosses along the span
  for (const px of postXs) {
    addSquareBeam(bridge, material, [px, chordTop, -frameZ], [px, chordTop, frameZ], vertSize);
  }
  for (let i = 0; i < postXs.length - 1; i += 1) {
    addSquareBeam(bridge, material, [postXs[i], chordTop, -frameZ], [postXs[i + 1], chordTop, frameZ], diagSize);
    addSquareBeam(bridge, material, [postXs[i], chordTop, frameZ], [postXs[i + 1], chordTop, -frameZ], diagSize);
  }

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

function addSquareBeam(
  group: THREE.Group,
  material: THREE.Material,
  start: Point3,
  end: Point3,
  size: number,
) {
  const s = new THREE.Vector3(...start);
  const e = new THREE.Vector3(...end);
  const length = s.distanceTo(e);
  const beam = new THREE.Mesh(new THREE.BoxGeometry(size, length, size), material);
  beam.position.addVectors(s, e).multiplyScalar(0.5);
  beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), e.clone().sub(s).normalize());
  beam.castShadow = true;
  beam.receiveShadow = true;
  group.add(beam);
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
