var styles = {
  'Polygon': new ol.style.Style({
    stroke: new ol.style.Stroke({
      // lineDash: [4],
      color: 'black', // geojson.io uses: '#555555'
      width: 1.8
    }),
    fill: new ol.style.Fill({
      color: 'rgba(0, 0, 0, 0.25)'
    })
  })
};

var styleFunction = function(feature) {
  return styles[feature.getGeometry().getType()];
};

var createMap = function(coords) {
  // clear the existing map element
  document.getElementById('map').innerHTML = '';
  // default OSM projection is EPSG:3857 but `coords` arg is in standard EPSG:4326 format
  // https://gis.stackexchange.com/questions/48949/epsg-3857-or-4326-for-googlemaps-openstreetmap-and-leaflet
  // https://gis.stackexchange.com/questions/152245/geojson-and-osm-layers-with-different-projection
  var convertedCoords = [];
  for (var i=0; i<coords.length; i++) {
    var coord = coords[i];
    // var lon = coord[0];
    // var lat = coord[1];
    // // Transforms a coordinate from longitude/latitude to a different projection.
    // // https://openlayers.org/en/latest/apidoc/module-ol_proj.html#.fromLonLat
    var newCoord = ol.proj.fromLonLat(coord, "EPSG:3857");
    convertedCoords.push(newCoord);
  }

  var geojsonObject = {
    'type': 'FeatureCollection',
    // 'crs': {
    //   'type': 'name',
    //   'properties': {
    //     'name': 'EPSG:4326' // default is 'EPSG:3857'
    //   }
    // },
    'features': [{
      'type': 'Feature',
      'properties': {},
      'geometry': {
        'type': 'Polygon',
        'coordinates': [convertedCoords]
      }
    }]
  };

  var vectorSource = new ol.source.Vector({
    features: (new ol.format.GeoJSON()).readFeatures(geojsonObject)
  });

  var vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    style: styleFunction,
    // format: new GeoJSON({
    //   internalProjection: new Projection("EPSG:4326"),
    //   externalProjection: new Projection("EPSG:3857")
    // })
  });

  var view = new ol.View({
    // projection: 'EPSG:4326',
    // center: [0, 40],
    // // set to first GeoJSON coordinate
    // // to be roughly in the right area
    center: ol.proj.fromLonLat(coords[0], "EPSG:3857"),
    zoom: 2
  });

  var mapHeight = '500px';
  document.getElementById('map').style.height = mapHeight;
  document.getElementById('mapContainer').style.minHeight = mapHeight;
  var map = new ol.Map({
    layers: [
      new ol.layer.Tile({
        // free OpenStreetMap tileset
        source: new ol.source.OSM()
      }),
      vectorLayer
    ],
    target: 'map',
    view: view
  });
  // view.centerOn(fromLonLat(coords[0], "EPSG:3857"), map.getSize(), [570, 500]);

  // shift the text content down to avoid the map
  document.getElementById('textContainer').style.marginTop = '50px';

  // set up the "Download Map Image" button
  var downloadLink = document.getElementById('downloadMap');
  downloadLink.style.visibility = 'visible';
  downloadLink.style.marginBottom = '10px';
  downloadLink.onclick = function() {
    // get <canvas> elements created by OpenLayers
    var canvases = document.getElementsByTagName('canvas');
    var layer1 = canvases[0];
    var layer2 = canvases[1];
    // generate one image from combined map and GeoJSON layers
    var imgURI = overlayCanvases(layer1, layer2);
    // create an invisible "link" to initiate the download
    var link = document.createElement("a");
    // specify a name for the image file to be downloaded as
    link.download = 'area_of_interest.png';
    link.href = imgURI;
    // add the invisible "link" to the DOM so it can be "clicked"
    document.body.appendChild(link);
    // "click" the invisible link
    link.click();
    // remove the invisible "link" from the DOM
    document.body.removeChild(link);
    // K.O.
    delete link;
  }
}

// combine two <canvas> HTML elements into one image for download:
// one layer is the map
// one layer is the visualized GeoJSON
var overlayCanvases = function(cnv1, cnv2) {
  // https://stackoverflow.com/questions/38851963/how-to-combine-3-canvas-html-elements-into-1-image-file-using-javascript-jquery
  var newCanvas = document.createElement('canvas');
  var ctx = newCanvas.getContext('2d');
  // assumes each canvas has the same dimensions
  var width = cnv1.width;
  var height = cnv1.height;
  newCanvas.width = width;
  newCanvas.height = height;

  [cnv1, cnv2].forEach(function(n) {
      ctx.beginPath();
      if (n != undefined) {
        ctx.drawImage(n, 0, 0, width, height);
      }
  });

  return newCanvas.toDataURL("image/png");
};