// Save urls to variables
var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var tectonicURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_steps.json"

// Read in earthquake data from website
d3.json(earthquakeURL, function(earthquakeData) {

  // Read in tectonic plate data from website
  d3.json(tectonicURL, function(tectonicData){

    // Create variable with all of the magnitudes
    var mags = earthquakeData.features.map(  function (i) { return i.properties.mag });

    // Create color scale for circles
    var color = d3.scaleLinear()
                  .domain([d3.min(mags),(d3.min(mags) + d3.max(mags))/2,d3.max(mags)])
                  .range(['green','yellow','orange']);

    // Once a response is received, send the features objects and color function to the createFeatures function
    createFeatures(earthquakeData.features, tectonicData.features, color);
  })
});

// Create function to create features for tectonic plates and earthquakes
function createFeatures(earthquakeData, tectonicData, color) {

  // Give each feature a popup describing the coordinates, place, and magnitude
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<p>Coordinates: ${feature.geometry.coordinates[1]}, ${feature.geometry.coordinates[0]}<br>Place: ${feature.properties.place}<br>Magnitude: ${feature.properties.mag}</p>`);
  }

  // Create a GeoJSON layer containing the features array from the earthquakeData object
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
        
        // Create circle marker for each point using Leaflet variable latlng
        return L.circleMarker(latlng, {

          // Use magnitude multiplied by five for circle radius
          radius: feature.properties.mag * 5,

          // Use color function to calculate color for fill and color
          fillColor: color(feature.properties.mag),
          color: color(feature.properties.mag),
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
      },

    // Run the onEachFeature function once for each piece of data in the array
    onEachFeature: onEachFeature
  });

  // Create a GeoJSON layer containing the features array from the tectonicData object
  var tectonicPlates = L.geoJSON(tectonicData, {
    color: 'orange'
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes, tectonicPlates, color);
}

// Create a function to create the map with the layers and the color function
function createMap(earthquakes, plateLayer, color) {

  // Define sattelite layer
  var satmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: config.MY_KEY
  });

  // Define light map layer
  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: config.MY_KEY
  });

  // Define outdoors layer
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

  // Create overlay object to hold our overlay layers
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": plateLayer
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var map = L.map("map", {
    maxBounds: [[-90,-180], [90,180]],
    center: [39.8283, -98.5795],
    zoom: 3,
    layers: [lightmap, earthquakes],
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    // Default to expanded
    collapsed: false
  }).addTo(map);

  // Create legend for map
  var legend = L.control({position: 'bottomright'});

  // On add do this
  legend.onAdd = function (map) {

    // create div variable for legend display
    var div = L.DomUtil.create('div', 'info legend'),

      // define number of categories
      categories = [0, 1, 2, 3, 4, 5];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < categories.length; i++) {
      div.innerHTML +=
      '<i style="background:' + color(categories[i] + 1) + '"></i> ' +
      categories[i] + (categories[i + 1] ? '&ndash;' + categories[i + 1] + '<br>' : '+');
  }

  return div;
  };

  // Add to map for display on load
  legend.addTo(map);

  // Create listening even for removal of overlay
  map.on('overlayremove', function (eventLayer) {
    
    // If the removed overlay is the earthquake layer remove legend
    if (eventLayer.name === 'Earthquakes') {
      this.removeControl(legend);
    }
  });
  
  // Create listening even for addition of overlay
  map.on('overlayadd', function (eventLayer) {

    // If the added overlay is the earthquake layer add legend
    if (eventLayer.name === 'Earthquakes') {
      legend.addTo(this)
    }
  });
};
