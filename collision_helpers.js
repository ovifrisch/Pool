function clear_collision_profile() {
	for (var i = 0; i < balls.length; i++) {
		balls[i].ball_collisions = [];
		balls[i].left_wall = false;
		balls[i].right_wall = false;
		balls[i].top_wall = false;
		balls[i].bottom_wall = false;
	}
}

function set_wall_collisions(ball_index) {
	if (balls[ball_index].mesh.position.x > (game.table_width / 2 - ball_radius)) {
		balls[ball_index].right_wall = true;
	}

	else if (balls[ball_index].mesh.position.x < (-game.table_width / 2 + ball_radius)) {
		balls[ball_index].left_wall = true;
	}

	if (balls[ball_index].mesh.position.y > (game.table_height / 2 - ball_radius)) {
		balls[ball_index].top_wall = true;
	}
	else if (balls[ball_index].mesh.position.y < (-game.table_height / 2 + ball_radius)) {
		balls[ball_index].bottom_wall = true;
	}
}

//is there a collision between balls[i] and balls[j]
function is_collision(i, j) {
	var dx, dy, dist;

	dx = balls[i].mesh.position.x - balls[j].mesh.position.x;
	dy = balls[i].mesh.position.y - balls[j].mesh.position.y;

	dist = Math.sqrt(dx*dx + dy*dy);

	if (dist <= 2 * ball_radius + 1) {
		if (i == 0) {
			console.log("collision");
		}
		return true;
	}

	return false;
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

function solve_quadratic(a, b, c) {
	var sols = [];
	sols[0] = (-b + Math.sqrt((b*b) - (4*a*c))) / (2*a);
	sols[1] = (-b - Math.sqrt((b*b) - (4*a*c))) / (2*a);
	return sols;
}


/* This function takes in two balls
that are in collision, and repoistions them
by moving in opposite velocities until they
are exactly on edge */

/* what about the case where the
balls are going so fast that they
run into eachother but it is
not detected because they don't overlap
at the end of the frame. hopefully
for now we wont have balls going this fast*/
function reposition(i, j) {
	var dx = balls[i].mesh.position.x - balls[j].mesh.position.x;
	var dy = balls[i].mesh.position.y - balls[j].mesh.position.y;
	var dist = Math.sqrt(dx*dx + dy*dy);

	var incs = {
		ix: 0,
		iy: 0,
		jx: 0,
		jy: 0
	};
	set_increments(incs, i, j);

	while (dist < 2*ball_radius) {
		balls[i].mesh.position.x += incs.ix;
		balls[i].mesh.position.y += incs.iy;
		balls[j].mesh.position.x += incs.jx;
		balls[j].mesh.position.y += incs.jy;


		dx = balls[i].mesh.position.x - balls[j].mesh.position.x;
		dy = balls[i].mesh.position.y - balls[j].mesh.position.y;

		dist = Math.sqrt(dx*dx + dy*dy);
	}
}

/* sets the object incs to increments*/
function set_increments(incs, i, j) {
	var ivx = balls[i].x_velocity;
	var ivy = balls[i].y_velocity;
	var jvx = balls[j].x_velocity;
	var jvy = balls[j].y_velocity;
	var mag_ix, mag_iy, mag_jx, mag_jy;

	if (ivy == 0) {
		mag_iy = 0;
		if (ivx == 0) {
			mag_ix = 0;
		}
		else {
			mag_ix = 1;
		}
	}
	else {
		mag_ix = (Math.max(Math.abs(ivx), Math.abs(ivy)) == ivx) ? 1 : Math.abs(ivx) / Math.abs(ivy);
		mag_iy = mag_ix == 1 ? Math.abs(ivy) / Math.abs(ivx) : 1;
	}

	if (jvy == 0) {
		mag_jy = 0;
		if (jvx == 0) {
			mag_jx = 0;
		}
		else {
			mag_jx = 1;
		}
	}
	else {
		mag_jx = (Math.max(Math.abs(jvx), Math.abs(jvy)) == jvx) ? 1 : Math.abs(jvx) / Math.abs(jvy);
		mag_jy = mag_jx == 1 ? Math.abs(jvy) / Math.abs(jvx) : 1;
	}

	incs.ix = (ivx >= 0) ? -mag_ix : mag_ix;
	incs.iy = (ivy >= 0) ? -mag_iy : mag_iy;
	incs.jx = (jvx >= 0) ? -mag_jx : mag_jx;
	incs.jy = (jvy >= 0) ? -mag_jy : mag_jy;
}


