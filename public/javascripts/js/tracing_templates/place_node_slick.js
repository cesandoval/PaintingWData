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
        
    this.get_trace = function(trace_json, duration){
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
    }
        
    return this;
}