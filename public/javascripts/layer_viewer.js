var id = id;
console.log("--------------");
console.log(id)
var $dropdown = $($('select')[0]);
var $map = $('#map');
$map.addClass('temporary_map_visuals');
$map.append('<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i><span class="sr-only">Loading...</span>');
requestMap(render);


function requestMap(callback){
    $.ajax({
        url: '/getMapData/'+id ,
        type: 'GET',
        cache: false,
        processData: false, 
        contentType: false, 
        success: function(data)
        {
            if(typeof data.error === 'undefined')
            {
                console.log("success");
                $map.removeClass('temporary_map_visuals');
                $map.empty();
                var bBox = JSON.parse(data.bBox);
                var geoJSON = JSON.stringify(data.geoJSON);
                renderFields(data.fields);

                var centroid = JSON.stringify(data.centroid);
                callback(bBox, JSON.parse(geoJSON), JSON.parse(centroid));
            }
            else
            {
                console.log('ERRORS: ' + data.error);
            }
        },
        error: function(jqXHR, textStatus, errorThrown)
        {
            console.log("the errors happened here");
            console.log('ERRORS: ' + textStatus);
        }
    });
}

function render(boundingBox, geoJSON, centroid){
    var centroid = centroid;
    var geoJSON = geoJSON;
    var bBox = boundingBox;
    var map = L.map('map').setView(JSON.parse(centroid).coordinates.reverse(), 11);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.light'
    }).addTo(map);
    
    
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
function renderFields(fields){
    fields.forEach(function(field, index){
        $dropdown.append("<option>"+field+"</option>");
    });
}