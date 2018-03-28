//Scene etc...
var scene, camera, renderer, light;

//table attributes
var table_width, table_height;

//table
var table;

//ball attributes
var ball_radius = 18;

//balls
var cue_ball, red_ball;
var cue_xvel = cue_yvel = 0;
var red_xvel = red_yvel = 0;




init_scene();
init_table();
create_balls();
add_balls_to_scene();
animate();

function click_hit() {
	cue_xvel = 20;
	cue_yvel = 0;
}

function click_reset() {
	cue_xvel = 0;
	cue_yvel = 0;
}

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
	cue_geometry.computeBoundingBox();
	red_geometry.fromGeometry(sphere_geometry);
	red_geometry.computeBoundingBox();

	var cue_material = new THREE.MeshPhongMaterial( { color: 0xffffff } );
	var red_material = new THREE.MeshPhongMaterial( { color: "red" } );

	cue_ball = new THREE.Mesh(cue_geometry, cue_material);
	red_ball = new THREE.Mesh(red_geometry, red_material);
}

function add_balls_to_scene() {
	scene.add(cue_ball);
	cue_ball.translateOnAxis(new THREE.Vector3(0, 0, 1), ball_radius);
	cue_ball.translateOnAxis(new THREE.Vector3(1, 0, 0), -100);

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

/* check if there is a collision between two balls*/
function detect_ball_collision() {

	//compute the distance between the two balls
	var red_middle = new THREE.Vector3();
	red_middle.x = (red_ball.geometry.boundingBox.max.x + red_ball.geometry.boundingBox.min.x) / 2;
	red_middle.y = (red_ball.geometry.boundingBox.max.y + red_ball.geometry.boundingBox.min.y) / 2;
	red_middle.z = (red_ball.geometry.boundingBox.max.z + red_ball.geometry.boundingBox.min.z) / 2;
	red_ball.localToWorld(red_middle);

	var cue_middle = new THREE.Vector3();
	cue_middle.x = (cue_ball.geometry.boundingBox.max.x + cue_ball.geometry.boundingBox.min.x) / 2;
	cue_middle.y = (cue_ball.geometry.boundingBox.max.y + cue_ball.geometry.boundingBox.min.y) / 2;
	cue_middle.z = (cue_ball.geometry.boundingBox.max.z + cue_ball.geometry.boundingBox.min.z) / 2;

	cue_ball.localToWorld(cue_middle);

	var dx = cue_middle.x - red_middle.x;
	var dy = cue_middle.y - red_middle.y;

	var dist = Math.sqrt(dx*dx + dy*dy);

	if (dist <= 2 * ball_radius) { //if there is a collision, update velocities


		var phi; // angle between the two ball centers
        // watch for vertical hits
        if(dx == 0.0)
            phi = Math.PI/2.0;
        else
            phi = Math.atan(dy/dx);

        // now compute the total velocities of the two balls
		cue_ball_total = Math.sqrt(cue_xvel*cue_xvel + cue_yvel*cue_yvel);
		red_ball_total = Math.sqrt(red_xvel*red_xvel + red_yvel*red_yvel);

        // find the angle of each ball's velocity
        var ang1 = find_angle(cue_xvel,cue_yvel);
        var ang2 = find_angle(red_xvel,red_yvel);

        // transform velocities into normal.tangential components
        var v1xr = cue_ball_total * Math.cos(ang1 - phi);
        var v1yr = cue_ball_total * Math.sin(ang1 - phi);
        var v2xr = red_ball_total * Math.cos(ang2 - phi);
        var v2yr = red_ball_total * Math.sin(ang2 - phi);

        // now find the final velocities (assuming equal mass)
        var v1fxr = v2xr;
        var v2fxr = v1xr;
        var v1fyr = v1yr;
        var v2fyr = v2yr;

        // reset the velocities
        cue_xvel = Math.cos(phi)*v1fxr + Math.cos(phi+Math.PI/2)*v1fyr;
        cue_yvel = Math.sin(phi)*v1fxr + Math.sin(phi+Math.PI/2)*v1fyr;
        red_xvel = Math.cos(phi)*v2fxr + Math.cos(phi+Math.PI/2)*v2fyr;
        red_yvel = Math.sin(phi)*v2fxr + Math.sin(phi+Math.PI/2)*v2fyr;

	}

}

/* for each ball check if there is a collision*/
function detect_collision() {
	var i, j;
	num_balls = 2;
	for (i = 0; i < num_balls; i++) {
		for (j = num_balls + 1; j < num_balls; j++) {
			detect_ball_collision();
		}
	}
}

function update_scene() {
	console.log(cue_xvel);

	var friction = 0.01;

	if (Math.abs(cue_xvel) <= friction*Math.cos(find_angle(cue_xvel, cue_yvel))) {
		cue_xvel = 0;
	}
	else {
		cue_xvel -= friction*Math.cos(find_angle(cue_xvel, cue_yvel));
	}

	if (Math.abs(cue_yvel) <= friction*Math.sin(find_angle(cue_xvel, cue_yvel))) {
		cue_yvel = 0;
	}
	else {
		cue_yvel -= friction*Math.sin(find_angle(cue_xvel, cue_yvel));
	}


	if (Math.abs(red_xvel) <= friction*Math.cos(find_angle(red_xvel, red_yvel))) {
		red_xvel = 0;
	}
	else {
		red_xvel -= friction*Math.cos(find_angle(red_xvel, red_yvel));
	}

	if (Math.abs(red_yvel) <= friction*Math.sin(find_angle(red_xvel, red_yvel))) {
		red_yvel = 0;
	}
	else {
		red_yvel -= friction*Math.sin(find_angle(red_xvel, red_yvel));
	}





	cue_ball.position.x += cue_xvel;
	cue_ball.position.y += cue_yvel;
	red_ball.position.x += red_xvel;
	red_ball.position.y += red_yvel;
}

function detect_wall_collision() {
	var middle1 = new THREE.Vector3();
	var middle2 = new THREE.Vector3();

	middle1.x = (cue_ball.geometry.boundingBox.max.x + cue_ball.geometry.boundingBox.min.x) / 2;
	middle1.y = (cue_ball.geometry.boundingBox.max.y + cue_ball.geometry.boundingBox.min.y) / 2;
	middle1.z = (cue_ball.geometry.boundingBox.max.z + cue_ball.geometry.boundingBox.min.z) / 2;

	middle2.x = (red_ball.geometry.boundingBox.max.x + red_ball.geometry.boundingBox.min.x) / 2;
	middle2.y = (red_ball.geometry.boundingBox.max.y + red_ball.geometry.boundingBox.min.y) / 2;
	middle2.z = (red_ball.geometry.boundingBox.max.z + red_ball.geometry.boundingBox.min.z) / 2;

	cue_ball.localToWorld(middle1);
	red_ball.localToWorld(middle2);

	if (middle1.x > table_width/2 - ball_radius || middle1.x < -table_width/2 + ball_radius) {
		cue_xvel = -(cue_xvel);
	}
	if (middle1.y > table_height/2 - ball_radius || middle1.y < -table_height/2 + ball_radius) {
		cue_yvel = -(cue_yvel);
	}

	if (middle2.x > table_width/2 - ball_radius || middle2.x < -table_width/2 + ball_radius) {
		red_xvel = -(red_xvel);
	}
	if (middle2.y > table_height/2 - ball_radius || middle2.y < -table_height/2 + ball_radius) {
		red_yvel = -(red_yvel);
	}
}


function animate() {
	renderer.render(scene, camera);
	detect_wall_collision();
	detect_ball_collision();
	update_scene();
	requestAnimationFrame( animate );
}