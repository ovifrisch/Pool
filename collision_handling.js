
function collision_handler() {
	make_collision_profile();
	var final_velocity_buffer = [];

	//take care of ball collisions first
	for (var i = 0; i < balls.length; i++) {
		if (balls[i].ball_collisions.length == 0)
			continue;
		else
			final_velocity_buffer.push(compute_multi_collision(i));
	}

	for (var j = 0; j < final_velocity_buffer.size; j++) {
		balls[final_velocity_buffer[i][0]].x_velocity = final_velocity_buffer[i][1];
		balls[final_velocity_buffer[i][0]].y_velocity = final_velocity_buffer[i][2];
	}

	for (var k = 0; k < balls.length; k++) {
		handle_wall_collisions(k);
	}

	clear_collision_profile();
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
	if (balls[index].left == true || balls[index].right == true) {
		balls[index].x_velocity = -(balls[index].x_velocity);
	}

	if (balls[index].top == true || balls[index].bottom == true) {
		balls[index].y_velocity = -(balls[index].y_velocity);
	}
} 


//compute the final velocity of balls[index] given its collision profile
function compute_multi_collision(index) {
	var final_x, final_y;
	var xy_retval;

	for (var i = 0; i < balls[i].ball_collisions.length; i++) {
		xy_retval = compute_single_collision(i, );
		final_x += xy_retval[0];
		final_y += xy_retval[1];
	}

	return [index, final_x, final_y];
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

	var i_vxr = i_total * Math.cos(i_ang - phi);
	var i_vyr = i_total * Math.sin(i_ang - phi);
	var j_vxr = j_total * Math.cos(j_ang - phi);
	var j_vyr = j_total * Math.sin(j_ang - phi);

	var final_x = Math.cos(phi)*j_vxr + Math.cos(phi+Math.PI/2)*i_vyr;
	var final_y = Math.sin(phi)*j_vxr + Math.sin(phi+Math.PI/2)*i_vyr;

	return [final_x, final_y];
}

