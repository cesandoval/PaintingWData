// as_tracing_template is a mixin function applied to all tracing_templates
// add shared variables and utility functions for tracing templates here.
var as_tracing_template = function() {

    var self = this;
    this.origin = new THREE.Vector2( 0, 0 );
    this.object_lookup_table;
    // var tooltip;
    
    this.set_origin = function(lon, lat){
        self.origin = self.lonLatToScene(lon, lat);
    }
    
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

    this.lonLatToScene = function( lon, lat ) {
		var point = self.lonLatToWorld( lon, lat );
		return new THREE.Vector2( point[0] - self.origin.x, point[1] - self.origin.y );
	}
    
    this.display_tooltip = function(text, location){
        var tooltip;
        tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = text;
        tooltip.style.top = location.y + 'px';
        tooltip.style.left = location.x + 'px';
        
        $('body').append(tooltip);
        setTimeout(function(){
            $(tooltip).remove();
        }, 3000);
    }
    
};