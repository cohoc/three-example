import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";

let asteroid;

const scene = new THREE.Scene();
//scene.fog = new THREE.FogExp2(0x000000, 0.2);
const clock = new THREE.Clock();
const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  900
);
//camera frustum
const cameraVPM = new THREE.Matrix4();
const frustum = new THREE.Frustum();

const closedSpline = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, -80),
  new THREE.Vector3(80, 0, 0),
  new THREE.Vector3(0, 0, 80),
  new THREE.Vector3(-80, 0, 0),
]);
closedSpline.curveType = "catmullrom";
closedSpline.closed = true;
const tube = new THREE.Mesh(
  new THREE.TubeGeometry(closedSpline, 240, 2.5, 16, true),
  new THREE.MeshBasicMaterial({
    wireframe: true,
    color: 0xffffff,
    opacity: 0.7,
  })
);
const edges = new THREE.EdgesGeometry(tube.geometry, 0.1);
const line = new THREE.LineSegments(
  edges,
  new THREE.LineBasicMaterial({
    color: 0xffffff,
  })
);

const controls = new OrbitControls(camera, renderer.domElement);
//const pointerControls = new PointerLockControls(camera, document.body);
//scene.add(tube);
scene.add(line);
window.addEventListener("resize", windowResize);
asteroidSpawn();

function asteroidUpdate() {
  asteroid.rotation.x += Math.random() * 0.001 - 0.005;
  asteroid.rotation.y += Math.random() * 0.001 - 0.005;
  asteroid.rotation.z += Math.random() * 0.001 - 0.005;
}

//update camera position
function cameraUpdate(pos, lookAt) {
  camera.position.copy(pos);
  camera.lookAt(lookAt);
}

function checkCollision() {
  const asteroidVec = asteroid.position
    .clone()
    .sub(camera.position)
    .normalize();
  const cameraVec = camera.getWorldDirection(new THREE.Vector3());
  if (cameraVec.dot(asteroidVec) <= 0) {
    console.log("object out of view");
    scene.remove(asteroid);
  }
}

//create asteroid at intervals
function createAsteroid() {
  const time = clock.getElapsedTime();
  const looptime = 160;
  const t = (time % looptime) / looptime;
  asteroid = new THREE.Mesh(
    new THREE.DodecahedronGeometry(Math.random() * (0.35 - 0.05) + 0.05),
    new THREE.MeshBasicMaterial({
      wireframe: true,
      color: 0x00ff00,
    })
  );
  asteroid.name = "asteroid";

  const astPos = tube.geometry.parameters.path.getPointAt((t + 0.05) % 1);
  astPos.x += Math.random() - 1;
  astPos.y += Math.random() - 1;
  astPos.z += Math.random() - 1;
  asteroid.position.copy(astPos);
  scene.add(asteroid);
}

function asteroidSpawn() {
  const interval = Math.random() * (9000 - 5000) + 5000;
  setTimeout(() => {
    if (!scene.getObjectByName("asteroid")) {
      createAsteroid();
    }
    asteroidSpawn();
  }, interval);
}

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();
  const looptime = 160;
  const t = (time % looptime) / looptime;
  let pos = tube.geometry.parameters.path.getPointAt(t);
  let lookAt = tube.geometry.parameters.path.getPointAt((t + 0.03) % 1);

  cameraUpdate(pos, lookAt);
  if (scene.getObjectByName("asteroid")) {
    asteroidUpdate();
    checkCollision();
  }
  renderer.render(scene, camera);
  controls.update();
}

function windowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

animate();
