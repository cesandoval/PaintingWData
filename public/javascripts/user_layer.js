// var id = id;
// var $dropdown = $($('select')[0]);
var ids = [];
var mapIds = [];
var maps = [];
$(".leafletMap").each(function(index, map){
	 maps.push(map);
      $(map).append('<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i><span class="sr-only">Loading...</span>');
      mapIds.push($(map).attr('id'));
      ids.push($(map).attr('id').split("_")[1]);
 })

$datalayers = $('.datalayer');
maps.forEach(function(map, index){
	var mapId = $(map).attr('id');
	$.ajax({
		url : "/getDatalayers/" + ids[index],
		type: 'GET',
		cache: false,
		processData: false, 
		contentType: false, 
		success: function(data){
		
			var bBox = JSON.parse(data.bBox);
	        // $datalayers[index].find('.layerName')[0].html(data.datalayer.layerName);
	        // $($datalayers[index].find('.property')[0]).html(data.datalayer.properties);
	        // $($datalayers[index].find('.description')[0]).html(data.datalayer.description);
	        // $($datalayers[index].find('.epsg')[0]).html(data.datalayer.epsg);
	        $(map).removeClass('temporary_map_visuals');
	        $(map).empty();
			render(mapId, bBox, JSON.parse(data.centroid));
		},
		failure: function(err){
			console.log(err);
		}
	})
	function render(map, boundingBox, centroid){
    var centroid = centroid;
    var geoJSON = geoJSON;
    var bBox = boundingBox;
    var map = embedMap(mapId, centroid.coordinates.reverse())
    bBoxCoords = [];
    bBox.coordinates[0].forEach(function(feature, i) {
        bBoxCoords.push(feature.reverse());
    })

   
    map.fitBounds(bBoxCoords);

    var myStyle = {
        "color": "red",
        "weight": 1,
        "opacity": 0.5,
        'fillColor': '#ff7800'
    };
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
});


