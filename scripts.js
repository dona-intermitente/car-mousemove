import * as THREE from './three.js-master/build/three.module.js';
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './three.js-master/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from './three.js-master/examples/jsm/environments/RoomEnvironment.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(render);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.85;
document.body.appendChild(renderer.domElement);

const pmremGenerator = new THREE.PMREMGenerator(renderer);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
scene.fog = new THREE.Fog(0xeeeeee, 10, 50);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment()).texture;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 200);
camera.position.set(-5, 5, 5);
camera.rotation.order = 'YXZ';
camera.rotation.y = - Math.PI / 4;
camera.rotation.x = Math.atan(- 1 / Math.sqrt(2));

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const wheels = [];

new GLTFLoader().load('car.glb', function (gltf) {
    const model = gltf.scene;

    wheels.push(
        model.getObjectByName('wheel_fl'),
        model.getObjectByName('wheel_fr'),
        model.getObjectByName('wheel_bl'),
        model.getObjectByName('wheel_br')
    );

    scene.add(model);
});

window.onresize = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
};

function render() {
    const time = performance.now() / 1000;

    for (let i = 0; i < wheels.length; i++) {
        wheels[i].rotation.x = time * Math.PI;
    }

    renderer.render(scene, camera);
}

render();