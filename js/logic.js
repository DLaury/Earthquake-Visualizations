// Create map object
var map = L.map("map", {
    center: [39.8283, -98.5795],
    zoom: 3
  });

// Add a tile layer (the background map image) to our map
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: config.MY_KEY
  }).addTo(map);

// Perform an API call to USGS endpoint
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function(earthquakes) {
  var mags = earthquakes.features.map(  function (i) { return i.properties.mag });
  var color = d3.scaleLinear()
  .domain([d3.min(mags),(d3.min(mags) + d3.max(mags))/2,d3.max(mags)])
  .range(['green','yellow','orange'])


  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

  var panel = L.DomUtil.create('panel', 'info legend'),
    categories = [0, 1, 2, 3, 4, 5];

  // loop through our density intervals and generate a label with a colored square for each interval
  for (var i = 0; i < categories.length; i++) {
    panel.innerHTML +=
    '<i style="background:' + color(categories[i] + 1) + '"></i> ' +
    categories[i] + (categories[i + 1] ? '&ndash;' + categories[i + 1] + '<br>' : '+');
  }

  return panel;
  };

  legend.addTo(map);

  L.geoJson(earthquakes, {
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
    onEachFeature: function (feature, layer) {
      layer.bindPopup(`<h4>Coordinates: ${feature.geometry.coordinates[1]}, ${feature.geometry.coordinates[0]}</h4><p>Place: ${feature.properties.place}<br>Magnitude: ${feature.properties.mag}</p>`);
    }
  }).addTo(map);
});
  