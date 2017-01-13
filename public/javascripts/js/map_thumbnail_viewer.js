// $('#mapView').on('hidden.bs.modal', function (e) {
//   console.log("Removing map.");
//   window.alert('hidden event fired!');
//   var mapId = $(e.relatedTarget).data('map-id');
//   var $map = $('#map_thumbnail_' + mapId);
  
//   $map.removeClass('temporary_map_visuals');
//   $map.empty();

// });

$('#mapView').on('show.bs.modal', function(e) {

  var mapId = $(e.relatedTarget).data('map-id');

  console.log("Map creation.");
  
  var $dropdown = $($('select')[0]);
  var $epsg= $('#epsg');
  var $map = $('#map_thumbnail_' + mapId);
  if ($map.hasClass('temporary_map_visuals')) return;
  console.log("Map doesn't have vis class");

  $map.addClass('temporary_map_visuals');
  $map.append('<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i><span class="sr-only">Loading...</span>');

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
        render(bBox, JSON.parse(geoJSON), JSON.parse(centroid));
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

  function render(boundingBox, geoJSON, centroid){
    var centroid = centroid;
    var geoJSON = geoJSON;
    var bBox = boundingBox;
    var map = embedMap('map_thumbnail_' + mapId, JSON.parse(centroid).coordinates.reverse())
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
});
