
//table
var table;

//ball attributes
var ball_radius = 18;


var game = {
	table_width : 0,
	table_height: 0,
	table : null,
	friction : 0.015,
	ball_colors : [
		'white', "yellow", "blue", "red",
		"purple", "orange", "green", "brown",
		"black", "#F5F777", "#7779F7",
		"#F7777F", "#C377F7", "#F7BD77",
		"#77F783", "#99445A"
	],
	scene : null,
	camera : null,
	renderer : null,
	light : null
};


/* ENTRY POINT */
inititalize_game();
animate();

//inititalize_game();

function inititalize_game() {
	game.table_width = $("#pool_table").width();
	game.table_height = $("#pool_table").height();

	game.scene = new THREE.Scene();

	//outward is negative here apparently
	game.camera = new THREE.OrthographicCamera(game.table_width / - 2, game.table_width / 2, game.table_height / 2, game.table_height / - 2, -2*ball_radius, 10);
	game.scene.add(game.camera);

	game.renderer = new THREE.WebGLRenderer(document.querySelector("#pool_table").getContext("webgl"), "mediump");
	game.renderer.setSize(game.table_width, game.table_height);

	game.light = new THREE.DirectionalLight( 0xffffff, 1 );
	game.light.position.set( 0, 0, 100);
	game.scene.add(game.light);

	set_table();
	create_balls();
	set_balls();
}

var pause = false;
function click_hit() {
	balls[1].x_velocity = -3;
	//balls[1].y_velocity = -3;
	balls[2].x_velocity = 3;
	//balls[2].y_velocity = -3;
	balls[3].y_velocity = -3;
}

function click_pause() {
	if (pause == false)
		pause = true;
	else {
		pause = false;
		animate();
	}
}

function click_reset() {

}

function set_table() {
	var geometry = new THREE.BoxGeometry( game.table_width, game.table_height, 0);
	var material = new THREE.MeshPhongMaterial({color: "green"});
	game.table = new THREE.Mesh(geometry, material);
	game.table.castShadow = true;
	game.table.receiveShadow= true;
	game.scene.add(game.table);
}

function create_balls() {
	// create a sphere geometry that each ball will copy into their buffer geometries
	var sphere_geometry = new THREE.SphereGeometry(ball_radius, 32, 32);

	//for each ball
	var geometry, material;
	for (var i = 0; i < balls.length; i++) {
		geometry = new THREE.BufferGeometry();
		geometry.fromGeometry(sphere_geometry);
		geometry.computeBoundingBox();
		material = new THREE.MeshPhongMaterial({ color: game.ball_colors[i]});
		balls[i].mesh = new THREE.Mesh(geometry, material);
	}
}

function set_balls() {

	balls[1].mesh.translateOnAxis(new THREE.Vector3(1, 0, 0), 100);
	//balls[1].mesh.translateOnAxis(new THREE.Vector3(0, 1, 0), 100);
	balls[2].mesh.translateOnAxis(new THREE.Vector3(1, 0, 0), -100);
	//balls[2].mesh.translateOnAxis(new THREE.Vector3(0, 1, 0), 100);
	balls[3].mesh.translateOnAxis(new THREE.Vector3(0, 1, 0), 100);

	for (var i = 0; i < balls.length; i++) {
		balls[i].mesh.translateOnAxis(new THREE.Vector3(0, 0, 1), ball_radius);
		//balls[i].mesh.translateOnAxis(new THREE.Vector3(1, 0, 0), -370 + 50 * i);
		balls[i].x_velocity = 0.0;
		balls[i].y_velocity = 0.0;
		game.scene.add(balls[i].mesh);
	}
}

function update_positions() {
	for (var i = 0; i < balls.length; i++) {
		balls[i].mesh.position.x += balls[i].x_velocity;
		balls[i].mesh.position.y += balls[i].y_velocity;
	}
}

function apply_friction() {
	var friction_x;
	var friction_y;

	for (var i = 0; i < balls.length; i++) {

		if (balls[i].x_velocity == 0) {
			friction_x = 0;
			friction_y = game.friction;
		}
		else if (balls[i].y_velocity == 0) {
			friction_y = 0;
			friction_x = game.friction;
		}

		else {
			friction_x = Math.abs(game.friction*Math.cos(Math.atan(balls[i].y_velocity / balls[i].x_velocity)));
			friction_y = Math.abs(game.friction*Math.sin(Math.atan(balls[i].y_velocity / balls[i].x_velocity)));
		}

		if (Math.abs(balls[i].x_velocity) <= friction_x) {
			balls[i].x_velocity = 0.0;
		}

		else {
			if (balls[i].x_velocity > 0) {
				balls[i].x_velocity -= friction_x;
			}
			else {
				balls[i].x_velocity += friction_x;
			}
		}

		if (Math.abs(balls[i].y_velocity) <=friction_y) {
			balls[i].y_velocity = 0.0;
		}

		else {
			if (balls[i].y_velocity > 0) {
				balls[i].y_velocity -= friction_y;
			}
			else {
				balls[i].y_velocity += friction_y;
			}
		}
	}
}

var pause = false;
function animate() {
	game.renderer.render(game.scene, game.camera);
	if (pause == true)
		return;

	if (collision_handler() != true)
		apply_friction();
	update_positions();

	requestAnimationFrame( animate );
}




function collision_handler() {
	make_collision_profile();
	var final_velocity_buffer = [];

	//take care of ball collisions first
	for (var i = 0; i < balls.length; i++) {
		if (balls[i].ball_collisions.length == 0)
			continue;
		else {
			if (balls[i].ball_collisions.length > 1) {
				console.log(balls[i].color);
				console.log(balls[balls[i].ball_collisions[0]].color);
			}
			var result = compute_multi_collision(i)
			final_velocity_buffer.push(result);
		}
	}

	
	for (var j = 0; j < final_velocity_buffer.length; j++) {

		balls[final_velocity_buffer[j].i].x_velocity = final_velocity_buffer[j].x;
		balls[final_velocity_buffer[j].i].y_velocity = final_velocity_buffer[j].y;
	}
	var wall_collision = false;
	for (var k = 0; k < balls.length; k++) {
		if (handle_wall_collisions(k) == true)
			wall_collision = true;
	}

	clear_collision_profile();
	return wall_collision;
}

function make_collision_profile() {
	var middle;
	for (var i = 0; i < balls.length; i++) {

		//check for collisions with wall
		middle = new THREE.Vector3();
		middle = get_middle(balls[i]);

		set_wall_collisions(i, middle.x, middle.y);
		
		for (var j = i + 1; j < balls.length; j++) {
			if (is_collision(i, j)) {
				balls[i].ball_collisions.push(j);
				balls[j].ball_collisions.push(i);
			}
		}
	}
}

//is there a collision between balls[i] and balls[j]
function is_collision(i, j) {
	var i_middle, j_middle;
	var dx, dy, dist;

	i_middle = get_middle(balls[i]);
	j_middle = get_middle(balls[j]);

	dx = i_middle.x - j_middle.x;
	dy = i_middle.y - j_middle.y;

	dist = Math.sqrt(dx*dx + dy*dy);

	if (dist <= 2 * ball_radius)
		return true;

	return false;
}


function handle_wall_collisions(index) {
	var collision = false;
	if (balls[index].left_wall == true || balls[index].right_wall == true) {
		balls[index].x_velocity = -(balls[index].x_velocity);
		collision = true;
	}

	if (balls[index].top_wall == true || balls[index].bottom_wall == true) {
		balls[index].y_velocity = -(balls[index].y_velocity);
		collision = true;
	}
	return collision;
} 


//compute the final velocity of balls[index] given its collision profile
function compute_multi_collision(index) {
	var final_x = 0;
	var final_y = 0;
	var xy_retval;

	for (var i = 0; i < balls[index].ball_collisions.length; i++) {
		xy_retval = compute_single_collision(index, balls[index].ball_collisions[i]);
		final_x += xy_retval[0];
		final_y += xy_retval[1];
	}

	return {
		"i": index,
		"x" : final_x,
		"y" : final_y
	};
}

function find_angle(vx, vy) {
	var t;
	if (vx < 0) {
		return Math.PI + Math.atan(vy/vx);
	}
	else if (vx > 0) {
		return Math.atan(vy/vx);
	}

	else { // vx == 0
		if (vy == 0) {
			return 0;
		}
		else if (vy > 0) {
			return Math.PI / 2;
		}
		else { //vy < 0
			return (3/2) * Math.PI;
		}
	}
}


//compute the final velocity of balls[i] given its collision with j
function compute_single_collision(i, j) {
	var i_middle = get_middle(balls[i]);
	var j_middle = get_middle(balls[j]);
	var dx = i_middle.x - j_middle.x;
	var dy = i_middle.y - j_middle.y;

	var phi;
	if (dx == 0.0)
		phi = Math.PI/2.0;
	else
		phi = Math.atan(dy/dx);

	var i_magnitude = Math.sqrt(balls[i].x_velocity*balls[i].x_velocity + balls[i].y_velocity*balls[i].y_velocity);
	var j_magnitude = Math.sqrt(balls[j].x_velocity*balls[j].x_velocity + balls[j].y_velocity*balls[j].y_velocity);

	var i_ang = find_angle(balls[i].x_velocity, balls[i].y_velocity);
	var j_ang = find_angle(balls[j].x_velocity, balls[j].y_velocity);

	var i_vxr = i_magnitude * Math.cos(i_ang - phi);
	var i_vyr = i_magnitude * Math.sin(i_ang - phi);
	var j_vxr = j_magnitude * Math.cos(j_ang - phi);
	var j_vyr = j_magnitude * Math.sin(j_ang - phi);

	var final_x = Math.cos(phi)*j_vxr + Math.cos(phi+Math.PI/2)*i_vyr;
	var final_y = Math.sin(phi)*j_vxr + Math.sin(phi+Math.PI/2)*i_vyr;

	return [final_x, final_y];
}



function set_wall_collisions(ball_index, middle_x, middle_y) {
	if (middle_x > (game.table_width / 2 - ball_radius)) {
		balls[ball_index].right_wall = true;
	}

	else if (middle_x < (-game.table_width / 2 + ball_radius)) {
		balls[ball_index].left_wall = true;
	}

	if (middle_y > (game.table_height / 2 - ball_radius)) {
		balls[ball_index].top_wall = true;
	}
	else if (middle_y < (-game.table_height / 2 + ball_radius)) {
		balls[ball_index].bottom_wall = true;
	}
}

function clear_collision_profile() {
	for (var i = 0; i < balls.length; i++) {
		balls[i].ball_collisions = [];
		balls[i].left_wall = false;
		balls[i].right_wall = false;
		balls[i].top_wall = false;
		balls[i].bottom_wall = false;
	}
}

function get_middle(ball) {
	var middle = new THREE.Vector3();
	middle.x = (ball.mesh.geometry.boundingBox.min.x + ball.mesh.geometry.boundingBox.max.x) / 2;
	middle.y = (ball.mesh.geometry.boundingBox.min.y + ball.mesh.geometry.boundingBox.max.y) / 2;
	middle.z = (ball.mesh.geometry.boundingBox.min.z + ball.mesh.geometry.boundingBox.max.z) / 2;

	ball.mesh.localToWorld(middle);
	return middle;
}