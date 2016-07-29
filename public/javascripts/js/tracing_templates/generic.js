var tracing_template = function() {

    var self = this;

    var lon,
    lat,
    location,
    x,
    z,
    geometry;


    //Particle Style
    var dotSize = 300;

    var color = new THREE.Color("rgb(255,195,100)");

    var pMaterial = new THREE.ParticleBasicMaterial({
        color: color,
        size: dotSize,
        sizeAttenuation: true,
        map: THREE.ImageUtils.loadTexture(
        //  "resources/images/particle_white.png"
        "images/spark_static.png"),
        blending: THREE.AdditiveBlending,
        //  vertexColors: true,
        depthTest: false,
        transparent: true
    });





    this.get_trace = function(keyframe, scope, scene) {

        var query = keyframe.queries[0].queryresult.data;


        var configType = ["sphere", "point"];
        var configColR = [255, 255];
        var configColG = [255, 195];
        var configColB = [255, 100];
        var configSize = [600, 150];
        var configTime = [false, true];

        var geoType = [];
        var geoSize = [];
        var geoCol = [];


        // I want to create a unique merged particle object for each keyframe time object
        for (var i = 0; i < keyframe.time.length; i++) { // this will loop thorugh the time step keyframes


            var pGeo = new THREE.Geometry(); //Point Geometry for Nodes
            var lGeo = new THREE.Geometry(); //Line Geometry for Links

            for (var k = 0; k < keyframe.queries[0].queryresult.data.length; k++) {

                var idMatch = keyframe.queries[0].queryresult.data[k][0].self.split("/")[keyframe.queries[0].queryresult.data[k][0].self.split("/").length - 1];

                for (var kk = 0; kk < keyframe.time[i].length; kk++) {
                    if (idMatch == keyframe.time[i][kk].id) {

                        // upon a match - we need to add the particle system for the entire keyframe time

                        //    console.log(keyframe.queries[0].queryresult.data[k][0].data.content);

                        var trace_json_start = keyframe.queries[0].queryresult.data[k][0];

                        lon = Number(trace_json_start.data.lon);
                        lat = Number(trace_json_start.data.lat);

                        location = self.lonLatToScene(lon, lat); //Convert to Scene Coords

                        //Extract X,Y Coords
                        x = location.x;
                        z = location.y;


                        var nodePos = new THREE.Vector3(x, 0, z); //Setup Vector for nodePos
                        pGeo.vertices.push(nodePos); //Store each Point
                        //   geoType.push(configType[k-1]);




                        //	col.setRGB( configColR[k-1]/255, configColG[k-1]/255, configColB[k-1]/255);

                        //      geoCol.push(col);
                        //      geoSize.push(configSize[k-1]);


                    }
                }




            }

            /*                     console.log(pGeo);
        console.log(geoType);
        console.log(geoCol);
        console.log(geoSize);
        pGeo.colors  = geoCol;*/

            var col = new THREE.Color(0xffffff);
            var colorrand = Math.random();
            col.setRGB(colorrand, colorrand, colorrand);

            var pMaterial = new THREE.ParticleBasicMaterial({
                color: col,
                size: dotSize,
                sizeAttenuation: true,
                map: THREE.ImageUtils.loadTexture(
                //  "resources/images/particle_white.png"
                "images/spark_static.png"),
                blending: THREE.AdditiveBlending,
                //  vertexColors: true,
                depthTest: false,
                transparent: true
            });


            var pointData = new THREE.ParticleSystem(pGeo, pMaterial);


            pointData.time = i;


            scene.add(pointData);
            panObjects.push(pointData);

            viewObjects.push(pointData);

            console.log(pointData);


            /*  var line = new THREE.Line(pGeo, lMaterial, THREE.LinePieces);
		scene.add( line );
		panObjects.push(line);*/

        }



        /*
    viz_config={
     configType:["sphere","point"],
     configColR:[255,255],
     configColG:[255,195],
     configColB:[255,100],
     configSize:[600,150],
     configTime :[false,true]
}
*/


        /*
        for (var p = 0; p < query.length; p++) {

            //Loop through each database record
            for (var q = 1; q < query[p][0].length; q++)
            {
                //Within each record, loop through the nodes/relationships
                //Item 0 is the Path
                //Remaining items are the nodes
                //Assume nodes are chained by relationships (1 > 2, 2 > 3, 3 > 4)
                
                trace_json_start = query[p][0][q];

                //Get Lat/Lon
                lon = Number(trace_json_start.data.lon);
                lat = Number(trace_json_start.data.lat);
    
                location = self.lonLatToScene(lon, lat); //Convert to Scene Coords
    
                //Extract X,Y Coords
                x = location.x;
                z = location.y;
    
                var nodePos = new THREE.Vector3(x, 0, z); //Setup Vector for nodePos
                pGeo.vertices.push(nodePos); //Store each Point
                geoType.push(configType[q-1]);
                
                var col = new THREE.Color( 0xffffff );
				col.setRGB( configColR[q-1]/255, configColG[q-1]/255, configColB[q-1]/255);
					
                geoCol.push(col);
                geoSize.push(configSize[q-1]);
                
            }
			

        }

        console.log(pGeo);
        console.log(geoType);
        console.log(geoCol);
        console.log(geoSize);
        pGeo.colors  = geoCol;

        var pointData = new THREE.ParticleSystem(pGeo, pMaterial);
        scene.add(pointData);
        panObjects.push(pointData);
        
        var line = new THREE.Line(pGeo, lMaterial, THREE.LinePieces);
		scene.add( line );
		panObjects.push(line);
        */


    }

    return this;
}