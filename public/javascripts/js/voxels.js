$()
var ids = [];
var mapIds = [];
var maps = [];

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
		

		var myStyle = {
			"color": "red",
			"weight": 1,
			"opacity": 0.5,
			'fillColor': '#ff7800'
		};

		// Disable scrolling into map unless clicked
    	map.scrollWheelZoom.disable();

		bBoxCoords = [];
        bBox.coordinates[0].forEach(function(feature, i) {
            bBoxCoords.push(feature.reverse());
        })

		map.fitBounds(bBoxCoords);
		console.log("Bbox coords: " + bBoxCoords);
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

function renderMap(map, datavoxel){

	var mapId = $(map).attr('id');

	var bBox = datavoxel.bbox;

	$(map).removeClass('temporary_map_visuals');
	$(map).empty();

	var sx = 0;
	var sy = 0;
	bBox.coordinates[0].forEach(function(point, index){
		if (index < 4) {
			sx += point[0];
			sy += point[1];
		}
	})
	var centroid = {
		coordinates:  [sx/4, sy/4]
	}
	render(mapId, bBox, centroid);
}

