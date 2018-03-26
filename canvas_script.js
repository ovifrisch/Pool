var scene, camera, renderer;
var table_width, table_height;
var light;
var white_ball;
var flat_red_ball;
var ball_radius = 30;


init();
animate();


function init() {
	table_width = $("#pool_table").width();
	table_height = $("#pool_table").height();

	var canvas = document.querySelector("#pool_table");
	var gl = canvas.getContext("webgl");

	scene = new THREE.Scene();

	camera = new THREE.OrthographicCamera( table_width / - 2, table_width / 2, table_height / 2, table_height / - 2, 1, -35 );
	renderer = new THREE.WebGLRenderer(gl, "mediump");
	renderer.setSize(table_width, table_height);

	// light1 = new THREE.DirectionalLight(0xffffff, 0.7);
	// light2 = new THREE.DirectionalLight(0xffffff, 0.7);
	// light1.position.set(-0.2, 0, 0.1);
	// light2.position.set(0.2, 0, 0.1)
	// scene.add(light1);
	// scene.add(light2);


	var geometry = new THREE.SphereGeometry( ball_radius, 32, 32 );
	var material_white = new THREE.MeshBasicMaterial( { color: 0xffffff } );
	//var material_flat_red = new THREE.MeshBasicMaterial( { color: "red" } );

	white_ball = new THREE.Mesh( geometry, material_white );
	//flat_red_ball = new THREE.Mesh(geometry, material_flat_red);

	scene.add( white_ball );
	//scene.add(flat_red_ball);

}

var white_going_left = false;
var white_going_down = false;
function update_position_white() {
	var x_speed = 5;
	var y_speed = 5;
	//change x direction
	if (white_ball.position.x > table_width/2 - ball_radius) {
		white_going_left = true;
	}
	else if (white_ball.position.x < -table_width/2 + ball_radius) {
		white_going_left = false;
	}

	//change y direction
	if (white_ball.position.y > table_height/2 - ball_radius) {
		white_going_down = true;
	}
	else if (white_ball.position.y < -table_height/2 + ball_radius) {
		white_going_down = false;
	}

	if (white_going_left) {
		white_ball.position.set(white_ball.position.x - x_speed, white_ball.position.y, white_ball.position.z);
	}
	else {
		white_ball.position.set(white_ball.position.x + x_speed, white_ball.position.y, white_ball.position.z);
	}

	if (white_going_down) {
		white_ball.position.set(white_ball.position.x, white_ball.position.y - y_speed, white_ball.position.z);
	}
	else {
		white_ball.position.set(white_ball.position.x, white_ball.position.y + y_speed, white_ball.position.z);
	}
}

// var left_flat_red = false;
// function update_position_flat_red() {

// }



function animate() {
	renderer.render(scene, camera);
	update_position_white();
	//update_position_flat_red();
	requestAnimationFrame( animate );
}