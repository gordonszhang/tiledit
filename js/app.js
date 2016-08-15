var mapData;
var tileSet;
var clickData = [];
var selectedTile = 0;
var selectedTool = 0;

var Tool = {
	DRAW : 0,
	FILL : 1
}

window.onload = function() {

		var tileInput = document.getElementById('tilepicker');
		var mapInput = document.getElementById('mappicker');
		var palette = document.getElementById('tileset');
		var textDisplayArea = document.getElementById('raw');
		var canvas = document.getElementById('map');
		var width = document.getElementById('width');
		var height = document.getElementById('height');

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

			if(selectedTool == Tool.DRAW) applyDraw();
			if(selectedTool == Tool.FILL) applyFill();
		});

		canvas.addEventListener('mousemove', function(e) {
			if(clicking) {
				addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, false);
				if(selectedTool == Tool.DRAW) applyDraw();
				//if(currentTool == Tool.FILL) applyFill();
			}
		});

		canvas.addEventListener('mouseup', function(e) {
			clicking = false;
		});

		// Change selected tile on click
		palette.addEventListener('mousedown', function(e) {
			var mouseX = e.pageX - this.offsetLeft;
			var mouseY = e.pageY - this.offsetTop;
			selectedTile = Math.floor((mouseX - 1) / 32);
		});

		// Resize canvas if dimensions are changed
		width.addEventListener('change', function() {
			resizeMap(true, this.value);
			textDisplayArea.innerText = mapToString(mapData.map);
			canvas.height = 32 * mapData.height;
			canvas.width = 32 * mapData.width;
			drawMap();
		});

		height.addEventListener('change', function() {
			resizeMap(false, this.value);
			textDisplayArea.innerText = mapToString(mapData.map);
			canvas.height = 32 * mapData.height;
			canvas.width = 32 * mapData.width;
			drawMap();
		});

		document.getElementById('draw').addEventListener('click', function() {
			selectedTool = Tool.DRAW;
		});


		document.getElementById('fill').addEventListener('click', function() {
			selectedTool = Tool.FILL;
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

	document.getElementById('width').value = mapData.height;
	document.getElementById('height').value = mapData.width;

	var canvas = document.getElementById('map');
	canvas.height = 32 * mapData.height;
	canvas.width = 32 * mapData.width;

	drawMap();
}

function addClick(x, y, dragging) {
	clickData.push([x, y, dragging]);
}

// Called when the draw tool is used to modify the canvas
function applyDraw() {
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

// Called when the fill tool is used to modify the canvas
function applyFill() {
	var ctx = document.getElementById('map').getContext('2d');
	var cx, cy;

	if(clickData[0][0] == 1 || clickData[0][1] == 1) return;
	if(clickData[0][0] > 32 * mapData.width || clickData[0][1] > 32 * mapData.height) return;

	cx = Math.floor((clickData[0][0] - 1) / 32);
	cy = Math.floor((clickData[0][1] - 1) / 32);

	recursiveFill(selectedTile, mapData.map[cx + mapData.width * cy], cx, cy);
	drawMap();

	//document.getElementById('raw').innerText = JSON.stringify(mapData, null, "\t");
	document.getElementById('raw').innerText = mapToString(mapData.map);

	clickData = new Array();
}

function recursiveFill(tile, replaced, x, y) {
	mapData.map[x + mapData.width * y] = tile;
	var left = mapData.map[x - 1 + mapData.width * y];
	var right = mapData.map[x + 1 + mapData.width * y];
	var up = mapData.map[x + mapData.width * (y - 1)];
	var down = mapData.map[x + mapData.width * (y + 1)];

	if(x > 0) {
		if(left == replaced && left != tile) recursiveFill(tile, replaced, x - 1, y);
	}
	if(x < mapData.width - 1) {
		if(right == replaced && right != tile) recursiveFill(tile, replaced, x + 1, y);
	}
	if(y > 0) {
		if(up == replaced && up != tile) recursiveFill(tile, replaced, x, y - 1);
	}
	if(y < mapData.height - 1) {
		if(down == replaced && down != tile) recursiveFill(tile, replaced, x, y + 1);
	}
	return;
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

function resizeMap(isWidth, newVal) {
	var newMap = [];
	var larger = false;
	if(isWidth) {
		for(var y = 0; y < mapData.height; y++) {
			for(var x = 0; x < newVal; x++) {
				if(x >= mapData.width) newMap.push(0);
				else newMap.push(mapData.map[x + mapData.width * y]);
			}
		}

		mapData.map = newMap;
		mapData.width = newVal;
	}

	else {
		for(var y = 0; y < newVal; y++) {
			if(y >= mapData.height) {
				for(var x = 0; x < mapData.width; x++) {
					newMap.push(0);
				}
			}
			else {
				for(var x = 0; x < mapData.width; x++) {
					newMap.push(mapData.map[x + mapData.width * y]);
				}
			}
		}

		mapData.map = newMap;
		mapData.height = newVal;
	}
}

function exportJson() {
	var data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mapData));
	var dlAnchorElem = document.getElementById('downloadAnchorElem');
	dlAnchorElem.setAttribute("href",     data     );
	dlAnchorElem.setAttribute("download", "map.json");
	dlAnchorElem.click();
}
