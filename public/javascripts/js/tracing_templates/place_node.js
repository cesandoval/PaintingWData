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
      
        
        console.log(queryresult);
      
      
       var pGeo = new THREE.Geometry();
       
        for (var p = 0; p < queryresult.length; p++) {
            
            trace_json=queryresult[p][1];
            
        lon = Number(trace_json.data.lon);
        lat = Number(trace_json.data.lat);
        
         location = self.lonLatToScene( lon, lat );
         
        x = location.x;
        z = location.y;
         
         var vec3 = new THREE.Vector3(x,0,z);
         
           pGeo.vertices.push(vec3);
        
        
    var geometry = new THREE.SphereGeometry( 50, 10, 10 );
      var material = new THREE.MeshBasicMaterial( );
      var clicksphere = new THREE.Mesh(geometry,materialSelect);
      
      
       clicksphere.applyMatrix( new THREE.Matrix4().makeTranslation(vec3.x, 0, vec3.z) );
       
       
    //clicksphere.data=cA;
            
             clicksphere.geometry.computeBoundingBox ();
             
        // This code is not running yet
        
        var boundingBox = clicksphere.geometry.boundingBox;

        var x0 = boundingBox.min.x;
        var x1 = boundingBox.max.x;
        var y0 = boundingBox.min.y;
        var y1 = boundingBox.max.y;
        var z0 = boundingBox.min.z;
        var z1 = boundingBox.max.z;


        var bWidth = ( x0 > x1 ) ? x0 - x1 : x1 - x0;
        var bHeight = ( y0 > y1 ) ? y0 - y1 : y1 - y0;
        var bDepth = ( z0 > z1 ) ? z0 - z1 : z1 - z0;
    
        var centroidX = x0 + ( bWidth / 2 ) + clicksphere.position.x;
        var centroidY = y0 + ( bHeight / 2 )+ clicksphere.position.y;
        var centroidZ = z0 + ( bDepth / 2 ) + clicksphere.position.z;
        
        // var centerpt = mesh.geometry.boundingBox.max.clone();
        var centerpt = new THREE.Vector3(centroidX,centroidZ,-centroidY);
        
        // From it is fine
        clicksphere.geometry.boundingBox.center=centerpt;
            
   

   //   clicksphere.position.x += panObjects[0].position.x;
//      clicksphere.position.z += panObjects[0].position.z;

      scene.add(clicksphere);
      panObjects.push(clicksphere);
      
selectObjects.push(clicksphere);
            
            
        }
        
        
          // var dotSize = 0.025 * scaleMaster;
      var dotSize = 600;

    var color = new THREE.Color("rgb(255,195,100)");
 
     var pMaterial = new THREE.ParticleBasicMaterial({
          color: color,
          size: dotSize,
          sizeAttenuation: true,
          map: THREE.ImageUtils.loadTexture(
          //  "resources/images/particle_white.png"
          "images/spark_static.png"),
          blending: THREE.AdditiveBlending,
          depthTest: false,
          transparent: true
      });
      
      var pointData = new THREE.ParticleSystem(pGeo, pMaterial);
      
                  
                scene.add(pointData);
      panObjects.push(pointData);
      
      
      /*
     // pointData.data=cA;
      pointData.position.x += panObjects[0].position.x;
      pointData.position.z += panObjects[0].position.z;
      pointData.scale.set(scaleMaster, scaleMaster, scaleMaster);
      */
      
  //    return pointData;




      
      /*
            lon = Number(trace_json.data.lon);
        lat = Number(trace_json.data.lat);
        
        location = self.lonLatToScene( lon, lat );
        x = location.x;
        z = location.y;
      */
        
        /*
        for (var p = 0; p < data.features.length; p++) { //each twitter point
   
  //   data1.forEach(function(d, p_i) {

 var pGeo = new THREE.Geometry();
          var cA = data.features[p].properties;

              var c = {
                  0: parseFloat(data.features[p].geometry.coordinates[0]),
                  1: parseFloat(data.features[p].geometry.coordinates[1])
              };
              
              // if location is outside of city bounding box, dont visualize - adjust the datathrottle for this
              

          pos = getWorldPosition(c[1], c[0], 0, "MERCATOR");

          vec3 = createVector3(pos, c, dotSize, 0xff0000);

          vec3.x = -(vec3.x - test.x) * -scaleMaster;
          vec3.y = 0;
          vec3.z = -(vec3.z - test.z) * -scaleMaster;
          //				console.log(vec3);
          pGeo.vertices.push(vec3);


     // var dotSize = 0.025 * scaleMaster;
      var dotSize = 0.25 * scaleMaster;

      var color = new THREE.Color(0xffffff);

// assign color based on category
if (cA.Type=="Sale Comp"){
   var color = new THREE.Color(twitterColor);
}else if (cA.Type=="Lease Comp"){
    var color = new THREE.Color("rgb(255,195,100)");
}else{
    var color = new THREE.Color("rgb(100,100,100)");
}
 
      pMaterial = new THREE.ParticleBasicMaterial({
          color: color,
          size: dotSize,
          sizeAttenuation: true,
          map: THREE.ImageUtils.loadTexture(
          //  "resources/images/particle_white.png"
          "resources/images/spark_static.png"),
          blending: THREE.AdditiveBlending,
          depthTest: false,
          transparent: true
      });
      
      pointData = new THREE.ParticleSystem(pGeo, pMaterial);
     // pointData.data=cA;
      pointData.position.x += panObjects[0].position.x;
      pointData.position.z += panObjects[0].position.z;
      pointData.scale.set(scaleMaster, scaleMaster, scaleMaster);
      mathbox._world._scene.add(pointData);
      panObjects.push(pointData);
      
      var geometry = new THREE.SphereGeometry( 5, 10, 10 );
      var material = new THREE.MeshBasicMaterial( );
      var clicksphere = new THREE.Mesh(geometry,material);
      
    clicksphere.data=cA;
            
      clicksphere.position.x = vec3.x* scaleMaster;
      clicksphere.position.z = vec3.z* scaleMaster;
      
      clicksphere.position.x += panObjects[0].position.x;
      clicksphere.position.z += panObjects[0].position.z;
      mathbox._world._scene.add(clicksphere);
      panObjects.push(clicksphere);
      
selectObjects.push(clicksphere);

      //$("#feedback").text("adding  "+iter*meshSize+"/"+maxElements+" datapoints ");     
    

                }
    
    */
        
        
        
        /*
        
        lon = Number(trace_json.data.lon);
        lat = Number(trace_json.data.lat);
        
        location = self.lonLatToScene( lon, lat );
        x = location.x;
        z = location.y;

        
        geometry = new THREE.SphereGeometry( 380, 32, 32 );
        
        sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(x, 0, z);
        sphere.renderDepth = 20000;
            
        sphere.callback = function( screenpos ){
            tooltip = self.display_tooltip(trace_json.data.raw_tags, screenpos);
        }
        
        // Animation Methods/Tweens
                 
        var tweenHead = new TWEEN.Tween({  o:  0.2 }).to({ o:  1.0 }, duration/2)
         .easing(TWEEN.Easing.Elastic.InOut)
        .onUpdate(function(){ 
                sphere.material.opacity = this.o;
            })
        .onComplete(function() {
           this.o = 0.2; // reset tweening variable
        });

        var tweenBack= new TWEEN.Tween({  o:  1.0 }).to({ o:  0.2 }, duration/2)
         .easing(TWEEN.Easing.Elastic.InOut)
        .onUpdate(function(){ 
                sphere.material.opacity = this.o;
            })
        .onComplete(function() {
           this.o = 1.0; // reset tweening variable
        });
                    
        tweenHead.chain(tweenBack);
        tweenHead.start();
        
        return sphere;
        
        
    */
    }
        
    return this;
}