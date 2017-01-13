var currId;
var maps = {};

$('#mapView').on('hide.bs.modal', function (e) {
  console.log("Removing map " + currId);
  // $map.empty();

  if (maps['map_thumbnail_' + currId] != null) 
    maps['map_thumbnail_' + currId].remove();
});

$('#mapView').on('show.bs.modal', function(e) {
  var mapId = $(e.relatedTarget).data('map-id');  
  currId = mapId;
  var $dropdown = $($('select')[0]);
  var $epsg= $('#epsg');
  var $map = $('#map_thumbnail_' + mapId);

  $map.addClass('temporary_map_visuals');
  $map.append('<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i><span class="sr-only">Loading...</span>');

  $.ajax({
    url: '/getMapData/'+id,
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
    var index = 'map_thumbnail_' + currId;
    console.log('Current id is ' + index);

    maps[index] = embedMap('map_thumbnail_' + currId, JSON.parse(centroid).coordinates.reverse())
    console.log(maps[index]);

    bBoxCoords = [];
    bBox.coordinates[0].forEach(function(feature, i) {
      bBoxCoords.push(feature.reverse());
    })

    maps[index].fitBounds(bBoxCoords);

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
    }).addTo(maps[index]);
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