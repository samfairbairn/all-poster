import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

var vertexShader = require("../shaders/shader.vs");
var fragmentShader = require("../shaders/shader.fs");

import bearTextureImg from '@/assets/bear1Imagem1.png'
import ballTextureImg from '@/assets/ballImagem1.png'

import {
  EffectComposer,
  RenderPass,
	BlendFunction,
	EffectPass,
	GodRaysEffect,
  BloomEffect,
	KernelSize,
	SMAAEffect
} from 'postprocessing'

class threeService {
  constructor(el) {

    this.$el = el
    console.log('this.$el', this.$el);

    this.composer
    this.renderPass
    this.effectPass
    this.light
    this.sun

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

    // setup renderer

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.setPixelRatio( window.devicePixelRatio );

    this.container.appendChild( this.renderer.domElement );
    this.scene = new THREE.Scene()
    this.clock = new THREE.Clock()

    // camera

    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    this.camera.position.z = 400;

    // composer

    this.composer = new EffectComposer(this.renderer)
    this.renderPass = new RenderPass(this.scene, this.camera)
    this.renderPass.renderToScreen = false

    // Light.

    const ambientLight = new THREE.AmbientLight(0x808080)
		const directionalLight = new THREE.DirectionalLight(0xffbbaa)
		// directionalLight.position.set(75, 25, -100)

    // set light inside the ball
		// directionalLight.position.set(0, 0, 0)
    // set light inside the bear
		// directionalLight.position.set(0, 0, -50)

		directionalLight.target = this.scene
		this.light = directionalLight
		this.scene.add(ambientLight)
		this.scene.add(directionalLight)

    // Sun.

		const sunMaterial = new THREE.MeshBasicMaterial({
			color: 0xffddaa,
			transparent: true,
			fog: false
		});

		const sunGeometry = new THREE.SphereBufferGeometry(32, 32, 32);
		const sun = new THREE.Mesh(sunGeometry, sunMaterial);
		sun.frustumCulled = false;

		const group = new THREE.Group();
		group.position.copy(this.light.position);
		group.add(sun);

		// The sun mesh is not added to the scene to hide hard geometry edges.
		// scene.add(group);
		sun.matrixAutoUpdate = false;
		this.sun = sun;

    // god rays

    const godRaysEffect = new GodRaysEffect(this.camera, this.sun, {
  			height: 720,
  			kernelSize: KernelSize.SMALL,
  			density: 0.96,
  			decay: 0.96,
  			weight: 0.3,
  			exposure: 0.54,
  			samples: 60,
  			clampMax: 1.0
  		});

		godRaysEffect.dithering = true;
		// this.effect = godRaysEffect;

    // this.effectPass = new EffectPass(this.camera, new BloomEffect());
    this.effectPass = new EffectPass(this.camera, godRaysEffect)
    this.effectPass.renderToScreen = true

    // add render passes

    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.effectPass);

    // choose object

    const objectId = 'ball'
    let objectTexture, objectModel

    switch (objectId) {
      case 'ball':
        objectTexture = ballTextureImg
        objectModel = '/staticAssets/ball.obj'
        break
      case 'bear':
      default:
        objectTexture = bearTextureImg
        objectModel = '/staticAssets/bear1.obj'
        break
    }

    // load object

    this.material = new THREE.ShaderMaterial( {
      uniforms: {
        tGrid: {
          type: "t",
          // value: THREE.ImageUtils.loadTexture(bearTextureImg)
          // value: THREE.ImageUtils.loadTexture(ballTextureImg)
          value: THREE.ImageUtils.loadTexture(objectTexture)
        },
        time: {
          type: "f",
          value: 0.0
        }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    });

    this.material.side = THREE.DoubleSide

    var manager = new THREE.LoadingManager( this.loadModel );

    manager.onProgress = function ( item, loaded, total ) {
      console.log( item, loaded, total );
    };

    var loader = new OBJLoader( manager );
    // loader.load( '/staticAssets/bear1.obj', ( obj ) => {
    // loader.load( '/staticAssets/ball.obj', ( obj ) => {
    loader.load( objectModel, ( obj ) => {
      this.object = obj;
    }, this.onProgress, this.onError );

    // setup orbit

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );

    // resize

    this.onWindowResize();
    window.addEventListener( 'resize', this.onWindowResize );

    // render

    this.render();
  }

  initObject = (object = 'bear') => {

    let objectTexture, objectModel

    switch (object) {
      case 'ball':
        objectTexture = ballTextureImg
        objectModel = '/staticAssets/ball.obj'
        break
      case 'bear':
      default:
        objectTexture = bearTextureImg
        objectModel = '/staticAssets/bear1.obj'
        break
    }

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
    // this.renderer.render( this.scene, this.camera );
    this.composer.render(this.clock.getDelta());
    requestAnimationFrame( this.render );
  }
}

export default threeService
