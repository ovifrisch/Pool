
/* handles all things collisions. called by main render loop */
function collision_handler() {

	/* find collisions */
	make_collision_profile();
	var final_velocity_buffer = []; // will store final velocities of balls involved in collisions

	/* for each ball, if collision, add to buffer */
	for (var i = 0; i < balls.length; i++) {
		var result = compute_multi_collision(i);

		/* ball i is in collision */
		if (result.index != -1) {
			final_velocity_buffer.push(result);
		}
	}

	/* update velocities */
	for (var j = 0; j < final_velocity_buffer.length; j++) {
		balls[final_velocity_buffer[j].index].x_velocity = final_velocity_buffer[j].x;
		balls[final_velocity_buffer[j].index].y_velocity = final_velocity_buffer[j].y;
	}

	/* reposition balls edge to edge */

	/* handle wall collisions */
	var wall_collision = false;
	for (var k = 0; k < balls.length; k++) {
		if (handle_wall_collisions(k) == true)
			wall_collision = true;
	}

	/* reset collisions */
	clear_collision_profile();
}

function reposition_handler() {
	for (var i = 0; i < balls.length; i++) {
		for (var j = i + 1; j < balls.length; j++) {
			if (is_collision(i, j)) {
				reposition(i, j); // updates the positions
			}
		}
	}
}

/*  */
function make_collision_profile() {
	var middle;
	for (var i = 0; i < balls.length; i++) {

		set_wall_collisions(i);
		
		for (var j = i + 1; j < balls.length; j++) {
			if (is_collision(i, j)) {
				balls[i].ball_collisions.push(j);
				balls[j].ball_collisions.push(i);
			}
		}
	}
}

//compute the final velocity of balls[index] given its collision profile
function compute_multi_collision(index) {
	var num_colls = balls[index].ball_collisions.length;


	if (num_colls  == 0)
		return {"index": -1, "x": 0, "y": 0};

	var final_x = 0;
	var final_y = 0;
	var xy_retval;

	for (var i = 0; i < num_colls; i++) {
		xy_retval = compute_single_collision(index, balls[index].ball_collisions[i]);
		final_x += xy_retval[0];
		final_y += xy_retval[1];
	}
	if (Math.abs(final_x) < 0.01)
		final_x = 0.0;
	if (Math.abs(final_y) < 0.01)
		final_y = 0.0;

	return {
		"index": index,
		"x" : final_x,
		"y" : final_y
	};
}

//compute the final velocity of balls[i] given its collision with j
function compute_single_collision(i, j) {
	var dx = balls[i].mesh.position.x - balls[j].mesh.position.x;
	var dy = balls[i].mesh.position.y - balls[j].mesh.position.y;

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



function handle_wall_collisions(index) {
	var collision = false;
	if (balls[index].left_wall) {
		balls[index].x_velocity = Math.abs(balls[index].x_velocity);
	}

	if (balls[index].right_wall) {
		balls[index].x_velocity = -Math.abs(balls[index].x_velocity);
	}

	if (balls[index].top_wall) {
		balls[index].y_velocity = -Math.abs(balls[index].y_velocity);
	}

	if (balls[index].bottom_wall) {
		balls[index].y_velocity = Math.abs(balls[index].y_velocity);
	}
}


