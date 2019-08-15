import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

var vertexShader = require("../shaders/shader.vs");
var fragmentShader = require("../shaders/shader.fs");

import bearTextureImg from '@/assets/bear1Imagem1.png'
import ballTextureImg from '@/assets/ballImagem1.png'

class threeService {
  constructor(el) {

    this.$el = el
    console.log('this.$el', this.$el);
    
    this.container
    this.controls
    this.renderer
    this.scene
    this.camera
    this.mesh
    this.object
    this.material
    this.start = Date.now()
    this.fov = 30

    this.setup()
    
  }

  setup = () => {

    this.container = this.$el;
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    this.camera.position.z = 400;
    
    this.material = new THREE.ShaderMaterial( {
      uniforms: {
        tGrid: {
          type: "t",
          // value: THREE.ImageUtils.loadTexture(bearTextureImg)
          value: THREE.ImageUtils.loadTexture(ballTextureImg)
        },
        time: {
          type: "f",
          value: 0.0
        }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    });

    var manager = new THREE.LoadingManager( this.loadModel );

    manager.onProgress = function ( item, loaded, total ) {
      console.log( item, loaded, total );
    };

    var loader = new OBJLoader( manager );
    // loader.load( '/staticAssets/bear1.obj', ( obj ) => {
    loader.load( '/staticAssets/ball.obj', ( obj ) => {
      this.object = obj;
    }, this.onProgress, this.onError );
    
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.setPixelRatio( window.devicePixelRatio );

    this.container.appendChild( this.renderer.domElement );

    // this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
    this.controls = new OrbitControls( this.camera, this.renderer.domElement );

    this.onWindowResize();
    window.addEventListener( 'resize', this.onWindowResize );

    this.render();
  }

  loadModel = () => {
    this.object.traverse( ( child ) => {
      // if ( child.isMesh ) child.material.map = texture;
      if ( child.isMesh ) child.material = this.material;
    });
    this.object.rotation.x = THREE.Math.degToRad( -30 );
    this.scene.add( this.object );
  }

  onProgress = (xhr) => {
    if ( xhr.lengthComputable ) {
      var percentComplete = xhr.loaded / xhr.total * 100;
      console.log( 'model ' + Math.round( percentComplete, 2 ) + '% downloaded' );
    }
  }

  onError = () => {}

  onWindowResize = () => {
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  render = () => {
    this.material.uniforms[ 'time' ].value = .00025 * ( Date.now() - this.start );
    this.renderer.render( this.scene, this.camera );
    requestAnimationFrame( this.render );
  }
}

export default threeService
