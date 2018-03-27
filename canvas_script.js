var scene, camera, renderer;
var table_width, table_height;
var light;
var white_ball, white_ball_mesh;
var flat_red_ball;
var table;
var ball_radius = 20;
var trans
var accel = false;


init();
init_table();
animate();

function init_table() {
	var geometry = new THREE.BoxGeometry( table_width, table_height, 0);
	var material = new THREE.MeshPhongMaterial({color: "green"});
	var mesh = new THREE.Mesh(geometry, material);
	mesh.castShadow = true;
	mesh.receiveShadow= true;
	scene.add(mesh);
}


function init() {
	trans = 1;
	table_width = $("#pool_table").width();
	table_height = $("#pool_table").height();

	var canvas = document.querySelector("#pool_table");
	var gl = canvas.getContext("webgl");

	scene = new THREE.Scene();

	//outward is negative here apparently
	camera = new THREE.OrthographicCamera(table_width / - 2, table_width / 2, table_height / 2, table_height / - 2, -2*ball_radius, 10);
	scene.add(camera);

	//camera = new THREE.OrthographicCamera( table_width / - 2, table_width / 2, table_height / 2, table_height / - 2, ball_radius + 20, -ball_radius - 1);
	renderer = new THREE.WebGLRenderer(gl, "mediump");
	renderer.setSize(table_width, table_height);
	//renderer.shadowMap.enabled = true;

	var light1 = new THREE.DirectionalLight( 0xffffff, 1 );
	light1.position.set( 0, 0, 100);
	//light1.castShadow = true;
	scene.add(light1);



	var white_ball_geometry = new THREE.SphereGeometry( ball_radius, 32, 32 );
	var material_white = new THREE.MeshPhongMaterial( { color: 0xffffff } );


	var buffer_geometry = new THREE.BufferGeometry();
	buffer_geometry.fromGeometry(white_ball_geometry);
	white_ball_mesh = new THREE.Mesh( buffer_geometry, material_white );
	// white_ball_mesh.castShadow = true;
	// white_ball_mesh.receiveShadow = true;

	white_ball_mesh.translateOnAxis(new THREE.Vector3(0, 0, 1), ball_radius);
	scene.add(white_ball_mesh);
}


var transl_position = 1.0;
var transl_acceleration = 0.001;


var white_going_left = false;
var white_going_down = false;



function update_position_white() {
	var middle = new THREE.Vector3();
	var geometry = white_ball_mesh.geometry;


	geometry.computeBoundingBox();

	middle.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
	middle.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
	middle.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;
	white_ball_mesh.localToWorld(middle);

	//change x direction
	if (middle.x > table_width/2 - ball_radius) {
		white_going_left = true;
	}
	else if (middle.x < -table_width/2 + ball_radius) {
		white_going_left = false;
	}

	//change y direction
	if (middle.y > table_height/2 - ball_radius){
		white_going_down = true;
	}
	else if (middle.y < -table_height/2 + ball_radius) {
		white_going_down = false;
	}

	if (trans > 10) {
		accel = false;
	}
	else if (trans < 0) {
		accel = true;
	}
	if (accel) {
		trans += 0.1;
	}
	else {
		trans -= 0.1;
	}

	if (white_going_left) {
		white_ball_mesh.position.x -= trans;
	}
	else {
		white_ball_mesh.position.x += trans;
	}

	if (white_going_down) {
		white_ball_mesh.position.y -= trans;
	}
	else {
		white_ball_mesh.position.y += trans;
	}
}



function animate() {
	renderer.render(scene, camera);
	update_position_white();
	requestAnimationFrame( animate );
}