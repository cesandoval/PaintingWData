// import '../../public/javascripts/libs/utilities.js'
export default class Pixels {
    // GeometryObject will be a Three.js geometry
    // dataArray will be an array which holds the x, y, and value for each object
    // Example: Float32Array([x1, y1, v1, x2, y2, v2, ...])
    constructor(graph, geometryObject, dataArray, startColor, endColor, minMax, addresses, pxWidth=200, pxHeight=200, n=0, bounds=[]){
        this.lowBnd = bounds[0];
        this.highBnd = bounds[1];

        // Constants
        this.ELEMENTS_PER_ITEM = 3
        this.pxWidth = pxWidth;
        this.pxHeight = pxHeight;
        this.minVal = minMax[0];
        this.maxVal = minMax[1];

        // Pixels (Geometry)
        this.geometry = this.initGeometry();
        this.setGeometry(this.geometry, geometryObject)
        this.startColor = new THREE.Color(startColor);
        this.endColor = new THREE.Color(endColor);
        this.layerN = n;
        this.addresses = addresses;

        // Sanity Check
        if (dataArray.length % this.ELEMENTS_PER_ITEM != 0)
            console.error("Wrong sized data array passed to Pixels constructor!");

        this.numElements = dataArray.length / this.ELEMENTS_PER_ITEM;

        this.initTransValsAttrs(this.geometry, dataArray, this.addresses, this.lowBnd, this.highBnd);
        this.material = this.initMaterial(this.lowBnd, this.highBnd);

        this.addToScene(graph.scene);
    }

    // Zoom Extent based on geo's bbox
    static zoomExtent(canvas, bbox) {
        let radius = 0;
        let newBbox = bbox[0]

        let projectedMin = project([newBbox[0][0],newBbox[0][1]]);
        let projectedMax = project([newBbox[2][0],newBbox[2][1]]);
        let testMin = new THREE.Vector3();
        let testMax = new THREE.Vector3();
        testMin.x = projectedMin.x;
        testMin.y = projectedMin.z;
        testMin.z = projectedMin.y;
        testMax.x = projectedMax.x;
        testMax.y = projectedMax.z;
        testMax.z = projectedMax.y;
        let testCenter = new THREE.Vector3();
        testCenter.x = (testMax.x + testMin.x) * 0.5;
        testCenter.z = (testMax.y + testMin.y) * 0.5;
        testCenter.y = (testMax.z + testMin.z) * 0.5;
        canvas.controls.target = testCenter;

        // Compute world AABB "radius" (approx: better if BB height)
        let diag = new THREE.Vector3();
        diag = diag.subVectors(testMax, testMin);
        radius = diag.length() * 0.5;

        // Compute offset needed to move the camera back that much needed to center AABB (approx: better if from BB front face)
        let offset = radius / Math.tan(Math.PI / 180.0 * canvas.camera.fov * 0.5);
        let thiscam = canvas.camera;
        
        // THIS ONE IS PROJECTED......
        let newPos = new THREE.Vector3(testCenter.x, offset, testCenter.z)

        //set camera position and target
        thiscam.position.set(newPos.x, newPos.y, newPos.z);
    }

    static buildMapbox(graph, canvas, bbox) {
        var meshes = 0;
        var parserRequests = 0;
        var updaterRequests = 0;
        var finished = 0;
        //compass functionality
        var pivot = document.querySelector('#grid')
        var compass = document.querySelector('#compass img')
        var screenPosition;

        this.zoomExtent(canvas, bbox)
        
        function updateCompass(reset){
            var styling;
            if (reset) {
                canvas.controls.straighten();
                canvas.controls.autoRotate=false;
                styling = '';
            }
            else {
                var angle = canvas.controls.getAzimuthalAngle()*180/Math.PI;
                var pitch = canvas.controls.getPolarAngle()*180/Math.PI;
                styling = 'rotateX('+pitch+'deg) rotateZ('+angle+'deg)'
            }
            // compass.style['-webkit-transform'] = styling
            // pivot.style['-webkit-transform'] = styling
            // pivot.style['display'] = 'block'
        }

        var raycaster = new THREE.Raycaster();

        function getZoom(){
            var pt = canvas.controls.target.distanceTo(canvas.controls.object.position);
            return Math.min(
                Math.max(
                    getBaseLog(0.5, pt/12000)+4,
                    0
                )
            ,22);
        }

        var tilesToGet = 0;
        var inspectElevation = false;

        function assembleUrl(img, coords){
            // console.log(img, coords)
            // var tileset = img ? 'mapbox.streets-satellite' : 'mapbox.terrain-rgb';//
            var tileset = img ? 'mapbox.light' : 'mapbox.terrain-rgb';//
            var res = img ? '@2x.png' :'@2x.pngraw';

            //domain sharding
            var serverIndex = 2*(coords[1]%2)+coords[2]%2
            var server = ['a','b','c','d'][serverIndex]
            //return 'sample.png'
            return 'https://'+server+'.tiles.mapbox.com/v4/'+tileset+'/'+slashify(coords)+res+'?access_token=pk.eyJ1IjoibWF0dCIsImEiOiJTUHZkajU0In0.oB-OGTMFtpkga8vC48HjIg'
        }

        var basePlane = new THREE.PlaneBufferGeometry(basePlaneDimension*100, basePlaneDimension*100, 1, 1);
        var mat = new THREE.MeshBasicMaterial( {
            wireframe: true,
            opacity:0
            //transparent: true
        } );

        var plane = new THREE.Mesh( basePlane, mat );
        plane.rotation.x = -0.5*Math.PI;
        plane.opacity=0
        graph.scene.add( plane );

        // calculates which tiles are in view to download
        var updater = new Worker('/javascripts/workers/updatetile.js');
        updater.addEventListener('message', function(e) {
            // console.log(e)
            var cb = e.data;
            var queue = cb.getTiles[0].length;
            if (queue>0) {
                getTiles(cb.getTiles);
                updateTileVisibility();
            }
        }, false)

        //converts RGB values to elevation
        var parserPool = [];

        for (var p=0; p<4; p++){
            var parser = new Worker('/javascripts/workers/parseelevationworker.js');

            // whenever parser returns a mesh, make mesh
            parser.addEventListener('message', function(e) {
                var time = Date.now();
                var cb = e.data;
                parserRequests++
                // console.log(e)
                if(cb.makeMesh) makeMesh(cb.makeMesh)
                else console.log(cb)
            }, false)
            parserPool.push(parser)
        }


        //initial tile load
        window.setTimeout(function(){
            updateCompass()
        }, 500);

        function updateTiles(){
            zoom = Math.floor(getZoom());

            var ul = {x:-1,y:-1,z:-1};
            var ur = {x:1,y:-1,z:-1};
            var lr = {x:1,y:1,z:1};
            var ll = {x:-1,y:1,z:1};

            var corners = [ul, ur, lr, ll, ul].map(function(corner){
                raycaster.setFromCamera(corner, canvas.camera);
                return raycaster.intersectObject(plane)[0].point;
            })

            if (corners[0] === screenPosition) return;
            else screenPosition = corners[0];

            updater.postMessage([zoom,corners])
        }

        window.updateTiles = updateTiles;
        // given a list of elevation and imagery tiles, download
        function getTiles([tiles,elevation]){

            document.querySelector('#progress').style.opacity = 1;

            tiles =
            tiles.map(function(tile){return slashify(tile)})


            tilesToGet+= tiles.length;
            updaterRequests+=tiles.length

            elevation.forEach(function(coords){

                //download the elevation image
                getPixels(assembleUrl(null, coords),

                    function(err, pixels) {
                        // usually a water tile-- fill with 0 elevation
                        if (err) pixels = null
                        var parserIndex = 2*(coords[1]%2)+coords[2]%2
                        parserPool[parserIndex]
                            .postMessage([pixels, coords, tiles,parserIndex])
                    }
                )
            })

        }


        function makeMesh([data, [z,x,y]]){
            meshes++

            var tileSize = basePlaneDimension/(Math.pow(2,z));
            var vertices = 128;
            var segments = vertices-1;

            // get image to drape
            var texture = new THREE.TextureLoader()
            .load(
                //url
                assembleUrl(true, [z,x,y]),

                //callback function
                function(err, resp){
                    tilesToGet--
                        finished++

                    // scene.remove(placeholder)
                    plane.visible=true

                    if (tilesToGet===0) {
                        document.querySelector('#progress').style.opacity = 0;
                        console.log('STABLE')
                        updateTileVisibility()
                    }

                }
            );

            // set material
            var material = new THREE.MeshBasicMaterial({map: texture});

            data = resolveSeams(canvas, data, neighborTiles,[z,x,y])
            var geometry = new THREE.PlaneBufferGeometry(tileSize, tileSize, segments, segments);

            geometry.attributes.position.array = new Float32Array(data);

            // var placeholder = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({wireframe:true,color:0x999999}));
            // scene.add(placeholder);

            var plane = new THREE.Mesh(geometry, material);
            plane.coords = slashify([z,x,y])
            plane.zoom = z;
            graph.scene.add(plane)
            plane.visible=false
        };



        var zoom = getZoom();

        function setCenter(lnglat){
            var pxCoords = project(lnglat)
            canvas.camera.position.x = pxCoords.x;
            canvas.camera.position.z = pxCoords.z;
            canvas.controls.moveTo(pxCoords, canvas.camera.position.y);

            markerx.setLatLng(lnglat.reverse());

            window.setTimeout(function(){updateTiles()},100);
            updateCompass(true);
        }

        window.addEventListener( 'resize', onWindowResize, false );

        function onWindowResize() {
            canvas.camera.aspect = window.innerWidth / window.innerHeight;
            canvas.camera.updateProjectionMatrix();
            graph.renderer.setSize( window.innerWidth, window.innerHeight );
            updateTiles()
        }

        function updateTileVisibility(){
            var zoom = Math.floor(getZoom())
            //update tile visibility based on zoom
            for (var s=0; s<graph.scene.children.length; s++){
                var child = graph.scene.children[s];
                if (child.zoom === zoom || child.zoom === undefined) child.visible = true
                else child.visible = false;
            }
        }

    }

    // Create a InstancedBufferGeometry Object
    // See Three.js Docs for more info
    initGeometry() {
        const buffer_geometry = new THREE.InstancedBufferGeometry();
        buffer_geometry.dynamic = true;
        return buffer_geometry;
    }

    setGeometry(geometry, geometryObject) {
        geometry.copy(geometryObject);
    }

    initAttribute(size, itemSize, normalized) {
        return new THREE.InstancedBufferAttribute(new Float32Array(size), itemSize, normalized);
    }

    static parseDataJSON(datajson) {
        // console.log(datajson)
        // Matrix of data
        const hashedData = datajson.geojson.hashedData;
        const allIndices = datajson.allIndices;

        const otherArray = new Float32Array(Object.keys(hashedData).length * 3)
        const addressArray = new Float32Array(Object.keys(hashedData).length * 3)

        // const array = new Float32Array(data.length * data[0].length * 3);
        const startColor = datajson.color1;
        const endColor = datajson.color2;

        for (let i = 0, j=0; i < Object.keys(hashedData).length; i++, j=j+3){
            if (typeof hashedData[allIndices[i]] !== "undefined"){
                var currProjPt = project([hashedData[allIndices[i]][0], hashedData[allIndices[i]][1]]);
                // x, y coordinates
                otherArray[j] = currProjPt.x;
                otherArray[j + 1] = currProjPt.z;
                // // x, y coordinates
                // otherArray[j] = hashedData[allIndices[i]][0];
                // otherArray[j + 1] = hashedData[allIndices[i]][1];
                // value/weight
                otherArray[j + 2] = hashedData[allIndices[i]][3];

                // voxel address
                addressArray[j] = hashedData[allIndices[i]][5];
                addressArray[j+1] = hashedData[allIndices[i]][6];
                addressArray[j+2] = hashedData[allIndices[i]][7];
            }
        }

        // Julian's Implementation, does not parse the JSON correctly
        //  But is memory efficient... FIX ME!!!!
        // for (let i = 0; i < data.length; i++){
        //     for (let j = 0; j < data[i].length; j++){
        //         // x, y coordinates
        //         array[(i * data.length + j) * 3 + 0] = shift(data[i][j][0]);
        //         array[(i * data.length + j) * 3 + 1] = shift(data[i][j][1]);
        //         // value/weight
        //         array[(i * data.length + j) * 3 + 2] = data[i][j][3];
        //     }
        // }
        const bounds = [this.lowBnd, this.highBnd];

        return { otherArray, startColor, endColor, addressArray, bounds};

    }

    initTransValsAttrs(geometry, dataArray, addresses, lowBnd, highBnd) {
        const allElements = this.pxWidth * this.pxHeight;
        const numElements = dataArray.length / this.ELEMENTS_PER_ITEM;

        const translations = this.initAttribute(allElements * 3, 3, true);
        const values = this.initAttribute(allElements, 1, true);
        const originalValues = this.initAttribute(allElements, 1, true);

        const remap = x => (highBnd-lowBnd)*((x-this.minVal)/(this.maxVal-this.minVal))+lowBnd;
        const mapColor = x => (x-this.minVal)/(this.maxVal-this.minVal);

        for (let i = 0, j = 0; i < dataArray.length; i = i + 3, j++){
            let currIndex = addresses[i+2]
            translations.setXYZ(currIndex, dataArray[i], 0.3 + this.layerN * 0.001, dataArray[i+1]);
            // translations.setXYZ(currIndex, dataArray[i], this.layerN * 0.00001, -dataArray[i+1]); 
            values.setX(currIndex, remap(dataArray[i+2]));
            originalValues.setX(currIndex, remap(dataArray[i+2]));
        }
        this.setAttributes(geometry, translations, values, originalValues);
    }

    // Creates the attributes for the geometry
    // Will modify geometry object
    // Returns the geometry
    setAttributes(geometry, translations, values, originalValues) {
        geometry.addAttribute('translation', translations);
        geometry.addAttribute('size', values);
        geometry.addAttribute('originalsize', originalValues);
    }

    initMaterial(lowBnd, highBnd){
        let material = new THREE.RawShaderMaterial({
            uniforms: {
                show: {
                    type: 'f',
                    value: 1.0
                },
                min: {
                    type: 'f',
                    value: lowBnd
                },
                max: {
                    type: 'f',
                    value: highBnd
                },
                transparency: {
                    type: 'f',
                    value: 0.5
                },
                startColor: {
                    value: this.startColor
                },
                endColor: {
                    value: this.endColor
                },
                rotate: {
                    value: new THREE.Matrix3().set(
                        1.0,0.0,0.0,
                        0.0,0.0,0.0,
                        0.0,-1.0,0.0
                    )
                }
            },
            vertexShader: document.getElementById('vertexShader').textContent,
            fragmentShader: document.getElementById( 'fragmentShader' ).textContent
            
            
        })

        material.transparent = true;
        return material;
    }

    get mesh() {
        if (this._mesh == undefined){
            this._mesh = new THREE.Mesh(this.geometry, this.material);
            this._mesh.frustumCulled = false;
            return this._mesh;
        } else {
            return this._mesh;
        }
    }

    addToScene(scene){
        // var cubeGeometry = new THREE.SphereGeometry(1, 100);
        // var cubeMaterial = new THREE.MeshBasicMaterial({color: 0xFF6600, side: THREE.DoubleSide, transparent: true, opacity: 0.9, depthTest: false});
        // var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        // var a = -13362.013098226178;
        // var b = 0 
        // var c = -8062.564460489317
        // cube.position.set( a, b, c );
        // scene.add(cube)
        scene.add( this.mesh );
    }

}
