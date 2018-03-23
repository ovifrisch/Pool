main();

function main() {
	var canvas = document.querySelector("#myCanvas");
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "#FF0000";
	ctx.fillRect(0,0,150,75);
}