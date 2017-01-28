// $()
var ids = [];
var mapIds = [];
var maps = [];
var $datavoxel = $('.datavoxel');
var $openVoxel = $('#openVoxel');
var currentSelectedId = 0 ;

function deselectAll(){
	$datavoxel.removeClass('selected_layer');
}
var selectedVoxelId = 1;
$datavoxel.click(function(){
	var $datalayer = $(this); 
	if(!($datalayer.hasClass("selected_layer"))){
		deselectAll();
		selectedVoxelId = $datalayer.attr('id').split('_')[1];
		$datalayer.addClass('selected_layer');
	}
});

$openVoxel.click(function(){
	  window.location.href = "/app/"+selectedVoxelId;
});

function getDatafileId(leafletMap){
	return leafletMap.attr('id').split("_")[1];
}

$(".leafletMap").each(function(index, map){
	maps.push(map);
	$(map).append('<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i><span class="sr-only">Loading...</span>');
	mapIds.push($(map).attr('id'));
	ids.push(getDatafileId($(map)));
 })

function render(mapId, boundingBox, centroid){
		var centroid = centroid;
		var geoJSON = geoJSON;
		var bBox = boundingBox;
		var map = embedMap(mapId, centroid.coordinates.reverse());
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
			bBoxCoords = [];
			bBox.coordinates[0].forEach(function(feature, i) {
				bBoxCoords.push(feature.reverse());
		})

}



function renderMap(map, datavoxel){

	var mapId = $(map).attr('id');


	var bBox = datavoxel.bbox;
	// $datalayers[index].find('.layerName')[0].html(data.datalayer.layerName);
	// $($datalayers[index].find('.property')[0]).html(data.datalayer.properties);
	// $($datalayers[index].find('.description')[0]).html(data.datalayer.description);
	// $($datalayers[index].find('.epsg')[0]).html(data.datalayer.epsg);
	$(map).removeClass('temporary_map_visuals');
	$(map).empty();
	var sx = 0;
	var sy = 0;
	bBox.coordinates[0].splice(0, 4).forEach(function(point, index){
		sx += point[0];
		sy += point[1];
	})
	var centroid = {
		coordinates:  [sx/4, sy/4]
	}
	
	render(mapId, bBox, centroid);
	
	console.log(map);
   
	
}

