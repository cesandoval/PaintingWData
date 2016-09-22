var centroid = JSON.parse(centroid);
var bBox = JSON.parse(bBox);
var map = L.map('map').setView(centroid.coordinates.reverse(), 11);

bBoxCoords = [];
bBox.coordinates[0].forEach(function(feature, i) {
    bBoxCoords.push(feature.reverse());
})

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.light'
}).addTo(map);

console.log(bBoxCoords)
console.log(geoJSON)
map.fitBounds(bBoxCoords);


var myStyle = {
    "color": "black",
    "weight": 1,
    "opacity": 0.5,
    'fillColor': '#ff7800'
};

parsedGeoJSON = [];
geoJSON.forEach(function(json, i) {
    parsedGeoJSON.push(JSON.parse(json));
})

L.geoJson(parsedGeoJSON, {
    style: myStyle
}).addTo(map);
