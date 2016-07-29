var tracing_template = function( ){
    
    var self = this;
    
    var lon,
    lat,
    location,
    x,
    z,
    geometry;
    
    material = new THREE.MeshLambertMaterial({ 
        color:  "rgb(255,112,255)", 
        transparent: true, 
        opacity: 0.2,
        shading: THREE.FlatShading, 
        vertexColors: THREE.VertexColors 
    });

              var materialSelect = new THREE.MeshBasicMaterial({
                  color: new THREE.Color(0xffffff),
                  transparent: false,
                  opacity: .2
              });

    this.get_trace = function(queryresult, duration,scene){
      
       var vertex_latLons = []; 
       
       var geometry = new THREE.Geometry();

        for (var p = 0; p < queryresult.length; p++) {

            traceStart=queryresult[p][0][1];
            traceEnd=queryresult[p][0][2];
            
            lonS = Number(traceStart.data.lon);
            latS = Number(traceStart.data.lat);
        
            locationS = self.lonLatToScene( latS, lonS );
         
            xS = locationS.x;
            zS = locationS.y;

            var vecS = new THREE.Vector3(xS,30,zS);
            
            lonE = Number(traceEnd.data.lon);
            latE = Number(traceEnd.data.lat);
        
            locationE = self.lonLatToScene( latE, lonE );
         
            xE = locationE.x;
            zE = locationE.y;

            var vecE = new THREE.Vector3(xE,30,zE);
            
			geometry.vertices.push( vecS );
			geometry.vertices.push( vecE );
			
        }
        
        	var material = new THREE.LineBasicMaterial({
                  // color:0x0d8d61,
                  color: 0xffffff,
                  transparent: true,
                  opacity: 0.8,
                  depthTest:false,
                  depthWrite:false
              });
              //material.depthTest = true;
              //material.overdraw = true;
              var line = new THREE.Line(geometry, material, THREE.LinePieces);
			scene.add( line );
			panObjects.push(line);

    }
        
    return this;
}