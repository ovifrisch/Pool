var animate_condition;


/* ENTRY POINT */
inititalize_scene();
create_balls();
initialize_game();
set_table();
animate_condition = true;
animate();

function animate() {
	collision_handler(); //checks intersection & updates velocities
	apply_friction();
	update_positions(); //updates the screen
	reposition_handler(); // in case collision is over-determined
	game.renderer.render(game.scene, game.camera);
	if (!animate_condition)
		return;
	requestAnimationFrame( animate );
}


function initialize_game() {
	for (var i = 0; i < balls.length; i++) {
		balls[i].mesh.position.z = ball_radius;
		balls[i].mesh.position.x = balls[i].start_x;
		balls[i].mesh.position.y = balls[i].start_y;
		balls[i].x_velocity = 0.0;
		balls[i].y_velocity = 0.0;
		game.scene.add(balls[i].mesh);
	}
}

//inititalize_game();

function inititalize_scene() {
	game.table_width = $("#pool_table").width();
	game.table_height = $("#pool_table").height();

	game.scene = new THREE.Scene();


	game.camera = new THREE.OrthographicCamera(game.table_width / - 2, game.table_width / 2, game.table_height / 2, game.table_height / - 2, -2*ball_radius, 10);
	game.controls = new THREE.OrbitControls(game.camera);
	game.controls.update();
	game.scene.add(game.camera);

	game.renderer = new THREE.WebGLRenderer(document.querySelector("#pool_table").getContext("webgl"), "mediump");
	game.renderer.setSize(game.table_width, game.table_height);

	game.light = new THREE.DirectionalLight( 0xffffff, 1 );
	game.light.position.set( 0, 0, 100);
	game.light.castShadow = true;
	game.scene.add(game.light);
}

function click_hit() {
	balls[0].x_velocity = 20;
}

function click_stop() {
	animate_condition = false;
}

function click_start() {
	animate_condition = true;
	animate();
}

function click_advance() {
	animate_condition = false;
	animate();
}

function set_table() {
	var geometry = new THREE.BoxGeometry( game.table_width, game.table_height, 0);
	var material = new THREE.MeshPhongMaterial({color: "green"});
	game.table = new THREE.Mesh(geometry, material);
	game.table.castShadow = true;
	game.table.receiveShadow = true;
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
		material = new THREE.MeshPhongMaterial({ color: game.ball_colors[i]});
		balls[i].mesh = new THREE.Mesh(geometry, material);
	}
}

function update_positions() {

	//update with raw velocities
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

