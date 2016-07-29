var tracing_template = function(){
    
    var self = this;
    self.material =new THREE.LineBasicMaterial({color: "rgb(255,0,149)"});
    
    this.get_trace = function(trace_json, duration){
        
        p0 = self.lonLatToScene( trace_json[0].data.lon , trace_json[0].data.lat );
        p1 = self.lonLatToScene( trace_json[1].data.lon , trace_json[1].data.lat );
        p2 = self.lonLatToScene( trace_json[2].data.lon , trace_json[2].data.lat );
        
        
        
        var geometry = new THREE.Geometry();
        
        geometry.vertices.push( new THREE.Vector3( p0.x, 30, p0.y ) );
        geometry.vertices.push( new THREE.Vector3( p1.x, 30, p1.y ) );
        geometry.vertices.push( new THREE.Vector3( p2.x, 30, p2.y ) );
        
        var line = new THREE.Line( geometry,  self.material );
        

        return line;
    }
    

    return this;
}