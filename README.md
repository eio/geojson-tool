# Instructions

Try it here: https://eio.github.io/geojson-tool/

Enter latitude and longitude (DMS or decimal).

Press the plus (+) button to add a new latlon input field.

Press the `Convert` button to generate GeoJSON Polygon output.

Accepted formats for Lat/Lon pairs:

	36°57'9.12" N
	110°4.21' W
	36 57 9 N
	110,4,21,W
	36 N
	110W
	36
	-110.0724

Note that the list of `[Longitude,Latitude]` pairs in a GeoJSON Polygon must start and end with the same exact point in order to properly close the polygon. Failing to do this will result in a warning popup.

![order](./doc/ss.png)

Copy your GeoJSON into http://geojson.io/ to click+drag the polygon's vertices
