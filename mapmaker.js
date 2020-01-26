// import 'ol/ol.css';
// import Feature from 'ol/Feature';
// import Map from 'ol/Map';
// import View from 'ol/View';
// import {Projection,fromLonLat} from 'ol/proj';
// import GeoJSON from 'ol/format/GeoJSON';
// import Circle from 'ol/geom/Circle';
// import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
// import {OSM, Vector as VectorSource} from 'ol/source';
// import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';

// import ol from './lib/openlayers.js';

// export  { createMap };

var styles = {
  'Polygon': new ol.style.Style({
    stroke: new ol.style.Stroke({
      // lineDash: [4],
      color: 'blue',
      width: 2
    }),
    fill: new ol.style.Fill({
      color: 'rgba(0, 0, 255, 0.1)'
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

  document.getElementById('map').style.height = '400px';
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
}