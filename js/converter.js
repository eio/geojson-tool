// starting point for `Convert Points Input` button
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
	// enforce first and last points being the same
	if (firstll != lastll) {
		// append first point to end of coords list
		coords.push(coords[0]);
		// alert("Warning: first and last coordinate pairs do not match.")

	}
	if (coords.length < 4) {
		alert("Warning: polygons require at least 4 points.")
	}
	var geojson = toGeoJSON(coords);
    geoJsonToOutput(geojson);
}
function toGeoJSON(coords) {
	var geojson = {
		"type": "FeatureCollection",
		"features": [
		    {
				"type": "Feature",
				"properties": {},
				"geometry": {
					"type": "Polygon",
					"coordinates": [ coords ]
				}
		    }
		]
	};
	// check switch toggle for input coordinate system
	// and convert if necessary
	if (document.getElementById('EPSG4326').checked != true) {
		geojson = convertEPSG3857to4326(geojson);
	}

	return geojson;
}
// convertPairs works on pairs of latitudes and longitues to create a polygon.
// Made to handle cases where people send a request like:
//   LAT between -9.646536, 6.998524, LON between 94.51485, 140.9909
function convertPairs() {
	let lats = document.getElementsByName("lats")[0].value.split(","),
		lons = document.getElementsByName("lons")[0].value.split(",");

	if(lats.length !== lons.length) {
		alert(
			"not the equal number of latitudes("+ lats.length
			+") and longitudes("+ lons.length +")");
	}

	let coords = [];
	for(const lat of lats) {
		for(const lon of lons) {
			let ll = parseInput(lat, lon)
			coords.push([ll.lon, ll.lat])
		}
	}
	if (coords.length < 4) {
		alert("Warning: polygons require at least 4 points.")
	}
	coords = normalizePolygon(coords);
	coords.push(coords[0]) // Close polygon by looping back to itself

	geoJsonToOutput(toGeoJSON(coords));
}
// Normalizes the order of changes in a polygon
// Essentially, when you are making a polygon if you don't traverse
// the changes in order you end up with coordinates crossing themselves,
// turning them into a hour-glass shape - X.
function normalizePolygon(coords) {
	// A hard-coded fix for a box which is traversed by doing all lats and
	// then all lons, by swapping 3/4 we'll get the changes in sequence
	// and it'll look good
	if (coords.length === 4) {
		const third = coords[2];
		coords[2] = coords[3];
		coords[3] = third;
	}

	return coords;
}
// starting point for `Convert GeoJSON Input` button
function convertJson() {
	var jsonstring = document.getElementById("geojson").textContent;
	if (jsonstring == '') {
		jsonstring = document.getElementById("geojson_uf").textContent;
	}
	try {
		var geojson = JSON.parse(jsonstring);
		// check for full GeoJSON (if copied directly from http://geojson.io/)
		if (geojson["type"] == "FeatureCollection" && geojson["features"] != undefined) {
			// geojson is formatted correctly already
			// so we don't need to do anything
		} else if (geojson["type"] == "Feature" && geojson["geometry"] != undefined) {
			geojson = {
				"type": "FeatureCollection",
				"features": [
					geojson
				]
			}
		} else if (geojson["type"] == "Polygon" && geojson["coordinates"] != undefined) {
			geojson = {
				"type": "FeatureCollection",
				"features": [{
					"type": "Feature",
					"properties": {},
					"geometry": geojson
				}]
			}
		} else {
			alert("Warning: GeoJSON is not formatted correctly.")
		}
		// check switch toggle for input coordinate system
		// and convert if necessary
		if (document.getElementById('EPSG4326').checked != true) {
			geojson = convertEPSG3857to4326(geojson);
		}
		geoJsonToOutput(geojson);
	} catch(error) {
		alert("Warning: GeoJSON is not formatted correctly. \n" + error);
	}
}
// starting point for `Convert BigQuery Input` button
function convertBigQuery() {
	var bqstring = document.getElementById("bigquery").textContent;
	// get rid of the unimportant BigQuery syntax parts
	bqstring = bqstring.replace('POLYGON','').replace('((','').replace('))','');
	var points = bqstring.split(',');
	var coords = [];
	for (var i=0; i < points.length; i++) {
		var pair = points[i];
		// trim any trailing whitespace
		pair = pair.trim();
		// separate lon and lat via regexp
		// split on one (or more) space characters
		pair = pair.split(/\s+/);
		console.log()
		var lon = parseFloat(pair[0]);
		var lat = parseFloat(pair[1]);
		console.log(lon, lat)
		coords.push([lon,lat]);
	}
	var geojson = {
		"type": "FeatureCollection",
		"features": [
		    {
				"type": "Feature",
				"properties": {},
				"geometry": {
					"type": "Polygon",
					"coordinates": [ coords ]
				}
		    }
		]
	};
	geoJsonToOutput(geojson);
}

// convert GeoJSON to BigQuery, and
// output GeoJSON (formatted & unformatted) and BigQuery text, and
// visualize area on the map
function geoJsonToOutput(geojson) {
	// for now, only support one polygon feature at a time
	var geometry = geojson["features"][0]["geometry"];
	var coords = geometry["coordinates"][0];
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
// convert from EPSG:3857 to EPSG:4326
function convertEPSG3857to4326(geojson) {
	var geom = [];
	var vectorSource = new ol.source.Vector({
		features: (new ol.format.GeoJSON()).readFeatures(geojson)
	});
	vectorSource.forEachFeature(function(feature) {
		geom.push(new ol.Feature(feature.getGeometry().clone().transform('EPSG:3857', 'EPSG:4326')));
	});
	var writer = new ol.format.GeoJSON();
	var geoJsonStr = writer.writeFeatures(geom);
	geojson = JSON.parse(geoJsonStr);
	console.log(geojson)
	return geojson;
}
