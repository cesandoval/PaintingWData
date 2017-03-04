var currId;
var maps = {};
$('[id*="mapView"]').on('hidden.bs.modal', function (e) {
  if (maps['map_thumbnail_' + currId] != null) {
    console.log('Removing map' + 'map_thumbnail_' + currId);
    maps['map_thumbnail_' + currId].remove();
  }

  console.log("Removing map " + currId);
  var $map = $('#map_thumbnail_' + currId);
  $map.empty();
});

$('.modal').on('show.bs.modal', function(e) {
  var mapId = $(e.relatedTarget).data('map-id');
  if ($(this).attr('id') == ('mapView_' + mapId)) {
    console.log('Found element.');
  }
  else {
    console.log('Not right element ' + $(this).attr('id'));
    return;
  }

  currId = mapId;
  var $dropdown = $($('select')[0]);
  var $epsg= $('#epsg');
  var $map = $('#map_thumbnail_' + currId);

  if ($map.hasClass('temporary_map_visuals'))
    console.log('Map already has subclasses.');
  else {
    console.log('Adding visuals to map.');
    $map.addClass('temporary_map_visuals');
    $map.append('<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i><span class="sr-only">Loading...</span>');  
  }

  $.ajax({
    url: '/getThumbnailData/'+id,
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
        var bBox = data.bBox;
        var geoJSON = JSON.stringify(data.geoJSON);

        var centroid = JSON.stringify(data.centroid);
        renderMap(bBox, JSON.parse(geoJSON), JSON.parse(centroid));
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

  function renderMap(boundingBox, geoJSON, centroid){
    var centroid = centroid;
    var geoJSON = geoJSON;
    var bBox = boundingBox;
    var mapIndex = 'map_thumbnail_' + currId;
    console.log('Current id is ' + mapIndex);

    maps[mapIndex] = embedMap(mapIndex, centroid.coordinates.reverse())

    bBoxCoords = [];
    bBox.coordinates[0].forEach(function(feature, i) {
      bBoxCoords.push(feature.reverse());
    })

    maps[mapIndex].fitBounds(bBoxCoords);

    var myStyle = {
      "color": "white",
      "weight": 1,
      "opacity": 1,
      "fillOpacity": 0.65,
      // 'fillColor': '#ff7800'
      'fillColor': '#D34031'
    };


    L.geoJson(geoJSON, {
      style: myStyle
    }).addTo(maps[mapIndex]);
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