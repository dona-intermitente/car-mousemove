import * as THREE from './three.js-master/build/three.module.js';
import { GLTFLoader } from './three.js-master/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from './three.js-master/examples/jsm/environments/RoomEnvironment.js';

const size = {
    width: 300,
    height: 300
}

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(size.width, size.height);
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
scene.background = new THREE.Color(0x54A6BC);

const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
scene.add(hemisphereLight);

const camera = new THREE.PerspectiveCamera(75, size.width / size.height, 1, 200);
camera.position.set(-5, 5, 5);
camera.rotation.order = 'YXZ';
camera.rotation.y = - Math.PI / 4;
camera.rotation.x = Math.atan(- 1 / Math.sqrt(2));

const wheels = [];

new GLTFLoader().load('car.glb', function (gltf) {
    const model = gltf.scene;

    wheels.push(
        model.getObjectByName('wheel_fl'),
        model.getObjectByName('wheel_fr'),
        model.getObjectByName('wheel_bl'),
        model.getObjectByName('wheel_br')
    );

    document.addEventListener('mousemove', handleMouseMove, false);

    let mousePos = 0;

    function handleMouseMove(event) {
        mousePos = -1 + (event.clientX / window.innerWidth) * 2;
        updateCar();
    }

    function updateCar() {
        let targetX = normalize(mousePos, -1, 1, -3, 3);
        model.position.x += (targetX - model.position.x) * 0.1;
        model.rotation.y = (model.position.x - targetX) * -0.3;
    }

    function normalize(v, vmin, vmax, tmin, tmax) {
        let nv = Math.max(Math.min(v, vmax), vmin);
        let dv = vmax - vmin;
        let pc = (nv - vmin) / dv;
        let dt = tmax - tmin;
        let tv = tmin + (pc * dt);
        return tv;
    }

    scene.add(model);
});

const scenary = new THREE.Group();

const wayGeometry = new THREE.BoxGeometry(6, 100, 100);
const waymaterial = new THREE.MeshPhongMaterial({ color: 0xDEC764 });
const way = new THREE.Mesh(wayGeometry, waymaterial);
way.position.y = -50;
scenary.add(way);

const grassGeometry = new THREE.BoxGeometry(100, 100, 100);
const grassmaterial = new THREE.MeshPhongMaterial({ color: 0x27B064 });
const grass = new THREE.Mesh(grassGeometry, grassmaterial);
grass.position.set(-53, -50, 0);
scenary.add(grass);

const grassGeometry2 = new THREE.BoxGeometry(3, 100, 100);
const grassmaterial2 = new THREE.MeshPhongMaterial({ color: 0x27B064 });
const grass2 = new THREE.Mesh(grassGeometry2, grassmaterial2);
grass2.position.set(4.5, -50, 0);
scenary.add(grass2);

scene.add(scenary);

let Clouds = function () {
    this.mesh = new THREE.Object3D();
    let geom = new THREE.BoxGeometry(5, 5, 5);
    let mat = new THREE.MeshPhongMaterial({ color: 0xDEC764 });
    let nBlocs = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < nBlocs; i++) {
        let m = new THREE.Mesh(geom, mat);
        m.position.z = i * 5;
        m.position.y = Math.random() * 2;
        m.position.x = Math.random() * 2;
        m.rotation.z = Math.random() * Math.PI * 2;
        m.rotation.y = Math.random() * Math.PI * 2;

        let s = .1 + Math.random() * .2;
        m.scale.set(s, s, s);
        m.castShadow = true;
        m.receiveShadow = true;

        this.mesh.add(m);
    }
}

let Sky = function () {
    this.mesh = new THREE.Object3D();
    this.nClouds = 10;
    let stepAngle = Math.PI * 2 / this.nClouds;
    for (let i = 0; i < this.nClouds; i++) {
        let c = new Clouds();
        let a = stepAngle * i; 
        let h = 30 + Math.random() * 15;
        c.mesh.position.y = Math.sin(a) * h;

        let s = 1 + Math.random() * 2;
        c.mesh.scale.set(s, s, s);

        this.mesh.add(c.mesh);
    }
}

let sky = new Sky();
sky.mesh.position.y = -20;
sky.mesh.position.x = 15;
scene.add(sky.mesh);

window.onresize = function () {
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();

    renderer.setSize(size.width, size.height);
};

function render() {
    const time = performance.now() / 1000;

    for (let i = 0; i < wheels.length; i++) {
        wheels[i].rotation.x = time * Math.PI;
    }

    sky.mesh.rotation.x -= 0.01;

    renderer.render(scene, camera);
}

render();