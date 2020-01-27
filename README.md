# Instructions

Try it here: https://eio.github.io/geojson-tool/

## Starting with Coordinate Pairs

Enter latitude and longitude (DMS or decimal).

Press the `Add Point` button to add a new latlon input field.

Press the `Convert Points Input` button to generate GeoJSON Polygon output.

Accepted formats for Lat/Lon pairs:

	36°57'9.12" N
	110°4.21' W
	36 57 9 N
	110,4,21,W
	36 57 9
	110 W
	36N
	-110.0724
	36

Note that the list of `[Longitude,Latitude]` pairs in a GeoJSON Polygon must start and end with the same exact point in order to properly close the polygon. Failing to do this will result in a warning popup.

## Starting with GeoJSON

Paste your properly formatted GeoJSON into the top GeoJSON field.

Press the button that says `Convert GeoJSON Input`.

Expected format:

	{
	  "type": "FeatureCollection",
	  "features": [
	    {
	      "type": "Feature",
	      "properties": {},
	      "geometry": {
	        "type": "Polygon",
	        "coordinates": [
	          [
	            [
	              132.1875,
	              -4.214943141390639
	            ],
	            [
	              105.1171875,
	              -18.312810846425442
	            ],
	            [
	              110.74218749999999,
	              -42.03297433244139
	            ],
	            [
	              152.578125,
	              -49.15296965617039
	            ],
	            [
	              163.4765625,
	              -12.897489183755892
	            ],
	            [
	              132.1875,
	              -4.214943141390639
	            ]
	          ]
	        ]
	      }
	    }
	  ]
	}

## Download the Map Image with Visualized GeoJSON

Press the button that says `Download Map Image` above the map's top left corner.

## External links

Copy your GeoJSON into http://geojson.io/ to click+drag the polygon's vertices
