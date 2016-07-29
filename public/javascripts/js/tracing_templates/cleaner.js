var tracing_template = function() {
    
    var self = this;

    var lon,
    lat,
    location,
    x,
    z,
    geometry;
    
 function parseTwitterDate(text) {
     
     console.log(text);
     
    return new Date(Date.parse(text.replace(/( +)/, ' UTC$1')));
}

    this.get_trace = function(keyframe,scope, scene) {
        
        console.log(keyframe);

        var meta = [];

        var configKeyframeID = 1;
        var configType = ["sphere","point"];
        var configNode = ["Suburb","Twitter"];
        var configColR = [255,255];
        var configColG = [255,195];
        var configColB = [255,100];
        var configSize = [600,150];
        var configTime = [false,true];
        
        var cnt = 0;

        for (var p = 0; p < keyframe.length; p++) {

            //Loop through each database record
            for (var q = 1; q < keyframe[p][0].length; q++)
            {
                if(keyframe[p][0].length > 1 )
                {
                    //q++;
                }
                
                trace_json_start = keyframe[p][0][q];
                
               console.log(trace_json_start);
               
                var name = trace_json_start.data.name;
           
                var time = trace_json_start.data.time;
                
                if (time!=undefined){
                    var time = parseTwitterDate(time).getTime()/1000;
                }
                var origin = trace_json_start.data.origin;

                //Get Lat/Lon
                lon = Number(trace_json_start.data.lon);
                lat = Number(trace_json_start.data.lat);
    
                location = self.lonLatToScene(lon, lat); //Convert to Scene Coords
    
                //Extract X,Y Coords
                x = location.x;
                z = location.y;
    
                var nodePos = new THREE.Vector3(x, 0, z); //Setup Vector for nodePos
                
                
                var col = new THREE.Color( 0xffffff );
				col.setRGB( configColR[q-1]/255, configColG[q-1]/255, configColB[q-1]/255);
                
                //save data
                //ID, KeyframeID, Label, Point, Geo Type, Geo Colour, Time, Link, Link Type, Source
               /* meta.push([]);
                
                meta[cnt].push(cnt); //Store ID
                meta[cnt].push(configKeyframeID); // Store Keyframe ID
                meta[cnt].push(configNode[q-1]); // Store Source
                meta[cnt].push(name) // Store Label
                meta[cnt].push(nodePos); //Store Point
                meta[cnt].push(configType[q-1]); // Store Geometry Type
                meta[cnt].push(col); // Store Geometry Colour
                meta[cnt].push(time); // Store Time
                */
                
                var metaTag = {
                id:cnt,
                keyframeid:configKeyframeID,
                source:configNode[q-1],
                label:name,
                point:nodePos,
                geotype:configType[q-1],
                color:col,
                time:time
                }
                
                if (q > 1)
                {
                   // meta[cnt].push(cnt - 1); // Store Link
                    metaTag.link=cnt - 1;
                }
                else
                {
                 //   meta[cnt].push(-1); // Already Linked
                    metaTag.link=-1;
                }
                //meta[cnt].push("line"); // Store Link Type
                metaTag.linktype="line";
    
    meta.push(metaTag);
    
                cnt++;
                
            }
			

        }
 

// sort the meta table

var staticBin=[];
var sortBin=[];

for (var p = 0; p < meta.length; p++) {
    if (meta[p].time==undefined){
        staticBin.push(meta[p]);
    }else{
        sortBin.push(meta[p]);
    }
}


if (sortBin.length>0){
    
// scott's deep clone trick
var sortObjects = JSON.parse(JSON.stringify(sortBin));


// sort the array by the epoch element here
sortObjects.sort(function(a,b) {return a.time - b.time});
            
    var minTime=sortObjects[0].time;
    var maxTime=sortObjects[sortObjects.length-1].time;
    
    var binStep=3600*24;  // should be global var - set binning timestep in seconds - adjustable
    
        scope.time =minTime;
        scope.startTime = minTime;
        scope.endTime = Math.floor((maxTime-minTime)/binStep)*binStep+minTime;
        scope.step = binStep;

    var binnedObjects=[];
    
        for (var j=0;j<(maxTime-minTime)/binStep;j++){
        var binCollect=[];
        for (var k=0;k<sortObjects.length;k++){
            if (sortObjects[k].time<(binStep*(j+1))+minTime && sortObjects[k].time>=(binStep*j)+minTime){
                binCollect.push(sortObjects[k]);
            }
        }
        
        binnedObjects.push(binCollect);

}

    console.log(binnedObjects);
    console.log(staticBin);


} // end of sort objects check




// visualize the static objects first




    var pGeo=new THREE.Geometry();
    var pCol=[];
    
for (var kk=0;kk<staticBin.length;kk++){

            pGeo.vertices.push(staticBin[kk].point);

            pCol.push(staticBin[kk].color);

    }
    
            pGeo.colors=pCol;
            
            var col = new THREE.Color(0xffffff);
            //var colorrand = Math.random();
            //col.setRGB(colorrand, colorrand, colorrand);

            var pMaterial = new THREE.ParticleBasicMaterial({
                color: col,
                size: 300,
                sizeAttenuation: true,
                map: THREE.ImageUtils.loadTexture(
                //  "resources/images/particle_white.png"
                "images/spark_static.png"),
                blending: THREE.AdditiveBlending,
                  vertexColors: true,
                depthTest: false,
                transparent: true
            });


            var pointData = new THREE.ParticleSystem(pGeo, pMaterial);
            
            //pointData.content=data

            scene.add(pointData);
            panObjects.push(pointData);
         
         
         console.log(pointData);

// loop through the binnedObjects - and add geometry

Array.prototype.getUnique = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
}


for (var k=0;k<binnedObjects.length;k++){
    
    //var unique=binnedObjects[k].getUnique();
    //console.log(unique)
    
    var pGeo=new THREE.Geometry();
    var lGeo = new THREE.Geometry();
    
    var pCol=[];
    
for (var kk=0;kk<binnedObjects[k].length;kk++){

            pGeo.vertices.push(binnedObjects[k][kk].point);
            pCol.push(binnedObjects[k][kk].color);
            
            if(binnedObjects[k][kk].link > 0){
                
                var p1 = meta[binnedObjects[k][kk].id].point;
                var p2 = meta[binnedObjects[k][kk].link].point;
                
                lGeo.vertices.push( p1);
                lGeo.vertices.push( p2);
                
                
             var midX = ((p1.x) + (p2.x)) / 2;
             var midZ = ((p1.z) + (p2.z)) / 2;

             var elevation=Math.random()*1000;
             var thickness=Math.random()*1000;
            // var elevation = Math.sqrt(data[p].duration / 4000);
             //var thickness = Math.sqrt(data[p].duration / 4000);

             var middle3 = new THREE.Vector3(midX, elevation, midZ);

             var curveQuad = new THREE.QuadraticBezierCurve3(p1, middle3, p2);

  var cp = new THREE.CurvePath();
             cp.add(curveQuad);


var color = 0xFBB040;

             var curvedLineMaterial = new THREE.LineBasicMaterial({
                 color: color,
                 linewidth: 3,
                 opacity: 0.75,
                 transparent: true,
                 depthTest: false,
                 depthWrite: false,
                 blending: THREE.AdditiveBlending
             });

             curvedLineMaterial.depthTest = true;
             curvedLineMaterial.overdraw = true;

             var line = new THREE.Line(cp.createPointsGeometry(50), curvedLineMaterial);

line.time=k;

             panObjects.push(line);
             scene.add(line);
viewObjects.push(line);

                
            }

    }
    
    
     
         var material = new THREE.LineBasicMaterial({
          // color:0x0d8d61,
          color: 0xffffff,
          transparent: true,
          opacity: 0.8,
          depthTest:false,
          depthWrite:false
      });

      var line = new THREE.Line(lGeo, material, THREE.LinePieces);

        line.time=k;

      panObjects.push(line);
      scene.add(line);
      viewObjects.push(line);
      
      console.log(line);
      
            pGeo.colors=pCol;
            
            var col = new THREE.Color(0xffffff);
            //var colorrand = Math.random();
            //col.setRGB(colorrand, colorrand, colorrand);

            var pMaterial = new THREE.ParticleBasicMaterial({
                color: col,
                size: 300,
                sizeAttenuation: true,
                map: THREE.ImageUtils.loadTexture(
                //  "resources/images/particle_white.png"
                "images/spark_static.png"),
                blending: THREE.AdditiveBlending,
                  vertexColors: true,
                depthTest: false,
                transparent: true
            });


            var pointData = new THREE.ParticleSystem(pGeo, pMaterial);
            
            //pointData.content=data
            
            pointData.time = k;
            
            scene.add(pointData);
            panObjects.push(pointData);
            viewObjects.push(pointData);
    
    
}













// add the static bin


// generate the template bin geometry






/*

//- we should change this in the API to make the data response cleaner
var baseData=result.keyframes[0].queries[0].queryresult.data;

function parseTwitterDate(text) {
    return new Date(Date.parse(text.replace(/( +)/, ' UTC$1')));
}

var rawObjects = [];


for (var i=0;i<baseData.length;i++){

        var time = baseData[i][0].data.time; // must be a single request

    var epochTime = parseTwitterDate(time);
    var nodeID = baseData[i][0].self.split("/")[baseData[i][0].self.split("/").length-1];
    var object = {
        id:nodeID,
        epoch:epochTime.getTime()/1000
    }
    rawObjects.push(object);
}

// scott's deep clone trick
var sortObjects = JSON.parse(JSON.stringify(rawObjects));
// sort the array by the epoch element here
sortObjects.sort(function(a,b) {return a.epoch - b.epoch});
// now that we have the sorted epoch times and node ids, we can bin into hours


var minTime=sortObjects[0].epoch;
var maxTime=sortObjects[sortObjects.length-1].epoch;

var binStep=3600*24;  // should be global var - set binning timestep in seconds - adjustable

console.log(minTime);
console.log(maxTime);
console.log(binStep);

// I can probably readjust the scope timeline variables here
    $scope.time =minTime;
    $scope.startTime = minTime;
    $scope.endTime = Math.floor((maxTime-minTime)/binStep)*binStep+minTime;
  
    
    $scope.step = binStep;


var binnedObjects=[];

for (var j=0;j<(maxTime-minTime)/binStep;j++){
    
    console.log(j);
    
    var binCollect=[];
    
    for (var k=0;k<sortObjects.length;k++){
    
        if (sortObjects[k].epoch<(binStep*(j+1))+minTime && sortObjects[k].epoch>=(binStep*j)+minTime){
            binCollect.push(sortObjects[k]);
        }
    
    }
    
    binnedObjects.push(binCollect);
    
}

console.log(binnedObjects);


result.keyframes[0].viz_config={
     configType:["sphere","point"],
     configColR:[255,255],
     configColG:[255,195],
     configColB:[255,100],
     configSize:[600,150],
     configTime :[false,true]
}

result.keyframes[0].time=binnedObjects;

console.log(result.keyframes);

*/







    }
    
    document.getElementById('spinner').style.display="none";

    return this;
}