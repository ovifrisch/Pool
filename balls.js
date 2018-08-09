var table;
var ball_radius = 18;
var game = {
	table_width : 0,
	table_height: 0,
	table : null,
	friction : 0.015,
	ball_colors : [
		'white', "yellow", "blue", "red",
		"purple", "black", "green", "brown",
		"orange", "#F5F777", "#7779F7",
		"#F7777F", "#C377F7", "#F7BD77",
		"#77F783", "#99445A"
	],
	scene : null,
	camera : null,
	renderer : null,
	light : null,
	controls : null
};


var balls = [
	{
		mesh : null,
		start_x : -250,
		start_y: 0,
		x_velocity : 0.0,
		y_velocity : 0.0,
		ball_collisions : [],
		left_wall : false,
		right_wall: false,
		top_wall: false,
		bottom_wall: false,
		color: "white"
	},

	{
		mesh : null,
		start_x : 150,
		start_y: 0,
		x_velocity : 0.0,
		y_velocity : 0.0,
		ball_collisions : [],
		left_wall : false,
		right_wall: false,
		top_wall: false,
		bottom_wall: false,
		color: "yellow"
	},

	{
		mesh : null,
		start_x : 150 + (2*ball_radius) + 5,
		start_y: 0.0 + ball_radius,
		x_velocity : 0.0,
		y_velocity : 0.0,
		ball_collisions : [],
		left_wall : false,
		right_wall: false,
		top_wall: false,
		bottom_wall: false,
		color: "blue"
	},

	{
		mesh : null,
		start_x : 150 + (2*ball_radius) + 5,
		start_y: 0 - ball_radius,
		x_velocity : 0.0,
		y_velocity : 0.0,
		ball_collisions : [],
		left_wall : false,
		right_wall: false,
		top_wall: false,
		bottom_wall: false,
		color: "red"
	},

	{
		mesh : null,
		start_x : 150 + (4*ball_radius)  + 5,
		start_y: 0 + 2*ball_radius,
		x_velocity : 0.0,
		y_velocity : 0.0,
		ball_collisions : [],
		left_wall : false,
		right_wall: false,
		top_wall: false,
		bottom_wall: false,
		color: "purple"
	},

	{
		mesh : null,
		start_x : 150 + (4*ball_radius)  + 5,
		start_y: 0,
		x_velocity : 0.0,
		y_velocity : 0.0,
		ball_collisions : [],
		left_wall : false,
		right_wall: false,
		top_wall: false,
		bottom_wall: false,
		color: "black"
	},

	{
		mesh : null,
		start_x : 150 + (4*ball_radius)  + 5,
		start_y: 0 - 2*ball_radius,
		x_velocity : 0.0,
		y_velocity : 0.0,
		ball_collisions : [],
		left_wall : false,
		right_wall: false,
		top_wall: false,
		bottom_wall: false,
		color: "green"
	},

	{
		mesh : null,
		start_x : 150 + (6*ball_radius)  + 5,
		start_y: 0 + 3*ball_radius,
		x_velocity : 0.0,
		y_velocity : 0.0,
		ball_collisions : [],
		left_wall : false,
		right_wall: false,
		top_wall: false,
		bottom_wall: false,
		color: "brown"
	},

	{
		mesh : null,
		start_x : 150 + (6*ball_radius)  + 5,
		start_y: 0 + ball_radius,
		x_velocity : 0.0,
		y_velocity : 0.0,
		ball_collisions : [],
		left_wall : false,
		right_wall: false,
		top_wall: false,
		bottom_wall: false,
		color: "orange"
	},

	{
		mesh : null,
		start_x : 150 + (6*ball_radius) + 5,
		start_y: 0 - ball_radius,
		x_velocity : 0.0,
		y_velocity : 0.0,
		ball_collisions : [],
		left_wall : false,
		right_wall: false,
		top_wall: false,
		bottom_wall: false,
		color: "stripe yellow"
	},

	{
		mesh : null,
		start_x : 150 + (6*ball_radius) + 5,
		start_y: 0 - 3*ball_radius,
		x_velocity : 0.0,
		y_velocity : 0.0,
		ball_collisions : [],
		left_wall : false,
		right_wall: false,
		top_wall: false,
		bottom_wall: false,
		color: "stripe blue"
	},

	{
		mesh : null,
		start_x : 150 + (8*ball_radius) + 5,
		start_y: 0 + (4*ball_radius),
		x_velocity : 0.0,
		y_velocity : 0.0,
		ball_collisions : [],
		left_wall : false,
		right_wall: false,
		top_wall: false,
		bottom_wall: false,
		color: "stripe red"
	},

	{
		mesh : null,
		start_x : 150 + (8*ball_radius) + 5,
		start_y: 0 + (2*ball_radius),
		x_velocity : 0.0,
		y_velocity : 0.0,
		ball_collisions : [],
		left_wall : false,
		right_wall: false,
		top_wall: false,
		bottom_wall: false,
		color: "stripe purple"
	},

	{
		mesh : null,
		start_x : 150 + (8*ball_radius + 5),
		start_y: 0,
		x_velocity : 0.0,
		y_velocity : 0.0,
		ball_collisions : [],
		left_wall : false,
		right_wall: false,
		top_wall: false,
		bottom_wall: false,
		color: "stripe orange"
	},

	{
		mesh : null,
		start_x : 150 + (8*ball_radius + 5),
		start_y: 0 - (2*ball_radius),
		x_velocity : 0.0,
		y_velocity : 0.0,
		ball_collisions : [],
		left_wall : false,
		right_wall: false,
		top_wall: false,
		bottom_wall: false,
		color: "stripe green"
	},

	{
		mesh : null,
		start_x : 150 + (8*ball_radius + 5),
		start_y: 0 - (4*ball_radius),
		x_velocity : 0.0,
		y_velocity : 0.0,
		ball_collisions : [],
		left_wall : false,
		right_wall: false,
		top_wall: false,
		bottom_wall: false,
		color: "stripe brown"
	}
];



