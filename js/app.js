var mapData = [];

window.onload = function() {

		var tileInput = document.getElementById('tilepicker');
		var mapInput = document.getElementById('mappicker');
		var fileDisplayArea = document.getElementById('tileset');
		var textDisplayArea = document.getElementById('raw');

		tileInput.addEventListener('change', function(e) {
			var file = tileInput.files[0];
			var imageType = /image.*/;

			if (file.type.match(imageType)) {
				var reader = new FileReader();

				reader.onload = function(e) {
					fileDisplayArea.innerHTML = "";
					var img = new Image();
					img.src = reader.result;
					drawMap(img);
					fileDisplayArea.appendChild(img);
				}

				reader.readAsDataURL(file);
			} else {
				fileDisplayArea.innerHTML = "File not supported!"
			}
		});

		mapInput.addEventListener('change', function(e) {
			var file = mapInput.files[0];
			var textType = /text.*/;

			if (file.type.match(textType)) {
				var reader = new FileReader();

				reader.onload = function(e) {
					textDisplayArea.innerText = reader.result;
				}

				reader.readAsText(file);
			} else {
				textDisplayArea.innerText = "File not supported!"
			}
		});

}

function drawMap(image) {
	var ctx = document.getElementById('map').getContext('2d');
	var img = image;
	ctx.drawImage(img, 0, 0);
}

function loadMap(text) {
	mapData = [];

}
