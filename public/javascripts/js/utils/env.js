THREE.Env = function () {

	var self = this,
	cur_tracing_template,
	container,
	controls,
	origin,
	terraingen,
	selection_manager,
	scene,
	renderer,
	geometry,
	material,
	plane,
	cube;

	self.objects = {};
	self.object_lookup_table = {
		node : {},
		relationship : {}
	};
	self.materials = {};
    
	var color = new THREE.Color("rgb(42,42,42)");
    
	// Initializes threeJS stuff
	this.init = function () {

		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100000);


		renderer = new THREE.WebGLRenderer({
				alpha : true,
				antialias : true
			});

		container = document.createElement('div');
		document.body.appendChild(container);

		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(color, 1);
		container.appendChild(renderer.domElement);

/*
		camera.position.z = 400;
		camera.position.x = -400;
		camera.position.y = 800;
*/

      camera.position.x = radious * Math.sin(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
      camera.position.y = radious * Math.sin(phi * Math.PI / 360);
      camera.position.z = radious * Math.cos(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
      camera.updateMatrix();
      camera.target = new THREE.Vector3(0, 0, 0);

//		controls = new THREE.OrbitControls(camera, container);
//		controls.target = new THREE.Vector3(2500, 0, -2500);

      panplane = new THREE.Mesh(new THREE.PlaneGeometry(50000, 50000, 20, 20), new THREE.MeshLambertMaterial({
                            color: 0x555555,
                            wireframe: true,
                            visible: false
                         }));

        panplane.rotation.x = +90 * Math.PI / 180;
        panplane.rotation.y = -180 * Math.PI / 180;
        panplane.STARTPOSPLANEx=panplane.position.x;
        panplane.STARTPOSPLANEz=panplane.position.z;
       
       scene.add(panplane);
     panplane.name = "xz-plane";
        panplanes.push(panplane);
    
        // initialize the pan controls
        PanControls(camera, [], panplanes, renderer.domElement);
    
    
    


		self.materials.lambert = new THREE.MeshLambertMaterial({
				color : "rgb(255,112,255)",
				transparent : true,
				opacity : 0.5,
				shading : THREE.FlatShading,
				vertexColors : THREE.VertexColors
			});

		self.materials.phong = new THREE.MeshPhongMaterial({
				ambient : 0x030303,
				color : "rgb(255,112,255)",
				specular : 0x009900,
				shininess : 30,
				transparent : true,
				opacity : 0.5,
				shading : THREE.FlatShading,
				vertexColors : THREE.VertexColors
			});

		self.materials.wireframe = new THREE.MeshBasicMaterial({
				color : "rgb(255,112,255)",
				shading : THREE.FlatShading,
				wireframe : true,
				transparent : true
			});

		plane = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000, 100, 100), new THREE.MeshBasicMaterial({
					color : 0x000000,
					opacity : 0.25,
					transparent : true,
					wireframe : true
				}));
		plane.visible = true;
	//	plane.position.x = 5000 / 2;
        plane.position.y = -10;
	//	plane.position.z = -5000 / 2;
		plane.rotation.x = Math.PI / 2;
		plane.name = "xz-plane";
		scene.add(plane);
		
		panObjects.push(plane);

		// create terrain generator
		terraingen = new TerrainGen();

		// create selection manager
		selection_manager = new THREE.SelectionManager(camera, controls, plane, scene, self.object_lookup_table);
        
        var ambientLight = new THREE.AmbientLight(0x0c0c0c);
        scene.add(ambientLight);
        
        var light = new THREE.DirectionalLight(0xffffff, 1);
        light.castShadow = true;
        light.position.set(500, 1000, -500); 
        scene.add(light);
        // scene.add( new THREE.DirectionalLightHelper(light, 0.2) );

		renderer.domElement.addEventListener('mousemove', selection_manager.onDocumentMouseMove, false);
		renderer.domElement.addEventListener('mousedown', selection_manager.onDocumentMouseDown, false);
		renderer.domElement.addEventListener('mouseup', selection_manager.onDocumentMouseUp, false);

      renderer.domElement.addEventListener('mousemove', onDocumentMouseMove_MCS, false);
      renderer.domElement.addEventListener('mousedown', onDocumentMouseDown_MCS, false);
      renderer.domElement.addEventListener('mouseup', onDocumentMouseUp_MCS, false);
      renderer.domElement.addEventListener('mousewheel', onDocumentMouseWheel_MCS, false);
      renderer.domElement.addEventListener('dblclick', onDblClick_MCS, false);
      document.addEventListener('keydown', onDocumentKeyDown_MCS, false);
      document.addEventListener('keyup', onDocumentKeyUp_MCS, false);
      document.addEventListener('mouseout', onDocumentMouseout_MCS, false);
 
		window.addEventListener('resize', this.onWindowResize, false);
		
		
	}

	this.add_context = function (bbox, x_step, z_step, final_callback) {

		origin = [bbox[0], bbox[1]];
		// OSM3.makeBuildings( scene, bbox, { scale: 1, onComplete: callback } );
		// terraingen.generate( bbox, x_step, z_step, callback ,  scene);

		var tP = new Promise(function (resolve, reject) {
				// TerrainGen stuff
				var tg = new TerrainGen();
				tg.generate(bbox, x_step, z_step, scene, function (plane) {
					var vert;
					// 	Create reference geohash data structure for the plane before resolving.
					//	This way the function called to add the bldg meshes to the three.js scene
					//	will be able to reference this data structure.
					for (var i = 0, len = plane.geometry.vertices.length; i < len; i++) {
						vert = plane.geometry.vertices[i];
					}
					resolve(plane);
				});
			});

		// fetch building data
		var bP = new Promise(function (resolve, reject) {
				OSM3.fetchBldgData(function (bldgData) {
					resolve(bldgData);
				}, bbox, {
					scale : 1
				});
			});

		// do stuff when both have arrived
		Promise.all([tP, bP]).then(function (resp) {
			var plane = resp[0],
			bldgs = resp[1];
			OSM3.buildBldgs(function (mesh) {
				var rayEl = self.getElevationRay( mesh.geometry.vertices, plane )
				mesh.position.y = ( rayEl < 10000 ) ? rayEl : mesh.position.y;
				scene.add(mesh);
				panObjects.push(mesh);
                final_callback.call();
			}, bldgs, {
				scale : 1.0,
				origin : origin
			});
		});
	}
    
    this.getMinEl = function( intersections, vertices ) {
            var face, 
                min = 1000000;
            for ( var i = 0, len = intersections.length; i < len; i++ ) {
                face = intersections[i].face;
                ( vertices[ face.a ].y < min ) ? min = vertices[ face.a ].y :
                ( vertices[ face.b ].y < min ) ? min = vertices[ face.b ].y :
                ( vertices[ face.c ].y < min ) ? min = vertices[ face.c ].y :
                min = min;
            }
            return min;
    }


    this.getElevationRay = function ( vertices, terrainMesh ) {
        var el, ray, ints,
            up = new THREE.Vector3( 0, 1, 0 ),
            minEl = 100000000;
        for ( var i = 0, len = vertices.length; i < len; i++ ) {
            ray = new THREE.Raycaster( vertices[i], up );
            ints = ray.intersectObject( terrainMesh );
            el = self.getMinEl( ints, terrainMesh.geometry.vertices );
            if ( el < minEl ) {
                minEl = el;
            }
        }
        return minEl;
    }
    
	// Called externally, turns a query_response into threeJS geometry
	this.add_tracing = function (query, duration,callbackCount,callback) {
		var trace_objects = [];

console.log(callbackCount);

	$.getScript("library/tracing_templates/" + query.tracing_template_name + ".js", function (script) {

			// 'tracing_template' is the name of the main function in each tracing template that gets loaded
			// 'as_tracing_template' is a mixin of functionality shared by multiple templates
			as_tracing_template.call(tracing_template.prototype);
			cur_tracing_template = new tracing_template();

			//  Set 'class variables'
			cur_tracing_template.set_origin(origin[0], origin[1]); //  Set the origin
			cur_tracing_template.object_lookup_table = self.object_lookup_table; //  Set lookup table

			query.queryresult.data.forEach(function (result_chunk) {
				result_chunk.forEach(function (trace_chunk) {

					// Generate the object from the template
					var trace_object = cur_tracing_template.get_trace(trace_chunk, duration);
                    
                    // FIXME: How to track ids of objects in trace_chunks as arrays
                    // This is a  messy way to handle this exception...
                    // split up id property into 'type' and 'id'
                    if ( trace_chunk.self != undefined ){
                        var id_url = trace_chunk.self.split("/");
                        var type = id_url[id_url.length - 2]; // node or relationship
                        var neoid = id_url[id_url.length - 1]; // id
                        
                        //  Add the neoid and type to the object and add the object to the lookup table for future reference by other tracings,
                        trace_object.neoid = neoid;
                        trace_object.type = type;
                        self.object_lookup_table[type][neoid] = trace_object;
                    }
                    
                    trace_object.material.visible=true;
                    scene.add(trace_object);
					panObjects.push(trace_object);

					// Keep track of this tracing's objects, for removal later
					trace_objects.push(trace_object);

				});
			});
		});

		self.add_tracing_objects(trace_objects, query.tracing_name, duration);

callbackCount=callbackCount+1;

	};

	// Called by add_tracing. Adds threeJS geometry at the appointed time and removes it
	this.add_tracing_objects = function (trace_objects, tracing_name, duration) {

		window.setTimeout(function () {

			self.objects[tracing_name] = trace_objects;

			trace_objects.forEach(function (obj) {
			//	scene.add(obj);
			//	panObjects.push(obj);
			console.log(obj);
			obj.material.visible=true;
			
			});

			window.setTimeout(function () {
				self.objects[tracing_name].forEach(function (obj) {
		//			scene.remove(obj);
					obj.material.visible=false;
				});
			}, duration);

		}, 100);


	}




this.add_tracings=function(obj,scope,callback){
	
	console.log(obj)

//var callbackCount=0;
//for (var i=0;i<obj.keyframes.length;i++){
//for (var j=0;j<obj.keyframes[i].queries.length;j++){
//               self.add_tracing(obj.keyframes[i].queries[j], obj.keyframes[i].duration,callbackCount,callback);
//}
//}

function add_tracing_recursive(z){
	
	var query=obj.keyframes[z].queries[0];
	var duration=obj.keyframes[z].duration;
	

	
		var trace_objects = [];

	$.getScript("library/tracing_templates/" + query.tracing_template_name + ".js", function (script) {

			// 'tracing_template' is the name of the main function in each tracing template that gets loaded
			// 'as_tracing_template' is a mixin of functionality shared by multiple templates
			as_tracing_template.call(tracing_template.prototype);
			cur_tracing_template = new tracing_template();

			//  Set 'class variables'
try{
			cur_tracing_template.set_origin(origin[0], origin[1]); //  Set the origin
			cur_tracing_template.object_lookup_table = self.object_lookup_table; //  Set lookup table
}catch(err){}


	cur_tracing_template.get_trace(obj.keyframes[z].queries[0].queryresult.data,scope,scene);


 //   scene.add(trace_objects);
//	panObjects.push(trace_objects);
	
	

/*
			query.queryresult.data.forEach(function (result_chunk) {
				result_chunk.forEach(function (trace_chunk) {

					// Generate the object from the template
					var trace_object = cur_tracing_template.get_trace(trace_chunk, duration);
                    
                    // FIXME: How to track ids of objects in trace_chunks as arrays
                    // This is a  messy way to handle this exception...
                    // split up id property into 'type' and 'id'
                    if ( trace_chunk.self != undefined ){
                        var id_url = trace_chunk.self.split("/");
                        var type = id_url[id_url.length - 2]; // node or relationship
                        var neoid = id_url[id_url.length - 1]; // id
                        
                        //  Add the neoid and type to the object and add the object to the lookup table for future reference by other tracings,
                        trace_object.neoid = neoid;
                        trace_object.type = type;
                        self.object_lookup_table[type][neoid] = trace_object;
                    }
                    
   
                    
                 
                 trace_object.material.visible=false;
                    scene.add(trace_object);
					panObjects.push(trace_object);

					// Keep track of this tracing's objects, for removal later
					trace_objects.push(trace_object);



				});
			});*/
		});


//		self.add_tracing_objects(trace_objects, query.tracing_name, duration);


self.objects[query.tracing_name] = trace_objects;

if (z<obj.keyframes.length-1){
	
	add_tracing_recursive(z+1);
	
}else{
	console.log('finished');
		
		console.log(self.objects)
		
	callback();
}

	
}


add_tracing_recursive(0);


	
}



this.update_state = function(current_state){


	
for(var name in current_state){

			var trace_objects=self.objects[name];

	trace_objects.forEach(function (obj) {

	if (current_state[name]==1){
		// material true
	
		
			obj.material.visible=true;
			
		
	}else{
		// material false
		
			obj.material.visible=false;
	}

			
});
            
        }
	
	
	
	
	
}





// ** these are matthew's dirty functions ** //
// probably should go into another place

function updateCameraRotation() {

    camera.position.x = distance * Math.sin(rotation.x) * Math.cos(rotation.y);
    camera.position.y = distance * Math.sin(rotation.y);
    camera.position.y = camera.position.y < 10? 10 : camera.position.y;
    camera.position.z = distance * Math.cos(rotation.x) * Math.cos(rotation.y);

}

function updateCameraPan() {
    
    var ii;

    pan.x += (panTarget.x - pan.x) * 0.08;
    pan.z += (panTarget.z - pan.z) * 0.08;

/*
    for (ii = 0; ii < planeObjects.length; ii++) {
        planeObjects[ii].position.x += pan.x + panTarget.x;
        planeObjects[ii].position.z += pan.z + panTarget.z;
    }
    */
    
    for (ii = 0; ii < panObjects.length; ii++) {
        panObjects[ii].position.x += pan.x + panTarget.x;
        panObjects[ii].position.z += pan.z + panTarget.z;
    }
    
    if (panHOLDmove !== true) {
        panTarget.x = 0;
        panTarget.z = 0;
    }

}




	// **** Helper Functions***

	// Animate the scene
	this.animate = function () {
		
	//	controls.update();
	
		requestAnimationFrame(self.animate);

		TWEEN.update();

		camera.lookAt(camera.target);
		zoom(zoomSpeed);

		rotation.x += (target.x - rotation.x) * 0.1;
		rotation.y += (target.y - rotation.y) * 0.1;

		distance += (distanceTarget - distance) * 0.8;

		updateCameraPan();

		updateCameraRotation();
		
		renderer.render(scene, camera);
		
	}

    	// Clear the scene geometry
	this.clear_traces = function () {
		for (var tracing_name in self.objects) {
			self.objects[tracing_name].forEach(function (obj) {
				scene.remove(obj);
			});
		}
	}
    
	// Clear the scene geometry
	this.clear_scene = function () {
        
        self.clear_traces();
		var children = scene.children;
		for (var i = children.length - 1; i >= 0; i--) {
			var child = children[i];
            var dont_clear = self.dont_clear(child);
			if (child.name === "xz-plane" || dont_clear ){}
			else {
				scene.remove(child);
			}
		};
		// FIXME: Does this need to be cleared?
		// object_lookup_table = {};
	}
    
    this.dont_clear = function(child){
        var status = false;
        
        var whitelist = [
        THREE.AmbientLight,
        THREE.PointLight,
        THREE.DirectionalLight,
        THREE.DirectionalLightHelper
        ]
        
        whitelist.forEach(function(type){
            if (child instanceof type){
                status =  true;
            }
        });
        
        return status
    }
    
	// **** ThreeJS Helper Functions***
	this.onWindowResize = function () {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	this.init();
	this.animate();
}

THREE.Env.prototype = Object.create(THREE.EventDispatcher.prototype);
