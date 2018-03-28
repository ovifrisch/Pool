//Scene etc...
var scene, camera, renderer, light;

//table attributes
var table_width, table_height;

//table
var table;

//ball attributes
var ball_radius = 20;

//balls
var cue_ball, red_ball;




init_scene();
init_table();
create_balls();
add_balls_to_scene();
animate();

function init_table() {
	var geometry = new THREE.BoxGeometry( table_width, table_height, 0);
	var material = new THREE.MeshPhongMaterial({color: "green"});
	table = new THREE.Mesh(geometry, material);
	table.castShadow = true;
	table.receiveShadow= true;
	scene.add(table);
}

function create_balls() {
	var sphere_geometry = new THREE.SphereGeometry(ball_radius, 32, 32);


	var cue_geometry = new THREE.BufferGeometry();
	var red_geometry = new THREE.BufferGeometry();

	cue_geometry.fromGeometry(sphere_geometry);
	red_geometry.fromGeometry(sphere_geometry);

	var cue_material = new THREE.MeshPhongMaterial( { color: 0xffffff } );
	var red_material = new THREE.MeshPhongMaterial( { color: "red" } );

	cue_ball = new THREE.Mesh(cue_geometry, cue_material);
	red_ball = new THREE.Mesh(red_geometry, red_material);
}

function add_balls_to_scene() {
	scene.add(cue_ball);
	cue_ball.translateOnAxis(new THREE.Vector3(0, 0, 1), ball_radius);

	scene.add(red_ball);
	red_ball.translateOnAxis(new THREE.Vector3(0, 0, 1), ball_radius);
	red_ball.translateOnAxis(new THREE.Vector3(1, 0, 0), 100);
	scene.add(red_ball);
}


function init_scene() {
	table_width = $("#pool_table").width();
	table_height = $("#pool_table").height();

	var canvas = document.querySelector("#pool_table");
	var gl = canvas.getContext("webgl");

	scene = new THREE.Scene();

	//outward is negative here apparently
	camera = new THREE.OrthographicCamera(table_width / - 2, table_width / 2, table_height / 2, table_height / - 2, -2*ball_radius, 10);
	scene.add(camera);

	renderer = new THREE.WebGLRenderer(gl, "mediump");
	renderer.setSize(table_width, table_height);

	var light1 = new THREE.DirectionalLight( 0xffffff, 1 );
	light1.position.set( 0, 0, 100);
	scene.add(light1);
}


var cue_going_left = false;

function update_position_cue() {

	var middle = new THREE.Vector3();
	var geometry = cue_ball.geometry;


	geometry.computeBoundingBox();

	middle.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
	middle.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
	middle.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;

	cue_ball.localToWorld(middle);

	//change x direction
	if (middle.x > table_width/2 - ball_radius) {
		cue_going_left = true;
	}
	else if (middle.x < -table_width/2 + ball_radius) {
		cue_going_left = false;
	}


	if (cue_going_left) {
		cue_ball.position.x -= 2;
	}
	else {
		cue_ball.position.x += 2;
	}
}

var red_going_left = true;

function update_position_red() {
	var middle = new THREE.Vector3();
	var geometry = red_ball.geometry;


	geometry.computeBoundingBox();

	middle.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
	middle.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
	middle.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;

	red_ball.localToWorld(middle);

	//change x direction
	if (middle.x > table_width/2 - ball_radius) {
		red_going_left = true;
	}
	else if (middle.x < -table_width/2 + ball_radius) {
		red_going_left = false;
	}


	if (red_going_left) {
		red_ball.position.x -= 1;
	}
	else {
		red_ball.position.x += 1;
	}

}

function detect_collision() {
	var firstBB = new THREE.Box3().setFromObject(cue_ball);
	var secondBB = new THREE.Box3().setFromObject(red_ball);
	var collision = firstBB.intersectsBox(secondBB);

	if (collision) {
		if (red_going_left) {
			red_going_left = false;
		}
		else if (!red_going_left) {
			red_going_left = true;
		}

		if (cue_going_left) {
			cue_going_left = false;
		}
		else if (!cue_going_left) {
			cue_going_left = true;
		}
	}
}


function animate() {
	renderer.render(scene, camera);
	detect_collision();
	update_position_cue();
	update_position_red();
	requestAnimationFrame( animate );
}