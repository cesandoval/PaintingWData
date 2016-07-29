        function onDocumentMouseMove_MCS(event) {

            event.preventDefault();

            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            //console.log(event.clientX);
            //console.log(event.clientY);
            
            if (isMouseDownRight) {}

            if (isMouseDownLeft && shiftDOWN != true) {

                mouse.x = -event.clientX;
                mouse.y = event.clientY;

                var zoomDamp = .75;

                target.x = targetOnDown.x + (mouse.x - mouseOnDown.x) * 0.005 * zoomDamp;
                target.y = targetOnDown.y + (mouse.y - mouseOnDown.y) * 0.005 * zoomDamp;

                target.y = target.y > PI_HALF ? PI_HALF : target.y;
                target.y = target.y < -PI_HALF ? -PI_HALF : target.y;

            }
            
           if(mousedown && event.which==1){// && shiftDOWN == false){
                
            //    marqueeGet.fadeIn();
         
                var pos1 = {};
                pos1.x = event.clientX - mousedowncoords.x;
                pos1.y = event.clientY - mousedowncoords.y;
             
          
                marqueeGet.style.display="";
                
                if (pos1.x < 0 && pos1.y < 0) {
                 // marquee.css({left: event.clientX + 'px', width: -pos1.x + 'px', top: event.clientY + 'px', height: -pos1.y + 'px'});
                      marqueeGet.style.left= event.clientX + 'px';
                      marqueeGet.style.width= -pos1.x + 'px';
                      marqueeGet.style.top= event.clientY + 'px';
                      marqueeGet.style.height= -pos1.y + 'px';
                } else if ( pos1.x >= 0 && pos1.y <= 0) {
                  //  marquee.css({left: mousedowncoords.x + 'px',width: pos1.x + 'px', top: event.clientY, height: -pos1.y + 'px'});
                      marqueeGet.style.left= mousedowncoords.x + 'px';
                      marqueeGet.style.width= pos1.x + 'px';
                      marqueeGet.style.top= event.clientY +'px';
                      marqueeGet.style.height=  -pos1.y + 'px';
                } else if (pos1.x >= 0 && pos1.y >= 0) {
                  //  marquee.css({left: mousedowncoords.x + 'px', width: pos1.x + 'px', height: pos1.y + 'px', top: mousedowncoords.y + 'px'});
                      marqueeGet.style.left= mousedowncoords.x + 'px';
                      marqueeGet.style.width= pos1.x + 'px'
                      marqueeGet.style.height= pos1.y + 'px';
                      marqueeGet.style.top= mousedowncoords.y + 'px';
                } else if (pos1.x < 0 && pos1.y >= 0) {
                  //  marquee.css({left: event.clientX + 'px', width: -pos1.x + 'px', height: pos1.y + 'px', top: mousedowncoords.y + 'px'});
                      marqueeGet.style.left= event.clientX + 'px';
                      marqueeGet.style.width= -pos1.x + 'px';
                      marqueeGet.style.height= pos1.y + 'px';
                      marqueeGet.style.top=mousedowncoords.y + 'px';
                }
         
         
       
                var selectedPoints = findElements({x: event.clientX, y: event.clientY});
               
                console.log(selectedPoints);
         //     console.log(selectObjects);
                 
                selectTempNodes = [];
            
           
                
                
                for (var ii=0;ii<selectObjects.length;ii++){
                
                    selectObjects[ii].material.visible=false;
                }
             
                for (var kk=0;kk<selectedPoints.length;kk++){
                    
                    for (var ii=0;ii<selectObjects.length;ii++){
                
                        selectObjects[ii].material.visible=false;
                
                        if (selectedPoints[kk].mesh.id==selectObjects[ii].id){
                        
                           // selectObjects[ii].material.visible=true;
                    
                            selectTempNodes.push(selectObjects[ii]);
                             
                        }
                    }
                }
                   
            }
            
            

            var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
            projector.unprojectVector(vector, camera);
            var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

         //   var intersects_nodes = ray.intersectObjects(selectObjects);
          //  var intersects_faces = ray.intersectObjects(nurbsObjects);
            
            //console.log(intersects_faces);
            //console.log(intersects_faces[0].object.id);
            //console.log(nurbsObjects);
            
         /*   var FaceSelMaterial = new THREE.MeshLambertMaterial({ color:0xffff00,transparent:true,opacity:0.5,side: THREE.DoubleSide });
            selBuild_faces.style.display = 'none';
            
            if (intersects_faces.length > 0) {
                
            
                for (var i=0;i<nurbsObjects.length;i++){
                    
                    var f_index = indexOf.call(selectFaces, nurbsObjects[i].f_ID);
                    
                    if (f_index < 0 ) {
                        
                        nurbsObjects[i].material = nurbs_material;
                    }
    
                    if (nurbsObjects[i].id == intersects_faces[0].object.id && intersects_nodes.length === 0) {
                        
                        //console.log(nurbsObjects[i].id);
                        
                        if (f_index < 0 ) {
                        
                            nurbsObjects[i].material = FaceHoverMaterial;
                        } else {
                            
                            nurbsObjects[i].material = FaceSelMaterial;
                        }
                        
                        hoverFaceID = nurbsObjects[i].f_ID;
                        
                        selBuild_faces.style.display = 'inline';
                        selBuild_faces.style.left = event.clientX+20+'px';
                        selBuild_faces.style.top = event.clientY-20+'px';
                        selBuild_faces.innerHTML = "Face: " + nurbsObjects[i].f_ID;
                    }
                }
            } else {
                
                for (var i=0;i<nurbsObjects.length;i++){
                    
                    
                    var f_index = indexOf.call(selectFaces, nurbsObjects[i].f_ID);
                    
                    if (f_index < 0 ) {
                        
                        nurbsObjects[i].material = nurbs_material;
                    } else {
                    
                        nurbsObjects[i].material = FaceSelMaterial;
                    }
                }
                selBuild_faces.style.display = 'none';
                hoverFaceID = -1;
                
            }*/

            if (SELECTED !== 0) {
                
                newSEL = SELECTED;
            }
            
            //console.log(SELECTED);
            /*
            if (intersects_nodes.length > 0) {

                if (mark == 1) {
                    if (SELECTED !== 0) {
                        
                       SELECTED.material.visible = true;
                    }
                }
                SELECTED = intersects_nodes[0].object;
               
                mark = 1;
                //    container.style.cursor = 'pointer';
            }
            if (intersects_nodes.length === 0) {

                SELECTED = 0;
            }
*/

/*
console.log(selectNodes);

  for (i = 0; i < selectObjects.length; i++) {
   
        for (j=0;j<selectNodes.length;j++){

        
        }
        
  }
  */
 
   /*

   console.log(indexOf.call(selectNodes, selectObjects[i]));
   
            if (selectObjects[i] != SELECTED && indexOf.call(selectNodes, selectObjects[i]) < 0) {
                    selectObjects[i].material.visible = true;
                    selBuild.style.display = 'none';
               }
               
         }
         
         */



/*
            for (i = 0; i < selectObjects.length; i++) {
                
                //console.log(selectObjects[i]);
                
                if (selectObjects[i] != SELECTED && indexOf.call(selectNodes, selectObjects[i].n_ID) < 0) {
                    
                    selectObjects[i].material.visible = false;
                    selBuild.style.display = 'none';
                }
            }
*/


            TEXTcontainer = document.createElement('div');
            TEXTcontainer.style.zIndex = 10;
            document.body.appendChild(TEXTcontainer);

            if (selMARK === 0) {
                
                
                selBuild = document.createElement('div');
                TEXTcontainer.appendChild(selBuild);
                selBuild.style.position = 'absolute';
                selBuild.style.display = 'none';
                selBuild.style.textAlign = "left";
                selBuild.style.fontSize = '14px';
                selBuild.style.left = event.clientX+'px';
                selBuild.style.top = event.clientY+'px';
                selBuild.style.zIndex = 200000000;
                selBuild.style.color ='#000000';
                
                selMARK = 1;
            }
            
            try {
                
                if (SELECTED.n_ID !== undefined) {

                    selBuild.style.display = 'inline';
                    selBuild.style.left = event.clientX+20+'px';
                    selBuild.style.top = event.clientY-20+'px';
                    selBuild.innerHTML = "Node: " + SELECTED.n_ID;
                } else {
                    
                    selBuild.style.display = 'none';
                }
            } catch (err) {

            }
        }

        function onDblClick_MCS(event) {

           event.preventDefault();

            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
               // console.log(mouse.x,mouse.y)
            
            mouse.x = event.clientX;
            mouse.y = event.clientY;
                
            //console.log(mouse.x,mouse.y)
            
        }


        function onDocumentKeyDown_MCS(event) {
            switch (event.keyCode) {

            case 16:
                shiftDOWN = true;
                break;
                
            case 17:
                ctrlDOWN = true;
                break;
            
            case 27:
                escDOWN = true;
                // UpdateDataTableElement(selectNodes);
                break;
                
            case 32:
                if (panHOLDmove === true) {
                    panHOLDmove = false;
                } else {
                    panHOLDmove = true;
                }
                break;
            }
        }

        function onDocumentKeyUp_MCS(event) {
            switch (event.keyCode) {
            
            // Shift Key   
            case 16:
                shiftDOWN = false;
                break;
            // Ctrl Key  
            case 17:
                ctrlDOWN = false;
                break;
            
            // Escape Key
            case 27:
                
                escDOWN = false;
                ctrlDOWN = false;
                
    //            ClearSelection();
          //      UpdateDataTableElement();
                break;
            case 119:
                
         //       RunFDSolve();
                break;
            }
        }
        
        function onDocumentMouseout_MCS () {
            
            
          resetMarquee ();
        }



        function onDocumentMouseDown_MCS(event) {
            
            event.preventDefault();
            
            // Event for Left Button
            if (event.which==1){
                
                //console.log(SELECTED);
                
                if (SELECTED !== 0) { // && ctrlDOWN){
                    
                    SELECTED.material.visible = true;
                    
                    //console.log(SELECTED.n_ID);
                    
              /*      var index = indexOf.call(selectNodes, SELECTED.n_ID);
                    
                    //console.log(selectNodes.length);
                    
                    if (index < 0 || selectNodes.length === 0) {
                        
                        selectNodes.push(SELECTED.n_ID);
                        
                        UpdateDataTableElement();
                    } else {
                        
                //        selectNodes.splice(index, 1);
                        SELECTED.material.visible = false;
                        selBuild.display = 'none';
                        
                        // Call Global Function to update the DATA Table content
                        UpdateDataTableElement();
                    }
                    */
                        
                    //console.log(selectNodes);
                    
                } else {
            
                    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
                    var pos = {};

                    mousedown = true;
                    mousedowncoords = {};
                
                    mousedowncoords.x = event.clientX;
                    mousedowncoords.y = event.clientY;

                    pos.x = (event.clientX / window.innerWidth) * 2 - 1;
                    pos.y = -(event.clientY / window.innerHeight) * 2 + 1;

                    var vector = new THREE.Vector3(pos.x, pos.y, 1);

              //      projectorSelect.unprojectVector(vector, camera);
                    
                    //console.log(selectFaces);
                    //console.log(hoverFaceID);
                    
               /*     var index = indexOf.call(selectFaces, hoverFaceID);
                    
                    if (index < 0 || selectFaces.length === 0) {
                        
                        
                        if (hoverFaceID >= 0) {
                            selectFaces.push(hoverFaceID);
                        }
                        
                        //UpdateDataTableElement();
                    } else {
                        
                        selectFaces.splice(index, 1);
                        
                        
                        //SELECTED.material.visible = false;
                        //selBuild.display = 'none';
                        
                        // Call Global Function to update the DATA Table content
                        //UpdateDataTableElement();
                    }
                    
                    UpdateDataTableElement();
                    */
                    
                }
                
            }
            // Event for middle button
            if (event.which == 2) {}
            
            // Event for Right Button
            if (event.which == 3) {
                isMouseDownLeft = true;
                mouseOnDown.x = -event.clientX;
                mouseOnDown.y = event.clientY;
                targetOnDown.x = target.x;
                targetOnDown.y = target.y;
                container.style.cursor = 'move';
            }
        }

        function onDocumentMouseUp_MCS(event) {
            event.preventDefault();
            
            if (event.which==1){
                
                event.stopPropagation();
 
      // reset the marquee selection
               resetMarquee();
 
      // appending a click marker.
   //   demo.jqContainer.append('<div class="clickMarkers" style="left: ' + event.offsetX + 'px; top: ' + event.offsetY +'px">U</div>' );
 
            }
            
            // Event on Middle Button
            if (event.which == 2) {
                isMouseDownRight = false;
                // if (selected) {}
            }
            
            // Event on Right Button
            if (event.which == 3) {
                isMouseDownLeft = false;
                container.style.cursor = 'auto';
            }
            
            console.log(selectTempNodes);
            
            
            
            if (selectTempNodes.length>0) {
                
                
                if (ctrlDOWN === false) {
                    
                    //console.log(selectNodes);
                    selectNodes = [];
                }
                
                for (var ll=0;ll<selectTempNodes.length;ll++) {
                 
                  selectTempNodes[ll].material.visible=true;
                  selectNodes.push(selectTempNodes[ll]);
                }
                
     
                
                //console.log(selectNodes);
            }
            selectTempNodes = [];
        
            
        }

        function onDocumentMouseWheel_MCS(){
            
            //console.log(event.wheelDeltaY);
            
            event.preventDefault();
            //if (overRenderer) {
           //     var zoomCall=(event.wheelDeltaY * 1) / Math.sqrt( 0.6*distance );
                var zoomCall=(event.wheelDeltaY * 0.6);
             //   console.log(zoomCall);
                zoom(zoomCall);
           // }
            
            // Resize the Particles and Circles for Selection
            //console.log(nodeObjects);
            
            //console.log(nodeSize);
            
            /*
            if (event.wheelDeltaY < 0) {
                
                nodeSize = nodeSize + nodeSizeDelta;
            } else {
            
                nodeSize = nodeSize - nodeSizeDelta;
            }
            
            //console.log(nodeSize);
            
            nodeObjects[0].material.size = nodeSize;
            
            //console.log(selectObjects);
            
            for (var i=0;i<selectObjects.length;i++) {
                
                selectObjects[i].geometry.radius = nodeSize;
                //selectObjects[i].mesh.scale.set(10,10,10);
                //selectObjects[i].geometry.verticesNeedUpdate = true;
            }
            
	        nodeObjects[0].material.sizeNeedUpdate = true;
	        nodeObjects[0].material.verticesNeedUpdate = true;
	        
	        */
	        
            return false;
        }


/*
        function onWindowResize(event) {
            SCREEN_WIDTH = window.innerWidth;
            SCREEN_HEIGHT = window.innerHeight - 2 * MARGIN;
            renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
            camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
            camera.updateProjectionMatrix();
        }
*/

        function zoom(delta) {
            distanceTarget -= delta;
         //   distanceTarget = distanceTarget > 1800 ? 1800 : distanceTarget;
            distanceTarget = distanceTarget < 10 ? 10 : distanceTarget;
        }


         // window exit function
        window.onbeforeunload = function () {

            console.log("Goodbye");

        };