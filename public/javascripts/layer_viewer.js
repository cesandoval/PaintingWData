var id = id;
var size = size;
var MAX_SIZE = 10;
var $dropdown = $($('select')[0]);
var $epsg= $('#epsg');
var $map_parent = $('.map-holder');
var $map = $('#map_thumbnail_' + id);
console.log($map);

$map.addClass('temporary_map_visuals');
$map.append('<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i><span class="sr-only">Loading...</span>');
requestMap(id, render, size);


function render(boundingBox, geoJSON, centroid, size){
    var centroid = centroid;
    var geoJSON = geoJSON;
    var bBox = boundingBox;
    var map = embedMap('map_thumbnail_' + id, JSON.parse(centroid).coordinates.reverse())
    bBoxCoords = [];
    bBox.coordinates[0].forEach(function(feature, i) {
        bBoxCoords.push(feature.reverse());
    })

    map.fitBounds(bBoxCoords);

    var myStyle = {
        "color": "white",
        "weight": 1,
        "opacity": 1,
        "fillOpacity": 0.75,
        // 'fillColor': '#ff7800'
        'fillColor': '#D34031'
    };

    if (size <= MAX_SIZE) {
        parsedGeoJSON = [];
        geoJSON.forEach(function(json, i) {
            parsedGeoJSON.push(JSON.parse(json));
        })

        L.geoJson(parsedGeoJSON, {
            style: myStyle
        }).addTo(map);
    }
    else {
        myStyle["fillOpacity"] = 0;
        myStyle["opacity"] = 1;
        myStyle["color"] = '#D34031';
        myStyle["weight"] = 3;

        var reversedBbox = [[]];
        bBox.coordinates.forEach(function(coordinates, index){
            coordinates.forEach(function(coords, index){
                reversedBbox[0].push(coords.reverse());
            });
        });

        bBox.coordinates = reversedBbox;
    
        L.geoJson(bBox, {
            style: myStyle
        }).addTo(map);
    }
}

function renderEPSG(epsg){
    $epsg.val(epsg);
}
function renderFields(fields){
    fields.forEach(function(field, index){
        $dropdown.append("<option>"+field+"</option>");
    });
}

function removeMap() {
    // remove map completely
    $map_parent.remove();
}

function removeTempMap() {
    // remove attributes
    $map.children("i").remove();
    $map.removeClass('temporary_map_visuals');
    $map.remove();
}