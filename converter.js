function geoJsonToBigQuery(geojson) {
	var coords = geojson["coordinates"][0];
	// create the OpenLayers map element
	// with GeoJSON object visualized
	createMap(coords);
	// convert object to string and format it nicely for output
    document.getElementById("geojson").innerHTML = JSON.stringify(geojson,null,2);
    // convert object to string without formatting
    document.getElementById("geojson_uf").innerHTML = JSON.stringify(geojson);
    // convert coords to BigQuery format
    // init with prefix
    var bq_string = "POLYGON((";
    for (var i=0; i < coords.length; i++) {
    	var latlon = coords[i];
    	// append coord pair
    	bq_string += latlon[0] + "  " + latlon[1];
    	if (i == coords.length - 1) {
    		// don't add comma after last pair
    		break;
    	} else {
    		bq_string += ",";
    	}
    }
    // add suffix
    bq_string += "))";
    // output string in BigQuery format
    document.getElementById("bigquery").innerHTML = bq_string;
}
function convertPoints() {
	var coords = [];
	var inputs = document.getElementsByClassName("coords");
	for(var i=0; i < inputs.length; i++) {
		var pair = inputs[i];
		var lat = pair.getElementsByClassName("lat")[0].firstElementChild.value;
		var lon = pair.getElementsByClassName("lon")[0].firstElementChild.value;
		// attempt to parse input
		// and convert from DMS format to decimal
		var ll = parseInput(lat, lon);
		// check for empty latlon pairs
		if (lat == '' && lon == '') {
			// ignore fields entirely
			// if both lat and lon are empty
			continue;
		}
		// GeoJSON expects longitude first
		coords.push([ll.lon,ll.lat]);
	}
	// check if first and last points match
	var firstll = JSON.stringify(coords[0]);
	var lastll = JSON.stringify(coords[coords.length-1]);
	// warn user about potential mistakes
	// but carry on anyway
	if (firstll != lastll) {
		alert("Warning: first and last coordinate pairs do not match.")
	}
	if (coords.length < 4) {
		alert("Warning: polygons require at least 4 points.")
	}
	var geojson = {
        "type": "Polygon",
        "coordinates": [ coords ]
    }
    geoJsonToBigQuery(geojson);
}
function convertJson() {
	var jsonstring = document.getElementById("geojson").textContent;
	if (jsonstring == '') {
		jsonstring = document.getElementById("geojson_uf").textContent;
	}
	var geojson = JSON.parse(jsonstring);
	// check for full GeoJSON (if copied directly from http://geojson.io/)
	if (geojson["type"] == "FeatureCollection" && geojson["features"] != undefined) {
		geojson = geojson["features"][0]["geometry"];
	}
	geoJsonToBigQuery(geojson);
}
