importScripts('../libs/sm.js');

var basePlaneDimension = 65024;
var tilePixels = new sm({size: 128});
var working = false;

var cols = 512
var rows = 512
var scaleFactor = 4

var sixteenthPixelRanges = [];

for (var c=0; c<scaleFactor;c++){
    for (var r=0; r<scaleFactor; r++){
        //pixel ranges
        sixteenthPixelRanges
            .push([
                [r*(rows/scaleFactor-1)+r, (r+1)*rows/scaleFactor],
                [c*(cols/scaleFactor-1)+c, (c+1)*cols/scaleFactor]
            ])
    }
};

self.addEventListener('message', function(e) {
    var time = Date.now()
    console.time(time+' worker')

    e = e.data;

    var pixels = e[0];
    var coords = e[1]; //terrain tile coord
    var tiles = e[2];  //requested imagery coords
    var parserIndex =e[3];
    var z = coords[0];
    var x = coords[1];
    var y = coords[2];
    //console.log(time+' started #'+parserIndex)

    var elevations = [];

    if (pixels) {
        //colors => elevations
        for (var e = 0; e<pixels.data.length; e+=4){
            var R = pixels.data[e];
            var G = pixels.data[e+1];
            var B = pixels.data[e+2];
            elevations.push(-10000 + ((R * 256 * 256 + G * 256 + B) * 0.1))
        }
    }
    else elevations = new Array(1048576).fill(0);

    // figure out tile coordinates of the 16 grandchildren of this tile
    var sixteenths = [];
    for (var c=0; c<scaleFactor;c++){
        for (var r=0; r<scaleFactor; r++){
            //tile coordinates
            sixteenths.push(slashify([z+2,x*scaleFactor+c, y*scaleFactor+r]));
        }
    }


    //iterate through sixteenths...

    var tileSize = basePlaneDimension/(Math.pow(2,z+2));
    var vertices = 128;
    var segments = vertices-1;
    var segmentLength = tileSize/segments;

    var imagesDownloaded = 0;

    //check 16 grandchildren of this terrain tile
    sixteenths.forEach(function(d,i){
        //if this grandchild is actually in view, proceed...
        if (tiles.indexOf(d)>-1){
            imagesDownloaded++
            d = deslash(d);
            var pxRange = sixteenthPixelRanges[i];
            var elev = [];

            var xOffset = (d[1]+0.5)*tileSize - basePlaneDimension/2;
            var yOffset = (d[2]+0.5)*tileSize - basePlaneDimension/2;

            //grab its elevations from the 4x4 grid
            for (var r = pxRange[0][0]; r<pxRange[0][1]; r++){
                for (var c = pxRange[1][0]; c<pxRange[1][1]; c++){
                    var currentPixelIndex = r*cols+c;
                    elev.push(elevations[currentPixelIndex])
                }
            }
            var array = [];
            var dataIndex = 0;

            //iterate through rows
            for (var r = 0; r<vertices; r++){

                var yPx = d[2]*128+r;
                var pixelLat = tilePixels.ll([x*tileSize, yPx], d[0])[1]   //latitude of this pixel
                var metersPerPixel = mPerPixel(pixelLat, tileSize, d[0])   //real-world distance this pixel represents

                // y position of vertex in world pixel coordinates
                var yPos = -r * segmentLength + tileSize/2;

                //iterate through columns
                for (var c = 0; c<vertices; c++){
                    var xPos = c * segmentLength - tileSize/2;
                    array.push(xPos+xOffset, elev[dataIndex]/metersPerPixel, -yPos+yOffset)
                    dataIndex++
                }
            }
            self.postMessage(
                {makeMesh:[array, d]}
            );
        }
    })

}, false);


function slashify(input){
    return input.join('/');
}
function deslash(input){
    return input.split('/').map(function(str){return parseInt(str)});
}
function mPerPixel(latitude, tileSize, zoom) {
    return Math.abs(
        40075000 * Math.cos(latitude*Math.PI/180) / (Math.pow(2,zoom) * tileSize )
    );
}




// console.log(PNG, png)
// var oReq = new XMLHttpRequest();
// oReq.onload = function (oEvent) {
//     var buffer = oReq.response
//     console.log(parseDataUri(buffer))


// }

// oReq.open("GET", "https://d.tiles.mapbox.com/v4/mapbox.terrain-rgb/12/691/1589.pngraw?access_token=pk.eyJ1IjoibWF0dCIsImEiOiJTUHZkajU0In0.oB-OGTMFtpkga8vC48HjIg", true);
// oReq.responseType = "arraybuffer";
// oReq.send(null);