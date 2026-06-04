import * as THREE from 'three';

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
    const sideBeams: Array<[start: Point3, end: Point3, radius: number]> = [
      [[-0.39, 0.08, zSide], [-0.39, 0.28, zSide], 0.012],
      [[0.39, 0.08, zSide], [0.39, 0.28, zSide], 0.012],
      [[-0.39, 0.28, zSide], [0.39, 0.28, zSide], 0.012],
      [[-0.39, 0.08, zSide], [0.39, 0.28, zSide], 0.011],
      [[-0.39, 0.28, zSide], [0.39, 0.08, zSide], 0.011],
    ];

    for (const [start, end, radius] of sideBeams) {
      addBeamBetween(bridge, material, start, end, radius);
    }
  }

  addBeamBetween(bridge, material, [-0.39, 0.28, -frameZ], [-0.39, 0.28, frameZ], 0.009);
  addBeamBetween(bridge, material, [0.39, 0.28, -frameZ], [0.39, 0.28, frameZ], 0.009);

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

function addBeamBetween(
  group: THREE.Group,
  material: THREE.Material,
  start: Point3,
  end: Point3,
  radius: number,
) {
  addBeam(
    group,
    material,
    new THREE.Vector3(...start),
    new THREE.Vector3(...end),
    radius,
  );
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
