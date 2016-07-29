

  function resetMarquee () {
      mouseup = true;
      mousedown = false;
      marqueeGet.style.display="none";
      marqueeGet.style.width= 0 + 'px';
      marqueeGet.style.height= 0 + 'px';
      mousedowncoords = {};
    }
    
    
    function findElements(location){
        
        var currentMouse = {},
            mouseInitialDown = {},
            units,
            bounds,
            inside = false,
            selectedUnits = [],
            dupeCheck = {};
 
        currentMouse.x = location.x;
        currentMouse.y = location.y;
 
        mouseInitialDown.x = (mousedowncoords.x - offset.x);
        mouseInitialDown.y = (mousedowncoords.y - offset.y);
 
        units = getUnitVertCoordinates();

        //console.log(units);

        bounds = findBounds(currentMouse, mousedowncoords);
        
        for(var i = 0; i < units.length; i++) {
          
       //   if (i==60){
        //    inside = withinBounds(units[i].pos, bounds,i);
        //  }else{
              inside = withinBounds(units[i].pos, bounds);
       //   }
        
            if(inside){// && (dupeCheck[units[i].id] === undefined)){
            
                selectedUnits.push(units[i]);
                dupeCheck[units[i].name] = true;
            }
        }
 
 //console.log(selectedUnits[0].mesh.n_ID);
// console.log(selectedUnits);
 
        return selectedUnits;
    }
 
    // takes the mouse up and mouse down positions and calculates an origin
    // and delta for the square.
    // this is compared to the unprojected XY centroids of the cubes.
    function findBounds (pos1, pos2) {
 
        // calculating the origin and vector.
        var origin = {},
            delta = {};
 
        if (pos1.y < pos2.y) {
            origin.y = pos1.y;
            delta.y = pos2.y- pos1.y;
        } else {
            origin.y = pos2.y;
            delta.y = pos1.y - pos2.y;
        }
 
        if(pos1.x < pos2.x) {
            origin.x = pos1.x;
            delta.x = pos2.x - pos1.x;
        } else {
            origin.x = pos2.x;
            delta.x = pos1.x - pos2.x;
        }
        
        //console.log(origin);
        //console.log(delta);
        
        return ({origin: origin, delta: delta});
    }
 
 
    // Takes a position and detect if it is within delta of the origin defined by findBounds ({origin, delta})
    function withinBounds(pos, bounds) {
        
        var ox = bounds.origin.x,
            dx = bounds.origin.x + bounds.delta.x,
            oy = bounds.origin.y,
            dy = bounds.origin.y + bounds.delta.y;
 
        if((pos.x >= ox) && (pos.x <= dx)) {
            if((pos.y >= oy) && (pos.y <= dy)) {
                return true;
            }
        }
        
        //console.log('inside');
 
        return false;
    }
 
    function getUnitVertCoordinates (threeJsContext) {
 
      var units = [],
          verts = [],
          child,
          prevChild,
          unit,
          vector,
          pos,
          temp,
          i, q;

      for(i = 0; i < selectObjects.length; i++) {
          child = selectObjects[i];
          child.updateMatrixWorld();
 
          verts = [
              child.geometry.boundingBox.center,
          ];
          
        //  console.log(child.geometry.boundingBox.center);
          
          for(q = 0; q < verts.length; q++) {
              vector = verts[q].clone();
              var show=0;
             //vector.applyMatrix4(child.matrixWorld);
              
             if (i==60){
                //  console.log("pos:");
                //console.log(vector);
              show=60;
              }
              if (i==72){
                    //console.log("pos:");
                    //console.log(vector);
              show=72;
              }
              
              unit = {};
              unit.id = child.id;
              unit.mesh = child;
              unit.pos = toScreenXY(vector,show);
              units.push(unit);
          }
      }
      return units;
    }
 
    function toScreenXY (position,show) {
        
        //console.log("position:");
        //console.log(position);
 
        var pos = position.clone();
        var posSave = position.clone();

        // flipping the coordinates and adding the global pan
        pos.x=posSave.x+panObjects[0].position.x;
        pos.y=-posSave.z+panObjects[0].position.y;
        pos.z=posSave.y+panObjects[0].position.z;
        
        var projScreenMat = new THREE.Matrix4();
        projScreenMat.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
        
        //console.log(pos);
        
        pos.applyProjection(projScreenMat);
        
        //console.log("pos:");
      //  if (show>0){
      //      console.log("pos: "+show);
      //      console.log(pos);
      //  }
        
       //  return { x: ( pos.x + 1 ) * demo.jqContainer.width() / 2 + demo.jqContainer.offset().left,
       //      y: ( - pos.y + 1) * demo.jqContainer.height() / 2 + demo.jqContainer.offset().top };

        return {x: ( pos.x + 1 ) * window.innerWidth / 2,
                y: ( -pos.y + 1 ) * window.innerHeight / 2 };
                
                
              //         return {x: ( pos.x - 1 ) * (event.clientX / window.innerWidth) * 2,
             //   y: ( pos.y - 1) * -(event.clientY / window.innerHeight) * 2};
                
                //  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                //  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    }
    
    
    
    
    