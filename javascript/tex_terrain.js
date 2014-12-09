$(".slider_area_terrain" ).click(function(evt) {
	var x = Math.min(Math.max(evt.pageX - $(this).offset().left, 0), 255);
	
	createGradientSlider(x, 'ffffff', 'terrain');
	
	updateTexture();
	//alert( "Position: " + x );
});

$(".slider_area_terrain").droppable({
	out: function (event, ui) {
		//document.write($(ui.draggable).position().left);
		if ($(ui.draggable).position().left < 250)
			$(ui.draggable).remove();
    }
});

createGradientSlider(0, 'e6d7c3', 'terrain');
createGradientSlider(96, '262626', 'terrain');
createGradientSlider(178, '665e52', 'terrain');

function updateTerrain(){
	var colors = [];
	var colors_hex = [];
	
	$(".slider_terrain").each(function( index ) {
		var pos = $(this).css("left");
		pos = pos.substring(0, pos.length - 2);
		var percentage = Math.min(parseFloat(pos), 256) / 2.56;
	
		colors.push([$(this).css("background-color").match(/\d+/g), percentage]);
		colors_hex.push([rgb2hex($(this).css("background-color")), percentage]);
	});


	var gradient_text = 'linear-gradient(to right';
	colors_hex.forEach(function(col) {
		gradient_text += ', ' + col[0] + ' ' + Math.max(col[1],0) + '%';
	});
	$(".terrain_gradient_preview").css('background', gradient_text); // W3C




	console.log(colors);
	for (var c = 0; c < colors.length; c++) {
		colors[c][0][0] = parseFloat(colors[c][0][0]);
		colors[c][0][1] = parseFloat(colors[c][0][1]);
		colors[c][0][2] = parseFloat(colors[c][0][2]);
		colors[c][1] = colors[c][1] / 100;
		console.log("r: " + colors[c][0][0] +  " g:" + colors[c][0][1] + " b:" + colors[c][0][2] +" percentage: "  + colors[c][1]);
	}


	var persistence = 0.6;
	var scale = 10;
	var seed = 100;
	var percentage = 0.80;

	setTerrainNoise(colors, "FractalNoise", 7, persistence, scale, seed, percentage);
}


function setTerrainNoise(colors, type, octaves, persistence, scale, seed, percentage)
{
	
	
	var c = document.getElementById("texture_preview");
	var ctx = c.getContext("2d");

	var max_w = 512, max_h = 512;
	
	var S = new SimplexNoise(seed);
	
	var imgData = ctx.getImageData(0,0, max_w, max_h);
	var d = imgData.data;
		
	var scale_s = scale;	
		
	
	var before = new Date().getTime();

	var noise_type;
	if (type == "PerlinNoise")
		noise_type = NoiseTypeEnum.PERLINNOISE;
	else if (type == "FractalNoise")
		noise_type = NoiseTypeEnum.FRACTALNOISE;
	else if (type == "Turbulence")
		noise_type = NoiseTypeEnum.TURBULENCE;
	console.log(colors[1][1]);
	console.log(colors[1][0][2]);
	for (var y=0; y<max_h; y++)
	for (var x=0; x<max_w; x++){
		// octaves, persistence, scale, loBound, hiBound, x, y
		var v = S.simplex(noise_type, octaves, persistence, percentage, scale_s, x, y);
		var i = (x + y*max_w) * 4;

		for (var col = 1; col < colors.length-1; col++) {
			if (colors[col-1][1] < v){
				d[i]   = v * colors[col-1][0][0] + ((1.0-v) * colors[col][0][0]);
				d[i+1] = v * colors[col-1][0][1] + ((1.0-v) * colors[col][0][1]);
				d[i+2] = v * colors[col-1][0][2] + ((1.0-v) * colors[col][0][2]);
				d[i+3] = 255;
				col = colors.length;
			}
		}
	}
	
	var after = new Date().getTime();
	console.log(after - before);

	ctx.putImageData(imgData, 0, 0);
	
}