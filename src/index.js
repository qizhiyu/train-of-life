let camera, scene, renderer;
let geometry, material, mesh;

init();
animate();

function init() {}

function animate() {
  return;

  requestAnimationFrame(animate);

  mesh.rotation.x += 0.01;
  mesh.rotation.y += 0.02;

  renderer.render(scene, camera);
}
