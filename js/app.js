var mapData;
var tileSet;
var clickData = [];
var selectedTile = 0;

window.onload = function() {

		var tileInput = document.getElementById('tilepicker');
		var mapInput = document.getElementById('mappicker');
		var palette = document.getElementById('tileset');
		var textDisplayArea = document.getElementById('raw');
		var canvas = document.getElementById('map');

		var clicking = false;

		// If a new tileset is loaded, reload the tileset and the canvas
		tileInput.addEventListener('change', function(e) {
			var file = tileInput.files[0];
			var imageType = /image.*/;

			if (file.type.match(imageType)) {
				var reader = new FileReader();

				reader.onload = function(e) {
					palette.innerHTML = "";
					tileSet = new Image();
					tileSet.src = reader.result;
					drawMap();
					//palette.appendChild(tileSet);
					palette.getContext('2d').drawImage(tileSet, 0, 0);
				}

				reader.readAsDataURL(file);
			} else {
				palette.innerHTML = "File not supported!"
			}
		});

		// If new map data is loaded, reload the map data and the canvas
		mapInput.addEventListener('change', function(e) {
			var file = mapInput.files[0];
			var textType = /text.*/;

			if (file.type.match(textType)) {
				var reader = new FileReader();

				reader.onload = function(e) {
					//textDisplayArea.innerText = reader.result;
					loadMap(reader.result);
					textDisplayArea.innerText = mapToString(mapData.map);
				}

				reader.readAsText(file);
			} else {
				textDisplayArea.innerText = "File not supported!"
			}
		});

		canvas.addEventListener('mousedown', function(e) {
			var mouseX = e.pageX - this.offsetLeft;
			var mouseY = e.pageY - this.offsetTop;

			addClick(mouseX, mouseY, true);

			clicking = true;

			console.log("You clicked the canvas at " + mouseX + " " + mouseY);
			updateMap();
		});

		canvas.addEventListener('mousemove', function(e) {
			if(clicking) {
				addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, false);
				updateMap();
			}
		});

		canvas.addEventListener('mouseup', function(e) {
			clicking = false;
		});

		palette.addEventListener('mousedown', function(e) {
			var mouseX = e.pageX - this.offsetLeft;
			var mouseY = e.pageY - this.offsetTop;

			selectedTile = Math.floor((mouseX - 1) / 32);
		});

}

function drawMap() {
	var ctx = document.getElementById('map').getContext('2d');

	if(tileSet === undefined) {
		console.log("No tileset loaded. drawMap() failed.");
		return;
	}

	if(mapData === undefined) {
		console.log("No map data loaded. drawMap() failed.");
		return;
	}

	var currTile;
	for(var y = 0; y < mapData.height; y++) {
		for(var x = 0; x < mapData.width; x++) {
			currTileIndex = mapData.map[x + mapData.width * y];
			ctx.drawImage(tileSet, 32 * currTileIndex, 0, 32, 32, 32 * x, 32 * y, 32, 32);
		}
	}

}

function loadMap(text) {
	mapData = JSON.parse(text);
	var canvas = document.getElementById('map');
	canvas.height = 32 * mapData.height;
	canvas.width = 32 * mapData.width;
	drawMap();
}

function addClick(x, y, dragging) {
	clickData.push([x, y, dragging]);
}

function updateMap() {
	var ctx = document.getElementById('map').getContext('2d');
	var cx, cy;
	for(var i = 0; i < clickData.length; i++) {
		if(clickData[i][0] == 1 || clickData[i][1] == 1) continue;
		if(clickData[i][0] > 32 * mapData.width || clickData[i][1] > 32 * mapData.height) continue;

		cx = Math.floor((clickData[i][0] - 1) / 32);
		cy = Math.floor((clickData[i][1] - 1) / 32);

		mapData.map[cx + mapData.width * cy] = selectedTile;
		ctx.drawImage(tileSet, 32 * selectedTile, 0, 32, 32, 32 * cx, 32 * cy, 32, 32);

		//document.getElementById('raw').innerText = JSON.stringify(mapData, null, "\t");
		document.getElementById('raw').innerText = mapToString(mapData.map);
	}
	clickData = new Array();
}

function mapToString() {
	var str = "";
	var z = 0;
	for (var y = 0; y < mapData.height; y++) {
		for (var x = 0; x < mapData.width; x++, z++) {
			str += mapData.map[z] + " ";
		}
		str += "\n";
	}
	return str;
}
