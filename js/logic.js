var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

d3.json(earthquakeURL, function(data) {
  var mags = data.features.map(  function (i) { return i.properties.mag });
  var color = d3.scaleLinear()
                .domain([d3.min(mags),(d3.min(mags) + d3.max(mags))/2,d3.max(mags)])
                .range(['green','yellow','orange']);
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features, color);
});

function createFeatures(earthquakeData, color) {
  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<p>Coordinates: ${feature.geometry.coordinates[1]}, ${feature.geometry.coordinates[0]}<br>Place: ${feature.properties.place}<br>Magnitude: ${feature.properties.mag}</p>`);
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: feature.properties.mag * 5,
          fillColor: color(feature.properties.mag),
          color: color(feature.properties.mag),
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
      },
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes, color);
}

function createMap(earthquakes, color) {

  // Define streetmap and darkmap layers
  var satmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: config.MY_KEY
  });

  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: config.MY_KEY
  });

  var outdoormap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: config.MY_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite": satmap,
    "Light Map": lightmap,
    "Outdoor Map": outdoormap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var map = L.map("map", {
    center: [39.8283, -98.5795],
    zoom: 3,
    layers: [lightmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);

  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('panel', 'info legend'),
      categories = [0, 1, 2, 3, 4, 5];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < categories.length; i++) {
      div.innerHTML +=
      '<i style="background:' + color(categories[i] + 1) + '"></i> ' +
      categories[i] + (categories[i + 1] ? '&ndash;' + categories[i + 1] + '<br>' : '+');
  }

  return div;
  };

  legend.addTo(map);

  map.on('overlayremove', function (eventLayer) {
    if (eventLayer.name === 'Earthquakes') {
      this.removeControl(legend);
    }
  });
  
  map.on('overlayadd', function (eventLayer) {
    if (eventLayer.name === 'Earthquakes') {
      legend.addTo(this)
    }
  });
};
