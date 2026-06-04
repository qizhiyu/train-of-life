import * as THREE from 'three';
import { ROOM_DEPTH, ROOM_HEIGHT, ROOM_WIDTH } from './constants';

export function createRoom() {
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
