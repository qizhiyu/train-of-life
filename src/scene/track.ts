import * as THREE from 'three';
import { TRACK_CORNER_RADIUS, TRACK_DEPTH, TRACK_GAUGE, TRACK_WIDTH } from './constants';
import type { TrackSample } from './types';

export function createLoopTrack() {
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
    const curve = createTrackCurve(
      TRACK_WIDTH + offset * 2,
      TRACK_DEPTH + offset * 2,
      TRACK_CORNER_RADIUS + offset,
      0.021,
    );
    const rail = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 160, 0.006, 8, true),
      railMaterial,
    );
    rail.castShadow = true;
    rail.receiveShadow = true;
    group.add(rail);
  }

  addTrackTies(group, tieMaterial);
  return group;
}

export function getRoundedRectanglePerimeter(width: number, depth: number, radius: number) {
  return 2 * (width - 2 * radius) + 2 * (depth - 2 * radius) + Math.PI * 2 * radius;
}

export function sampleRoundedRectanglePath(
  distance: number,
  width: number,
  depth: number,
  radius: number,
  y: number,
): TrackSample {
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const straightX = width - radius * 2;
  const straightZ = depth - radius * 2;
  const arcLength = (Math.PI * radius) / 2;
  const perimeter = getRoundedRectanglePerimeter(width, depth, radius);
  let remaining = ((distance % perimeter) + perimeter) % perimeter;

  if (remaining <= straightX) {
    return createTrackSample(-halfWidth + radius + remaining, y, halfDepth, 1, 0);
  }
  remaining -= straightX;

  if (remaining <= arcLength) {
    return createArcSample(
      halfWidth - radius,
      halfDepth - radius,
      radius,
      Math.PI / 2 - remaining / radius,
      y,
    );
  }
  remaining -= arcLength;

  if (remaining <= straightZ) {
    return createTrackSample(halfWidth, y, halfDepth - radius - remaining, 0, -1);
  }
  remaining -= straightZ;

  if (remaining <= arcLength) {
    return createArcSample(halfWidth - radius, -halfDepth + radius, radius, -remaining / radius, y);
  }
  remaining -= arcLength;

  if (remaining <= straightX) {
    return createTrackSample(halfWidth - radius - remaining, y, -halfDepth, -1, 0);
  }
  remaining -= straightX;

  if (remaining <= arcLength) {
    return createArcSample(
      -halfWidth + radius,
      -halfDepth + radius,
      radius,
      -Math.PI / 2 - remaining / radius,
      y,
    );
  }
  remaining -= arcLength;

  if (remaining <= straightZ) {
    return createTrackSample(-halfWidth, y, -halfDepth + radius + remaining, 0, 1);
  }

  remaining -= straightZ;
  return createArcSample(
    -halfWidth + radius,
    halfDepth - radius,
    radius,
    Math.PI - remaining / radius,
    y,
  );
}

function createTrackCurve(width: number, depth: number, radius: number, y: number) {
  return new THREE.CatmullRomCurve3(
    createRoundedRectanglePoints(width, depth, radius, y),
    true,
    'centripetal',
  );
}

function createRoundedRectanglePoints(width: number, depth: number, radius: number, y: number) {
  const points: THREE.Vector3[] = [];
  const perimeter = getRoundedRectanglePerimeter(width, depth, radius);
  const segments = 128;

  for (let index = 0; index < segments; index += 1) {
    points.push(
      sampleRoundedRectanglePath((index / segments) * perimeter, width, depth, radius, y).position,
    );
  }

  return points;
}

function createArcSample(centerX: number, centerZ: number, radius: number, angle: number, y: number) {
  return createTrackSample(
    centerX + Math.cos(angle) * radius,
    y,
    centerZ + Math.sin(angle) * radius,
    Math.sin(angle),
    -Math.cos(angle),
  );
}

function createTrackSample(x: number, y: number, z: number, tangentX: number, tangentZ: number): TrackSample {
  return {
    position: new THREE.Vector3(x, y, z),
    tangent: new THREE.Vector3(tangentX, 0, tangentZ).normalize(),
  };
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
