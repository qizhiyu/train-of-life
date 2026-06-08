import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  TRACK_CORNER_RADIUS,
  TRACK_DEPTH,
  TRACK_WIDTH,
  TRAIN_HEADLAMP_DISTANCE,
  TRAIN_HEIGHT,
  TRAIN_LOOP_SECONDS,
} from './constants';
import { createRoom } from './room';
import { createScenery } from './scenery';
import {
  createLoopTrack,
  getRoundedRectanglePerimeter,
  sampleRoundedRectanglePath,
} from './track';
import { createTrain } from './train';
import type { SceneObjects, TrainRig } from './types';

export class TrainOfLifeScene {
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
  });
  private readonly controls: OrbitControls;
  private readonly clock = new THREE.Clock();
  private readonly train: TrainRig;
  private readonly trainPathLength = getRoundedRectanglePerimeter(
    TRACK_WIDTH,
    TRACK_DEPTH,
    TRACK_CORNER_RADIUS,
  );
  private readonly cameraTarget = new THREE.Vector3(0, 0.55, 0);
  private frameId = 0;
  private simTime = 0;
  private playing = true;

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

  setPlaying(playing: boolean) {
    this.playing = playing;
  }

  isPlaying() {
    return this.playing;
  }

  togglePlaying() {
    this.playing = !this.playing;
    return this.playing;
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

    const ambientScatter = new THREE.AmbientLight(0x5f4934, 0.07);
    const ceilingBounce = new THREE.HemisphereLight(0x9b8460, 0x080604, 0.18);
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
    const delta = this.clock.getDelta();
    if (this.playing) {
      this.simTime += delta;
    }
    const elapsed = this.simTime;
    const distance = (elapsed / TRAIN_LOOP_SECONDS) * this.trainPathLength;
    const trainPose = sampleRoundedRectanglePath(
      distance,
      TRACK_WIDTH,
      TRACK_DEPTH,
      TRACK_CORNER_RADIUS,
      0,
    );
    const targetPoint = trainPose.position.clone().addScaledVector(trainPose.tangent, TRAIN_HEADLAMP_DISTANCE);
    const sway = Math.sin(elapsed * 8.2) * 0.0018;
    const trainY = 0.028 + sway;
    const lampY = trainY + TRAIN_HEIGHT * 0.72;

    this.train.root.position.set(trainPose.position.x, trainY, trainPose.position.z);
    this.train.root.rotation.y = Math.atan2(-trainPose.tangent.z, trainPose.tangent.x);
    this.train.lampTarget.position.set(targetPoint.x, lampY + 0.03, targetPoint.z);
    this.train.lamp.intensity = 42 + Math.sin(elapsed * 9.4) * 1.8;
    this.train.lamp.angle = 0.72;

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(this.animate);
  }
}
