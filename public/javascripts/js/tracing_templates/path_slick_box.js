var tracing_template = function(){
    
    var self = this;
    self.material = new THREE.MeshLambertMaterial({ color : 0xFFF0FF })
    
    this.get_trace = function(trace_json, duration){
        
        var p0 = self.lonLatToScene( Number(trace_json[0].data.lon) , Number(trace_json[0].data.lat) );
         
        var BOX = new THREE.Mesh( new THREE.BoxGeometry(100, 100, 100 ), self.material);
        BOX.position.set(p0.x, 0, p0.y);
        return BOX;
    }
    

    return this;
}