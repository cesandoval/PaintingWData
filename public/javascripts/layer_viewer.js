var id = id;
var $dropdown = $($('select')[0]);
var $epsg= $('#epsg');
var $map = $('#map');
$map.addClass('temporary_map_visuals');
$map.append('<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i><span class="sr-only">Loading...</span>');
requestMap(id, render);

function render(boundingBox, geoJSON, centroid){
    var centroid = centroid;
    var geoJSON = geoJSON;
    var bBox = boundingBox;
    var map = embedMap('map', JSON.parse(centroid).coordinates.reverse())
    bBoxCoords = [];
    bBox.coordinates[0].forEach(function(feature, i) {
        bBoxCoords.push(feature.reverse());
    })

   
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
}
function renderEPSG(epsg){
    $epsg.val(epsg);
}
function renderFields(fields){
    fields.forEach(function(field, index){
        $dropdown.append("<option>"+field+"</option>");
    });
}