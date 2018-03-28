
//table
var table;

//ball attributes
var ball_radius = 18;


var game = {
	table_width : 0,
	table_height: 0,
	table : null,
	friction : 0.01,
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

function click_hit() {
	balls[0].x_velocity += 10;
	//balls[0].y_velocity += 10;
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
	for (var i = 0; i < balls.length; i++) {
		balls[i].mesh.translateOnAxis(new THREE.Vector3(0, 0, 1), ball_radius);
		balls[i].mesh.translateOnAxis(new THREE.Vector3(1, 0, 0), -370 + 50 * i);
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
			if (balls[i].y_velocity >= 0) {
				friction_y = game.friction;
			}
			else {
				friction_y = -game.friction;
			}
		}
		else if (balls[i].y_velocity == 0) {
			friction_y = 0;
			if (balls[i].x_velocity >= 0) {
				friction_x = game.friction;
			}
			else {
				friction_x = -game.friction;
			}
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


function check_wall_collisions() {
	var middle = new THREE.Vector3();
	for (var i = 0; i < balls.length; i++) {
		middle = get_middle(balls[i]);

		if (middle.x > game.table_width/2 - ball_radius || middle.x < -game.table_width/2 + ball_radius) {
			balls[i].x_velocity = -(balls[i].x_velocity);
		}

		if (middle.y > game.table_height/2 - ball_radius || middle.y < -game.table_height/2 + ball_radius) {
			balls[i].y_velocity = -(balls[i].y_velocity);
		}
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

function check_ball_collisions() {
	var i_middle, j_middle;
	var dx, dy, dist;
	var phi;
	var i_total, j_total, i_ang, j_ang;
	var i_vxr, i_vyr, j_vxr, j_vyr;

	for (var i = 0; i < balls.length; i++) {
		for (var j = i + 1; j < balls.length; j++) {
			i_middle = get_middle(balls[i]);
			j_middle = get_middle(balls[j]);

			dx = i_middle.x - j_middle.x;
			dy = i_middle.y - j_middle.y;

			dist = Math.sqrt(dx*dx + dy*dy);

			if (dist <= 2 * ball_radius) { //BOING

				if (dx == 0.0)
					phi = Math.PI/2.0;
				else
					phi = Math.atan(dy/dx);

				i_total = Math.sqrt(balls[i].x_velocity*balls[i].x_velocity + balls[i].y_velocity*balls[i].y_velocity);
				j_total = Math.sqrt(balls[j].x_velocity*balls[j].x_velocity + balls[j].y_velocity*balls[j].y_velocity);

				i_ang = find_angle(balls[i].x_velocity, balls[i].y_velocity);
				j_ang = find_angle(balls[j].x_velocity, balls[j].y_velocity);

				i_vxr = i_total * Math.cos(i_ang - phi);
				i_vyr = i_total * Math.sin(i_ang - phi);
				j_vxr = j_total * Math.cos(j_ang - phi);
				j_vyr = j_total * Math.sin(j_ang - phi);


				balls[i].x_velocity = Math.cos(phi)*j_vxr + Math.cos(phi+Math.PI/2)*i_vyr;
				balls[i].y_velocity = Math.sin(phi)*j_vxr + Math.sin(phi+Math.PI/2)*i_vyr;
				balls[j].x_velocity = Math.cos(phi)*i_vxr + Math.cos(phi+Math.PI/2)*j_vyr;
				balls[j].y_velocity = Math.sin(phi)*i_vxr + Math.sin(phi+Math.PI/2)*j_vyr;
			}
		}
	}
}


function animate() {
	game.renderer.render(game.scene, game.camera);
	check_wall_collisions();
	check_ball_collisions();
	apply_friction();
	update_positions();
	requestAnimationFrame( animate );
}