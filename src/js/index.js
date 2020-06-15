import '../styles/main.scss';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

var camera, scene, renderer, loader, controls;

init();
animate();

function init() {
    var aspectRatio = window.innerWidth / window.innerHeight;

    camera = new THREE.PerspectiveCamera( 10, aspectRatio, 0.1, 2000 );
    scene    = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    loader   = new GLTFLoader();
    controls = new OrbitControls( camera, renderer.domElement );

    scene.background = new THREE.Color(0xdddddd);

    var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    var pointLight   = new THREE.PointLight(0xffffff, 0.8);
    scene.add(ambientLight);
    camera.add(pointLight);

    camera.position.z = 1;
    controls.update();

    renderer.outputEncoding = THREE.sRGBEncoding;

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild( renderer.domElement );

    loader.load(
        '../assets/models/giraffe.gltf',
        function( gltf ) {
            // https://stackoverflow.com/a/52271526
            var mroot = gltf.scene;
            var bbox = new THREE.Box3().setFromObject(mroot);
            var cent = bbox.getCenter(new THREE.Vector3());
            var size = bbox.getSize(new THREE.Vector3());

            //Rescale the object to normalized space
            var maxAxis = Math.max(size.x, size.y, size.z);
            mroot.scale.multiplyScalar(1.0 / maxAxis);
            bbox.setFromObject(mroot);
            bbox.getCenter(cent);
            bbox.getSize(size);

            //position to 0, halfY, 0
            mroot.position.copy(cent).multiplyScalar(-1);
            mroot.position.y -= (size.y * 0.5);

            scene.add( gltf.scene );
            console.log('added giraffe to scene');
        },
        function( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        function( error ) {
            console.log( `We've got a problem` );
            console.log( error );
        }
    );
}

function animate() {
    requestAnimationFrame( animate );

    if (camera.position.y >= -0.4) {
        camera.position.y -= 0.005;
    }
    controls.update();

    render();
}

function render() {
    scene.traverse( function(o) {
        if (!o.isMesh) return;
        o.material = new THREE.MeshNormalMaterial({});
    });

    renderer.render( scene, camera );
}
