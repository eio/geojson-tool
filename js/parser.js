function parseInput(lat, lon) {
	var latitude = null;
	var longitude = null;
	if (document.getElementById('EPSG4326').checked == true) {
		// handle standard EPSG:4326 coords
		// ex: [ 4°4'9.726", 50°26'48.144" ]
		var coords = new Coordinates();
		if (lat.length > 0) {
			var plat = parseCoordinateText(lat);
			// convert DMS input to decimal
			coords.latitude.setDMS(plat['degrees'],plat['minutes'],plat['seconds'],plat['direction']);
			latitude = coords.getLatitude();
		}
		if (lon.length > 0) {
			var plon = parseCoordinateText(lon);
			// convert DMS input to decimal
			coords.longitude.setDMS(plon['degrees'],plon['minutes'],plon['seconds'],plon['direction']);
			longitude = coords.getLongitude();
		}
	} else {
		// handle EPSG:3857 coords
		// ex: [ 453000, 6524000 ]
		longitude = parseFloat(lon)
		latitude = parseFloat(lat)
		// check if direction char has been provided
		var londir = lon.replace(/[^a-z]/gi, '');
		if (londir == 'W') {
			longitude = -longitude;
		}
		var latdir = lat.replace(/[^a-z]/gi, '');
		if (latdir == 'S') {
			latitude = -latitude;
		}
	}
	return {
		'lat': latitude,
		'lon': longitude
	}
}
function isAlpha(value){
  return /^[A-Z]$/i.test(value);
}
function isNumber(value) {
   return !isNaN(value);
}
function parseCoordinateText(coord) {
	// initialize the variables
	var degrees = 0;
	var minutes = 0;
	var seconds = 0;
	var direction = null;
	// remove any additional spaces
	// on either side of the input string
	coord = coord.trim()
	// First, check if parts are separated by whitespace or commas
	// even though the example/default text uses symbols which we'd prefer.
	// The following regex splits on a sequence of one or more commas or spaces,
	// so that e.g. multiple consecutive spaces or a comma+space sequence
	// do not produce empty elements in the results.
	var parts = coord.split(/[ ,]+/);
	// now that we have broken the user input into an array of parts,
	// we make some assumptions based on the length of that array.
	// if there are less than 3 parts, we assume that the user
	// has entered our example/default DMS format.
	// if there are 3 or more parts, we assume they have separated
	// degrees/minutes/seconds/direction by either spaces, commas,
	// or some combination of spaces and commas
	if (parts.length >= 3) {
		// since parts appear to be separated by spaces,
		// we can simply remove any additional notation
		coord = coord.replace('°','').replace("'",'').replace('"','')
		// first, check for the standard 4 parts (degrees/minutes/seconds/direction)
		if (parts.length == 4) {
			// since there are 4 parts separated by spaces
			// we naively assume they are the parts we expect
			degrees = parts[0];
			minutes = parts[1];
			seconds = parts[2];
			direction = parts[3];
		// otherwise, check for (degrees/minutes/direction)
		} else if (parts.length == 3) {
			if (isAlpha(parts[2])) {
				// let's hope that seconds were omitted intentionally
				// as with: 110°4.21' W
				degrees = parts[0];
				minutes = parts[1];
				// keep seconds set to default (0)
				direction = parts[2];
			} else {
				// let's hope that direction was omitted intentionally
				// as with: 36°57'9.12"
				degrees = parts[0];
				minutes = parts[1];
				seconds = parts[2];
				// keep direction set to default (null)
			}
		} else {
			alert("More than 4 parts entered for single coordinate.\nExpect failure.")
		}
	} else {
		// there are less than 3 separate parts
		// after we split on empty spaces.
		// this is expected if the user has entered a DMS coordinate
		// in the example/default format we provided.
		// let's hope they followed our example,
		// but perform some checks just in case.
		if (parts.length == 1) {
			// assume format of: 45W, 25N
			degrees = parseFloat(parts[0])
			direction = parts[0].replace(/[^a-z]/gi, '');
		} else if (parts.length == 2) {
			// check for format of: 45 W, 25 N
			if (isNumber(parts[0]) && isAlpha(parts[1])) {
				degrees = parts[0];
				direction = parts[1];
			} else {
				// assume format of provided UI example
				if (coord.indexOf('°') == -1) {
					alert("Degree symbol ° missing from input.\nExpect failure.");
				}
				if (coord.indexOf("'") == -1) {
					alert("Minutes symbol ' missing from input.\nExpect failure.");
				}
				degrees = coord.split('°')[0];
				minutes = coord.split('°')[1].split("'")[0];
				// seconds are not always included,
				// such as in: 36°57.182' N
				seconds = 0;
				if (coord.indexOf('"') > -1) {
					seconds = coord.split("'")[1].split('"')[0];
				}
				// https://stackoverflow.com/questions/18624457/how-do-i-extract-only-alphabet-from-a-alphanumeric-string
				// extract only the directional character (N,E,S,W)
				direction = coord.replace(/[^a-z]/gi, '');
				if (direction == '') {
					alert('Direction (N,E,S,W) missing from input.\nExpect failure.');
				}
			}
		}
	}
	// Number() will cast from string to int/float
	// and also remove any trailing spaces
	return {
		'degrees': Number(degrees),
		'minutes': Number(minutes),
		'seconds': Number(seconds),
		'direction': direction
	}
}