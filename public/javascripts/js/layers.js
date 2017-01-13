function requestMap(id, callback){
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
                console.log(data.epsg);
                $map.removeClass('temporary_map_visuals');
                $map.empty();
                var bBox = JSON.parse(data.bBox);
                var geoJSON = JSON.stringify(data.geoJSON);
                renderFields(data.fields);
                renderEPSG(data.epsg);

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

function embedMap(id, centroid){
    map = L.map(id).setView(centroid, 11);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.light'
    }).addTo(map);
    return map;
}