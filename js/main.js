//COLORS
var Colors = {
    red:0xf25346,
    white:0xd8d0d1,
    pink:0xF5986E,
    brown:0x59332e,
    brownDark:0x23190f,
    blue:0x68c3c0,
    skyBlue:'skyblue',
    turquoise:'turquoise',
};

// THREEJS RELATED VARIABLES

var scene,
    camera, fieldOfView, aspectRatio, nearPlane, farPlane,
    renderer, container;

//SCREEN VARIABLES

var HEIGHT, WIDTH;

// setup scene
function createScene() {

  // grab in create scene to help maintain orientation
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  // default scene properties
  scene = new THREE.Scene();
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 60;
  nearPlane = 1;
  farPlane = 10000;
  // setup camera
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
    );
  scene.fog = new THREE.Fog(0xf7d9aa, 100,950);
  camera.position.x = 0;
  camera.position.z = 200;
  camera.position.y = 100;

  // define renderer and its properties
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(WIDTH, HEIGHT);
  renderer.shadowMap.enabled = true;
  container = document.getElementById('kaleidoscope');
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', handleWindowResize, false);
}

// HANDLE SCREEN EVENTS

function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}


// LIGHTS
// lights are fun
var ambientLight, hemisphereLight, shadowLight;

function createLights() {

  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9);

  ambientLight = new THREE.AmbientLight(Colors.turquoise, .3);

  anotherShadow = new THREE.DirectionalLight('purple', .9);
  anotherShadow.position.set(0, 100, 100);
  anotherShadow.castShadow = true;
  anotherShadow.shadow.camera.near = 1;
  anotherShadow.shadow.camera.far = 1000;


  shadowLight = new THREE.DirectionalLight(Colors.pink , .9);
  shadowLight.position.set(150, 350, 350);
  shadowLight.castShadow = true;
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;

  scene.add(hemisphereLight);
  scene.add(shadowLight);
  scene.add(anotherShadow);
  scene.add(ambientLight);
}


// cylinder shape class
CylinderShape = function(){
  var geom = new THREE.CylinderGeometry(600,600,800,40,10);

  // need to look at what exactly these do
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
  geom.mergeVertices();
  var l = geom.vertices.length;

  this.waves = [];

  // create the ridges (waves as the tutorial called them) for cylinder exterior
  for (var i=0;i<l;i++){
    var v = geom.vertices[i];
    // define each wave based on x,y,z amplify then adjust amplitude for larger ridges, need to look at speed
    this.waves.push({y:v.y,
                     x:v.x,
                     z:v.z,
                     ang:Math.random()*Math.PI*2,
                     amp:5 + Math.random()*200,
                     speed:0.016 + Math.random()*0.032
                    });
  };
  // obj to help better define shape properties (the mesh) MeshPhongMaterial
  var mat = new THREE.MeshPhongMaterial({
    color:Colors.skyBlue,
    transparent:true,
    opacity:.8,
    shading:THREE.FlatShading,
  });

  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.receiveShadow = true;
}

// function for CylinderShape class that rotates the cylinder
CylinderShape.prototype.turnCylinder = function (){
  // get vertices of cylinder
  var verts = this.mesh.geometry.vertices;
  var l = verts.length;
  for (var i=0; i<l; i++){
    var v = verts[i];
    var vprops = this.waves[i];
    // rotate to "wave" on the outside of the cylinder based on its x / y position and some trig i dont understand
    v.x =  vprops.x + Math.cos(vprops.ang)*vprops.amp;
    v.y = vprops.y + Math.sin(vprops.ang)*vprops.amp;
    vprops.ang += vprops.speed;
  }
  // use THREEJS verticesNeedUpdate bool to update shape and rotate cylinders z axis .005
  this.mesh.geometry.verticesNeedUpdate=true;
  cylinder1.mesh.rotation.z += .00005;
  cylinder3.mesh.rotation.z += .00005;
  cylinder2.mesh.rotation.z += .00005;
}

// cube class for center cube object
var CubeShape = function() {
  this.mesh = new THREE.Object3D();
  // BoxGeometry taxes x, y, z
  cubeGeom = new THREE.BoxGeometry(1000,500,1000);
  cubeGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,10,0));

  // get either 1, 2, or 3 and apply a different color accordinly
  var val = Math.floor(Math.random()*3);
  var shapeColor;
  if(val === 1) {
    shapeColor = Colors.skyBlue;
  }
  else if (val === 2) {
    shapeColor = Colors.turquoise;
  }
  else {
    shapeColor = Colors.white;
  }

  // Obj to help define shapes properties
  var mat = new THREE.MeshPhongMaterial({
    opacity: .7,
    color: shapeColor,
    transparent:true,
    shading:THREE.FlatShading,
  });

  // this was cool but just made on so I added the block to make a bunch in the for loop
  // this.mesh = new THREE.Mesh(cubeGeom, mat);

  // make a random whole number
  var nBlocs = 3+Math.floor(Math.random()*3);

  // iterate over nBlocs to create random cube position
  for (var i=0; i<nBlocs; i++ ){
    var m = new THREE.Mesh(cubeGeom.clone(), mat);
    m.position.x = i*15;
    m.position.y = Math.random()*10;
    m.position.z = Math.random()*10;
    m.rotation.z = Math.random()*Math.PI*2;
    m.rotation.y = Math.random()*Math.PI*2;
    var s = .1 + Math.random()*.9;
    m.scale.set(s,s,s);
    m.castShadow = true;
    m.receiveShadow = true;
    this.mesh.add(m);
  }

}


// declare global vars for each cylinder to be used in loop()
var cylinder1;
var cylinder2;
var cylinder3;

// 3D Models

// cubes in the middle
function createCubeShape(){
  shape = new CubeShape();
  shape.mesh.scale.set(.25,.25,.25);
  shape.mesh.position.y = 100;
  shape.mesh.position.z = -50;
  // shape.rotation.x = Math.PI/2;
  scene.add(shape.mesh);
}

// bottom Cylinder
function createCylinder1(){
  cylinder1 = new CylinderShape();
  cylinder1.mesh.position.y = -600;
  scene.add(cylinder1.mesh);
}

// upper right cylinder
function createCylinder2(){
  cylinder2 = new CylinderShape();
  cylinder2.mesh.position.y = 600;
  cylinder2.mesh.position.x = 600;
  scene.add(cylinder2.mesh);
}

// upper left cylinder
function createCylinder3(){
  cylinder3 = new CylinderShape();
  cylinder3.mesh.position.y = 600;
  cylinder3.mesh.position.x = -600;
  scene.add(cylinder3.mesh);
}



// disabled random x/y plcement till i unerstand better / proper techniques
function loop(){
  cylinder1.turnCylinder();
  cylinder2.turnCylinder();
  cylinder3.turnCylinder();
  updateCameraFov();
	// called over and over to create a ball of randomly oriented cubes in the middle at the same x,y,z position
  createCubeShape();
  // shape.mesh.position.x = Math.floor(Math.random()*1000);
  // shape.mesh.position.y = Math.floor(Math.random()*10);
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

// THREEJS method for updating camera
function updateCameraFov(){
  camera.fov = normalize(mousePos.x,-1,1,40, 200);
  camera.updateProjectionMatrix();
}

//^^for above^^ to setup orientation for camera adjustments
function normalize(v,vmin,vmax,tmin, tmax){
  var nv = Math.max(Math.min(v,vmax), vmin);
  var dv = vmax-vmin;
  var pc = (nv-vmin)/dv;
  var dt = tmax-tmin;
  var tv = tmin + (pc*dt);
  return tv;
}

// main initializing function; make scene, lights, shapes, and start loop
function init(event){
  document.addEventListener('mousemove', handleMouseMove, false);
  // document.addEventListener('mousemove', handleChangeCamera, false);
	var slider = document.getElementById('slider');
  slider.addEventListener('input', handleChangeCamera, false);
  createScene();
  createLights();
  createCubeShape();
  //seperate cylinders for three different instances / positions
  createCylinder1();
  createCylinder2();
  createCylinder3();
  loop();
}

// HANDLE MOUSE EVENTS

var mousePos = { x: 0, y: 0 };

//handle X axis mouse change for depth changes
function handleMouseMove(event) {
  var tx = -1 + (event.clientX / WIDTH)*2;
  var ty = 1 - (event.clientY / HEIGHT)*2;
  mousePos = {x:tx, y:ty};
}
// handle Y axis mouse change to rotate camera's z plane
// function handleChangeCamera(event) {
// 	console.log(event.clientY);
//   camera.rotation.z = event.clientY
// }

function handleChangeCamera(e) {
  camera.rotation.z = e.target.value;
}
// Wait for page load to initialize
window.addEventListener('load', init, false);
