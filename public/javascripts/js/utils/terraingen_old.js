var TerrainGen = function(){

    var self = this;
    
    this.origin = new THREE.Vector2( 0, 0 );

    // this.terrain_material = new THREE.MeshLambertMaterial({
        // color: "rgb(202,232,121)",
        // side: THREE.DoubleSide,
        // shading : THREE.FlatShading,
        // vertexColors : THREE.VertexColors
    // });
   
    // this.water_material = new THREE.MeshLambertMaterial({
        // color:  "rgb(151 , 121 , 232)",
        // side: THREE.DoubleSide,
        // shading : THREE.FlatShading,
        // vertexColors : THREE.VertexColors
    // });

    this.terrain_material = new THREE.MeshBasicMaterial({
            color :  "rgb(202,232,121)",
            opacity : 0.75,
            transparent : true,
            wireframe : true,
            side: THREE.BackSide,
            shading: THREE.FlatShading
        });
   
    this.water_material = new THREE.MeshBasicMaterial({
            color :  "rgb(151 , 121 , 232)",
            opacity : 0.75,
            transparent : true,
            wireframe : true,
            side: THREE.BackSide,
            shading: THREE.FlatShading
        });
    
    this.generate = function(  bbox, x_step, z_step,  scene, callback ){
             
         var min,
            max,
            geometry;
            
        // Get the origin XY coordinates
        self.origin = self.lonLatToScene(bbox[0], bbox[1]);
            
        // Get the bounds XY coordinates    
        min = self.lonLatToScene(bbox[0], bbox[1]);
        max = self.lonLatToScene(bbox[2], bbox[3]);

        geometry = new THREE.PlaneGeometry(max.x, max.y, x_step-1, z_step-1);
        
        // Add plane
        plane = new THREE.Mesh( geometry,  self.terrain_material ); // this.material
        plane.visible = true;
       var trans = new THREE.Matrix4().makeTranslation( max.x/2, max.y/2, 0 );

       for ( var i = 0, len = plane.geometry.vertices.length; i < len; i++ ) {
          plane.geometry.vertices[i].applyMatrix4( trans );
          plane.geometry.vertices[i].z = plane.geometry.vertices[i].y;
          plane.geometry.vertices[i].y = 0;
       }
       
       self.set_Elevations( plane, scene, x_step, callback );
   }
    
    //  ******************** Helpers ********************
    
    // Calls the elevation API to get heights of terrain vertices, sets them and adds the object to the scene
    this.set_Elevations = function( plane, scene, x_step, callback ){

        var vertex_latLons = [];  
        // Convert all geometry vertices to longitude and latitude
        for (var i = 0; i < plane.geometry.vertices.length; i++) { 
            var lonLat = self.sceneToLonLat(plane.geometry.vertices[i]);
            vertex_latLons.push(lonLat[1],lonLat[0]);
        }
         
         // Call elevation API via sinatra app, modify mesh when heights are returned
         $.when(  $.ajax('/elevation',{
            'data': JSON.stringify({latLngCollection: vertex_latLons.join(",")}), //{action:'x',params:['a','b','c']}
            'type': 'POST',
            'processData': false,
            'contentType': 'application/json' 
            }) )
        .then(function( data, textStatus, jqXHR ) {
            elevationJSON = JSON.parse(data);
            
            elevationJSON = self.lintElevations(elevationJSON, x_step);
            
            for (var i = 0; i < plane.geometry.vertices.length; i++) { 
                var elevation = elevationJSON[i];
                plane.geometry.vertices[i].setY(elevation);
            }
            plane.geometry.computeFaceNormals();
            plane.geometry.computeVertexNormals();  
            // Cleanup
            self.origin = new THREE.Vector2( 0, 0 );
            scene.add(plane);
            panObjects.push(plane);
            callback.call( this, plane );
        });
        
    }
    
    // For some reason, holes in the elevation data come in as huge, negative elevations. 
    // This function interpolates to fill the gaps
    this.lintElevations = function(elevationJSON, x_step){
        var lintedJSON = elevationJSON;
        var rough_patch = false;
        var stack = [];
        
       for (var i = 0; i < elevationJSON.length; i++) { 
            if (lintedJSON[i]  < 0 ){
               //  beginning of  rough patch
                if( rough_patch === false ){
                      rough_patch = true;
                }
                stack.push(i);
            }
            else {
                // Mark ending of rough patch
                if( rough_patch === true ){
                    rough_patch = false;
                    
                    // interpolate values for stack indices
                    var last = lintedJSON[stack[stack.length-1]+1];
                    var first = lintedJSON[stack[0]-1];
                    var  increment = (last-first)/stack.length;
                    stack.forEach(function(i){
                        lintedJSON[i] = lintedJSON[i-1] + increment;
                    });
                    stack = [];
                }
            }
        } 
        
        return lintedJSON
    }
        
     // Vector2 is transformed by origin and passed to worldToLonLat
    this.sceneToLonLat = function( vector ) {
       var world_vector = new THREE.Vector2( vector.x + self.origin.x,  vector.z + self.origin.y );
        var lonLat = self.worldToLonLat( world_vector )
        return lonLat
    }
    
    // Vector2 is de-projected and converted lon lat
    this.worldToLonLat = function ( vector ) {
        var x = vector.x
        var y = vector.y
        var latRad, mercN,
        worldWidth = 40075000,
        worldHeight = 40008000;

        lon = (360*x / worldWidth) - 180;
        mercN = Math.PI - (2*Math.PI*y) / worldHeight;
        latRad = 2*Math.atan(Math.pow(Math.E, mercN)) - (Math.PI/2);
        lat = latRad*180/Math.PI;
        
        return [ lon, lat ]
	}
    
     // lon, lat are mercator projected
	this.lonLatToWorld = function ( lon, lat ) {
		var x, y, pointX, pointY, latRad, mercN,
			worldWidth = 40075000,
			worldHeight = 40008000;

		x = ( lon + 180 ) * ( worldWidth / 360);
		latRad = lat*Math.PI/180;
		mercN = Math.log( Math.tan((Math.PI/4)+(latRad/2)));
		y = (worldHeight/2)-(worldHeight*mercN/(2*Math.PI));

		return [ x, y ]
	}
    
    // lon, lat are transformed by origin
    this.lonLatToScene = function( lon, lat ) {
		var point = self.lonLatToWorld( lon, lat );
		return new THREE.Vector2( point[0] - self.origin.x, point[1] - self.origin.y );
	}
    
    return this
}