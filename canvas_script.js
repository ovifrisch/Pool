var vertexShaderText = 
[
	'precision mediump float;',
	'',
	'attribute vec2 vertPosition;',
	'',
	'void main()',
	'{',
	'	gl_Position = vec4(vertPosition, 0.0, 1.0);',
	'}'
].join('\n');

var fragmentShaderText =
[
'precision mediump float;',
'',
'void main()',
'{',
'	gl_FragColor = vec4(0, 1.0, 1.0, 1.0);',
'}'
].join('\n');


main();

function main() {
	var canvas = document.querySelector("#pool_table");
	var gl = canvas.getContext("webgl");

	if (!gl) {
		alert("Unable to initialize WebGL. Your browser or machine may not support it.");
		return;
	}
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	var program = initShaderProgram(gl, vertexShaderText, fragmentShaderText);


	//generate circle triangle indices
	var circleVertices = [];
	for (var i = 0.0; i < 360; i+=1) {
		next_i = i + 1;
		if (i == 359) {
			next_i = 0;
		}

		var radian_1 = i * Math.PI / 180;
		var radian_2 = next_i * Math.PI / 180;


		var vert1 = [ Math.sin(radian_1) / 16, Math.cos(radian_1) / 8];
		var vert2 = [Math.sin(radian_2) / 16, Math.cos(radian_2) / 8];
		var vert3 = [0, 0];

		circleVertices = circleVertices.concat(vert1);
		circleVertices = circleVertices.concat(vert2);
		circleVertices = circleVertices.concat(vert3);
	}


	//do some buffer setup
	var circleVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circleVertices), gl.STATIC_DRAW);

	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	gl.vertexAttribPointer
	(
		positionAttribLocation,//Attribute Loaction
		2, //Number of elements per attribute, since its a vec2, its 2
		gl.FLOAT, //type of elements
		gl.FALSE, //should the data be normalized
		2 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
		0 //offset in bytes of the first component in the vertex attribute array
	);


	//draw buffer to the screen
	gl.enableVertexAttribArray(positionAttribLocation);
	gl.useProgram(program);
	gl.drawArrays(gl.TRIANGLES, 0, circleVertices.length / 2);
}

function initShaderProgram(gl, vsSource, fsSource) {
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderText);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderText);

	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
		return null;
	}

	return shaderProgram;
}

function loadShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

