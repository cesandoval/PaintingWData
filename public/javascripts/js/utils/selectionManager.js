THREE.SelectionManager = function( camera, controls, plane, scene, object_lookup_table ){

    var self = this,
    tooltip,
    projector,
    INTERSECTED, 
    SELECTED;
    
    var mouse = new THREE.Vector2(),
    offset = new THREE.Vector3(),
    projector = new THREE.Projector();
    
    // As the mouse moves across the canvas....
    this.onDocumentMouseMove = function( event ) {
        event.preventDefault();

        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
        projector.unprojectVector( vector, camera );
        var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

        if ( SELECTED ) {

            var intersects = raycaster.intersectObject( plane );
      try{      SELECTED.position.copy( intersects[ 0 ].point.sub( offset ) ); }
      catch(err){}
            return;
        }

        var intersects = raycaster.intersectObjects( scene.children );
        
        if ( intersects.length > 0 ) {
            if ( INTERSECTED != intersects[ 0 ].object ) {

                INTERSECTED = intersects[ 0 ].object;
            }

            container.style.cursor = 'pointer';
        } else {

            INTERSECTED = null;
            container.style.cursor = 'auto';
        }
        
    }
    
   // When clicking starts 
    this.onDocumentMouseDown = function( event ) {
        event.preventDefault();

        var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
        projector.unprojectVector( vector, camera );

        var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
        
        var intersects = raycaster.intersectObjects( scene.children );

        if ( intersects.length > 0 ) {
         //   controls.enabled = false;
            SELECTED = intersects[ 0 ].object;
        }
        
    }
    
    // When clicking completes - EXECUTE CALLBACK
    this.onDocumentMouseUp = function( event ) {
        event.preventDefault();
       
       // controls.enabled = true;
        
        if ( INTERSECTED ) {
            SELECTED = null;

            // Look up the clicked object and execute the callback if it exists!
            if(INTERSECTED.neoid ) {
                var object = object_lookup_table[ INTERSECTED.type ][ INTERSECTED.neoid ];
                var screen_pos = self.toXYCoords(INTERSECTED.position);
                
                object.callback( screen_pos );
            }
        }

        container.style.cursor = 'auto';
    }
    
    // Projects 3D position to x,y position on canvas
    this.toXYCoords = function (pos) {
        var vector = projector.projectVector(pos.clone(), camera);
        vector.x = (vector.x + 1)/2 * window.innerWidth;
        vector.y = -(vector.y - 1)/2 * window.innerHeight;
        return vector;
    }
    
    return this
}

THREE.SelectionManager.prototype = Object.create( THREE.EventDispatcher.prototype );