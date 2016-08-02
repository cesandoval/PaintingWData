// MAIN
// standard global variables
var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

// custom global variables
var grid, uniforms; 
var sizeScale, minSize;
var raycaster, intersects;
var mouse, INTERSECTED;
// GUI variables
var gui, customContainer, parameters
// geoJSON layer names
var layerNames;

var rows = 200;

init();
animate();



// FUNCTIONS 
function init() 
{
    // Create the scene and set the scene size.
    scene = new THREE.Scene();
    
    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight;
    
    // Create a renderer and add it to the DOM.
    renderer = new THREE.WebGLRenderer();//{antialias:true});
    renderer.setSize(WIDTH, HEIGHT);
    
    container = document.getElementById( 'ThreeJS' );
    container.appendChild( renderer.domElement );
        
    // Create a camera, zoom it out from the model a bit, and add it to the scene.
    camera = new THREE.PerspectiveCamera(90, (WIDTH / HEIGHT), 0.1, 3000);
    //camera = new THREE.OrthographicCamera(WIDTH/-2,WIDTH/2, HEIGHT/2, HEIGHT/-2, 0.1, 3000);
    camera.position.set(0,0,500);
    //camera.lookAt(new THREE.Vector3( 1, 0, 0 ));//scene.position);
    scene.add(camera);
    
    // Create an event listener that resizes the renderer with the browser window.
    window.addEventListener('resize', function() {
      var WIDTH = window.innerWidth,
          HEIGHT = window.innerHeight;
      renderer.setSize(WIDTH, HEIGHT);
      camera.aspect = WIDTH / HEIGHT;
      camera.updateProjectionMatrix();
    });
    
    // Set the background color of the scene.
    renderer.setClearColor(new THREE.Color(1,1,1), 1);//(new THREE.Color(.65,.65,.65), 1);
    
    // LIGHT
    var light = new THREE.PointLight(0xffffff);
    light.position.set(-100,200,100);
    scene.add(light);
    
    // EVENTS
    THREEx.WindowResize(renderer, camera);
    THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
    
    // STATS
    //stats = new Stats();
    //stats.domElement.style.position = 'absolute';
    //stats.domElement.style.bottom = '0px';
    //stats.domElement.style.zIndex = 100;
    //container.appendChild( stats.domElement );
    
    //scene.add(plane);
    
    grid = new THREE.GridHelper( 2500, 10.0 );
    grid.setColors( 0xffffff, 0x555555 );
    grid.material.transparent = true;
    grid.material.opacity = 0.3;
    grid.rotateOnAxis( new THREE.Vector3( 1, 0, 0 ), 90 * ( Math.PI/180 ) );
    grid.visible = false;
    scene.add( grid );
    
    ////////////
    // CUSTOM //
    ////////////
    var file = 'javascripts/data/points.json';
    minSize = 0.0;
    var maxSize = 15.0,
        sizeRange = [minSize, maxSize],
        colorRange = [0.0, 1.0];
    
    sizeScale = d3.scale.linear();
    sizeScale.domain([0.0, 1.0]);
    sizeScale.range(sizeRange);
    
    //voxel(file, sizeRange, colorRange);
    voxelBuffer(file, sizeRange, colorRange);
    
    //var axes = new THREE.AxisHelper();
    //scene.add(axes);
    
    // Add OrbitControls so that we can pan around with the mouse.
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    // to disable rotation
    controls.noRotate = true;
    //controls.center = new THREE.Vector3( 100000, 0, 0 );
    //controls.target.set(new THREE.Vector3(100000,0, 0));
    //controls.lookAt(new THREE.Vector3(100000,0, 0));
    
    
    //camera.position.set( 1000,1000 , 600 );
    //controls.target.set(1000,1000, 1000);
}

function voxelBuffer(file, sizeRange, colorRange) {
    $.getJSON(file, function(json) {
        // Parse the geoJSON
        var verts = json.features;
        
        if (verts.length > 0) {
            // Get all the layer names in the JSON
            layerNames = Object.keys(verts[0].properties)//.slice(0,1);
            // Load the UI functions from uiVoxel
            populateLayers(layerNames);
            
            var allParticles = [],
                pixelLayers = [],
                valueLists = [];
            for (var num = 0; num < layerNames.length; num++) {
                var jsonVals = []
                var jsonKey = layerNames[num];
                for ( var i = 0; i < verts.length; i++) {
                    jsonVals.push(verts[i].properties[jsonKey]);
                }
                
                var coords = []
                for ( var i = 0; i < verts.length; i++) {
                    testCoords = verts[i].geometry.coordinates
                    verts[i].geometry.coordinates = [testCoords[0], testCoords[1], num*10]
                    
                    coords.push(verts[i].geometry); 
                }
                
                var scale = d3.scale.linear();
                scale.domain([1.0,0.0]);
                scale.range(sizeRange);
                
                
                var colorScale = getColorToggles(layerNames[0]);                
                
                geometry = new THREE.BufferGeometry();
                
                // Construct Pixel Object    
                var pixelLayer = new PixelGrid();
                // Methods to construct pixel props
                pixelLayer.allNeighbors();
                pixelLayer.setCoordinates(coords);
                var allRandomIndices = pixelLayer.nNeighbors(6)
                pixelLayer.setProperties(scale, colorScale, jsonVals, allRandomIndices);
                pixelLayer.setOpacity(.60);
                
                // Add attributes to three js geom
                geometry.addAttribute( 'position', new THREE.BufferAttribute( pixelLayer.getCoordinates(), 3 ) );
                geometry.addAttribute( 'customColor', new THREE.BufferAttribute( pixelLayer.getColors(), 3 ) );
                geometry.addAttribute( 'size', new THREE.BufferAttribute( pixelLayer.getScales(), 1 ) );
                geometry.addAttribute( 'customOpacity', new THREE.BufferAttribute( pixelLayer.getOpacities(), 1 ) );
                
                
                var material = new THREE.ShaderMaterial( {
                    uniforms: {
                        "c":   { type: "f", value: 0.0 },
                        "p":   { type: "f", value: 10.0 },
                        color:   { type: "c", value: new THREE.Color() },
                        texture: { type: "t", value: THREE.ImageUtils.loadTexture( "images/sprites/disc.png" ) },
                        viewVector: { type: "v3", value: camera.position }
                    },
                    vertexShader: document.getElementById( 'vertexshader' ).textContent,
                    fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
                    
                    side: THREE.FrontSide,
                    //blending: THREE.AdditiveBlending,
                    transparent: true,
                    alphaTest: 0.39,
                    customOpacity: .6,
            
                } );
                
                var particles = new THREE.Points( geometry, material );
                particles.add(camera);
                //camera.add(particles);
                
                scene.add( particles );
                //particles.visible = false;
                
                allParticles.push(particles);
                pixelLayers.push(pixelLayer);
                valueLists.push(jsonVals);
            }
            // This loads the parallel coordinates widget
            var pc = loadCoordinates(verts, layerNames);
            queryBrush(pc, layerNames, allParticles, pixelLayers, scale, colorScale, valueLists);
            
            // Load the UI functions from uiVoxel
            // HAD TO MOVE THIS ONE UP TO GET THE VARIABLES IN THE NAMESPACE
            // populateLayers(layerNames);
            checkToggle(allParticles, layerNames);

            populateGraphBasic();
            changeOpacity(pixelLayers, allParticles);
            changeNeighbors(allParticles, pixelLayers, scale, valueLists, layerNames);
            
            // populateRelGraph(layerNames);
            // changeProperties(layerNames, allParticles, pixelLayers, scale, colorScale, valueLists);
            // changeOpacityIndividual(layerNames, pixelLayers, allParticles);
            
            colorLayer(layerNames, allParticles, scale, colorScale, pixelLayers, valueLists);
            
            // Reset the Layer to the original props
            resetLayer(layerNames, allParticles, scale, colorScale, pixelLayers, valueLists);
            
            // Toggle Background grid on and off
            toggleGrid(grid);
            
            // Toggle the 3d View on and off
            toggleThreeD(controls)
            
            // Toggle the Parcoords on and off
            toggleCoordinates()
            
            // Toggle the Graph Tools on and off
            toggleGraphMaker()
            
            var layers = ['Asthma', 'Cancer', 'Population', 'Income'];
            // console.log(valueLists);

            graphMaker(window.d3, window.saveAs, window.Blob, layerNames, valueLists, pixelLayers, allParticles, scale, colorScale);
        }
    });
}


function animate() 
{
    requestAnimationFrame( animate );
    render();
    update();
}

function update()
{
    if ( keyboard.pressed("z") ) 
    { 
        // do something
    }
    
    controls.update();
    //stats.update();
}

function render() 
{
    //requestAnimationFrame(render);
    renderer.render( scene, camera );
}
//
//
//var map;
//L.mapbox.accessToken = 'pk.eyJ1IjoiYWxtYWhhIiwiYSI6ImM4M2YxY2U3ZDVhNTg3YjdkZWI0MDRkNmU5YzU5NWI4In0.5g65rHetoEtp1RqK8t2gsA';
//window.map = L.mapbox.map('map', 'mapbox.dark', {zoomControl:false}).setView([24.7261032, 46.72965312], 10);
//
//new L.Control.Zoom({ position: 'topright' }).addTo(map);
//map._initPathRoot();
//
//
//
//var graphicScale = L.control.graphicScale({
//    doubleLine: false,
//    minUnitWidth:80,
//    showSubunits: false,
//}).addTo(map);
//
//var scaleText = L.DomUtil.create('div', 'scaleText' );
//graphicScale._container.insertBefore(scaleText, graphicScale._container.firstChild);
//scaleText.innerHTML = '';
//
//var styleChoices = scaleText.querySelectorAll('.choice');
//
//for (var i = 0; i < styleChoices.length; i++) {
//    styleChoices[i].addEventListener('click', function(e) {
//        graphicScale._setStyle( { fill: e.currentTarget.innerHTML } );
//    });
//}
