importScripts('../libs/sm.js');
importScripts('../libs/tilecover.js');
importScripts('../libs/utilities.js');

var basePlaneDimension = 65024;
var mercator = new sm({size: basePlaneDimension});
var imagery = {};
var working = false;

self.addEventListener('message', function(e) {

	var cb = e.data;
	// if (cb.restore) {
 //        imagery[cb.restore] = false
 //        return
	// }
	var zoom = cb[0];
	var payload = cb[1];

	// unproject world pixels to coordinates
	box = payload.map(function(corner){
		var pt = corner ? corner : {x:corner.x*basePlaneDimension/2, z:corner.y*basePlaneDimension/2}
	    return mercator.ll([pt.x+basePlaneDimension/2, pt.z+basePlaneDimension/2],0)
	})

    box = {
        "type": "Polygon",
        "coordinates": [box]
    }

    // using tile-cover, figure out which tiles are inside viewshed and put in zxy order
    var satelliteTiles =
    cover.tiles(box,{min_zoom: zoom, max_zoom: zoom})
        .map(function([x,y,z]){return [z,x,y]});

    if (satelliteTiles.length == 0 ) return

    var imageTiles = [];

    for (var s = 0; s<satelliteTiles.length; s++){
    	var tile = satelliteTiles[s];

    	//make sure this tile isn't already downloaded
    	if (!imagery[tile]) {
    		imagery[tile] = true;
	       	imageTiles.push(tile)
    	}
    }

    var elevations = {}

    //assemble list of elevations, as grandparent tiles of imagery
    for (var t=0; t<imageTiles.length;t++){
        var deslashed = imageTiles[t]
        var grandparent = [deslashed[0]-2, Math.floor(deslashed[1]/4),Math.floor(deslashed[2]/4)];
        if (elevations[grandparent]) elevations[grandparent].push(deslashed)
        else elevations[grandparent]=[deslashed]
    }

    var elevationTiles = 
    Object.keys(elevations)
        .map(function(triplet){return triplet.split(',')
            .map(function(num){return parseFloat(num)})}
        )

	self.postMessage({getTiles:[imageTiles, elevationTiles]});

}, false);