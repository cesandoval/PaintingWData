/*global project, project, getBaseLog, slashify, basePlaneDimension, basePlaneDimension, slashify, getPixels, basePlaneDimension, resolveSeams, neighborTiles, slashify, project, datavoxelId */
/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @link   URL
 * @file   This files defines the MyClass class.
 * @author AuthorName.
 * @since  x.x.x
 */
export default class Pixels {
    // GeometryObject will be a Three.js geometry
    // dataArray will be an array which holds the x, y, and value for each object
    // Example: Float32Array([x1, y1, v1, x2, y2, v2, ...])
    constructor(
        name,
        graph,
        geometryObject,
        dataArray = [],
        startColor,
        endColor,
        minMax,
        addresses,
        pxWidth = 200,
        pxHeight = 200,
        n = 0,
        bounds = [],
        shaderText = '',
        vLang = false,
        properties = {}
    ) {
        /**
         * The name of the layer.
         * @member {String} layerName
         */
        this.layerName = name
        /**
         * The low and high bounds.
         * @member {Number} lowBnd
         * @member {Number} highBnd
         */
        this.lowBnd = bounds[0]
        this.highBnd = bounds[1]
        /**
         * @member {Number} ELEMENTS_PER_ITEM
         * @member {Number} pxWidth
         * @member {Number} pxHeight
         * @member {Number} minVal
         * @member {Number} maxVal
         */
        this.ELEMENTS_PER_ITEM = 3
        this.pxWidth = pxWidth
        this.pxHeight = pxHeight
        this.minVal = minMax[0]
        this.maxVal = minMax[1]

        // Pixels (Geometry)
        this.geometry = this.initGeometry()
        this.setGeometry(this.geometry, geometryObject)
        this.startColor = new THREE.Color(startColor)
        this.endColor = new THREE.Color(endColor)
        this.layerN = n
        this.addresses = addresses

        // Define the Shader
        this.shaderText = shaderText

        if (!vLang) {
            // Sanity Check
            if (dataArray.length % this.ELEMENTS_PER_ITEM != 0)
                console.error(
                    'Wrong sized data array passed to Pixels constructor!'
                )
            this.numElements = dataArray.length / this.ELEMENTS_PER_ITEM
            this.initTransValsAttrs(
                this.geometry,
                dataArray,
                this.addresses,
                this.lowBnd,
                this.highBnd
            )
        } else if (vLang == true) {
            this.vlangBuildPixels(this.geometry, properties)
            this.numElements = this.addresses / this.ELEMENTS_PER_ITEM
        }

        this.material = this.initMaterial(this.lowBnd, this.highBnd)

        // Pixels.vlangBuildPixels();
        this.addToScene(graph.scene)
    }
    /**
     * Puts the camera back into its original position when we opened up the app.
     * @param {PaintGraph.Graph} canvas The map canvas.
     * @param {Array} bbox An array with one element: an array of five 2-tuples specifying the bbox.
     */
    static zoomExtent(canvas, bbox) {
        let radius = 0
        // An array of five 2-tuples (first equals last), specifying the latitude/longitude of the bbox rectangle.
        let newBbox = bbox[0]
        // Projects the diagonal corners into 3-space.
        let projectedMin = project([newBbox[0][0], newBbox[0][1]])
        let projectedMax = project([newBbox[2][0], newBbox[2][1]])
        let testMin = new THREE.Vector3()
        let testMax = new THREE.Vector3()
        // The diagonal corners are now stored in testMin and test Max.
        testMin.x = projectedMin.x
        testMin.y = projectedMin.z
        testMin.z = projectedMin.y
        testMax.x = projectedMax.x
        testMax.y = projectedMax.z
        testMax.z = projectedMax.y
        // Gets the center of the bbox, and sets the attached OrbitControls to that location.
        let testCenter = new THREE.Vector3()
        testCenter.x = (testMax.x + testMin.x) * 0.5
        testCenter.z = (testMax.y + testMin.y) * 0.5
        testCenter.y = (testMax.z + testMin.z) * 0.5
        canvas.controls.target = testCenter
        // Computes the "radius" of the bounding box, which is one half the distance between the corner vectors.
        let diag = new THREE.Vector3()
        diag = diag.subVectors(testMax, testMin)
        radius = diag.length() * 0.5
        // Compute offset needed to move the camera back that much needed to center AABB (approx: better if from BB front face)
        let offset =
            radius / Math.tan(Math.PI / 180.0 * canvas.camera.fov * 0.5)
        // We calculate newPos based on the above offset.
        let newPos = new THREE.Vector3(testCenter.x, offset, testCenter.z)
        // Sets the camera position and target to newPos.
        canvas.camera.position.set(newPos.x, newPos.y, newPos.z)
    }
    /**
     *
     * @param {PaintGraph.Graph} canvas
     * @param {Array} bbox
     * @param {Boolean} screenshot
     */
    static buildMapbox(canvas, bbox, screenshot) {
        // These are counter variables; used only for testing purposes.
        /* eslint-disable */
        var meshes = 0
        var parserRequests = 0
        var updaterRequests = 0
        var finished = 0
        var totalTilesToLoad = 0
        /* eslint-enable */

        //compass functionality
        var screenPosition
        // Moves the camera to the specified starting position.
        this.zoomExtent(canvas, bbox)
        // Defines a raycaster for later.
        var raycaster = new THREE.Raycaster()
        /**
         * Calculates the amount the camera is zoomed in.
         * @return {Number} The above.
         */
        function getZoom() {
            /*
             * This is achieved by finding the distance between the camera position and the target.
             * Note that they only differ in y-coordinate (i.e. moving "in" and "out" of the screen).
             */
            var pt = canvas.controls.target.distanceTo(
                canvas.controls.object.position
            )
            // Applies some transformation to that value to get the zoom.
            return Math.min(Math.max(getBaseLog(0.5, pt / 12000) + 4, 0), 22)
        }

        var tilesToGet = 0
        /**
         *
         * @param {Boolean} img
         * @param {Array} coords A 3D array of coordinates [z,x,y]
         */
        function assembleUrl(img, coords) {
            // Determines the mapboxStyle; defaults to 'mapbox.light'
            const mapboxStyle = window.mapBgStyle || 'mapbox.light'
            // Return a 1px white color png image if empty.
            if (mapboxStyle === 'empty') {
                return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII='
            }
            // Variables that depend on "img".
            var tileset = img ? mapboxStyle : 'mapbox.terrain-rgb' //
            var res = img ? '@2x.png' : '@2x.pngraw'
            // Calculates the server to download from given the coordinates.
            var serverIndex = 2 * (coords[1] % 2) + coords[2] % 2
            var server = ['a', 'b', 'c', 'd'][serverIndex]
            // Returns an assembled URL that we can now use.
            return (
                'https://' +
                server +
                '.tiles.mapbox.com/v4/' +
                tileset +
                '/' +
                slashify(coords) +
                res +
                '?access_token=pk.eyJ1IjoibWF0dCIsImEiOiJTUHZkajU0In0.oB-OGTMFtpkga8vC48HjIg'
            )
        }
        // Initializes basePlane and mat (the material) for "plane", the mesh.
        var basePlane = new THREE.PlaneBufferGeometry(
            basePlaneDimension * 100,
            basePlaneDimension * 100,
            1,
            1
        )
        var mat = new THREE.MeshBasicMaterial({
            wireframe: true,
            opacity: 0,
        })
        // Configures the mesh and we add it to the scene.
        var plane = new THREE.Mesh(basePlane, mat)
        plane.rotation.x = -0.5 * Math.PI
        plane.opacity = 0
        canvas.scene.add(plane)

        // calculates which tiles are in view to download
        var updater = new Worker('/javascripts/workers/updatetile.js')
        updater.addEventListener(
            'message',
            function(e) {
                // console.log(e)
                var cb = e.data
                var queue = cb.getTiles[0].length
                if (queue > 0) {
                    getTiles(cb.getTiles)
                    updateTileVisibility()
                }
            },
            false
        )

        //converts RGB values to elevation
        var parserPool = []

        for (var p = 0; p < 4; p++) {
            var parser = new Worker(
                '/javascripts/workers/parseelevationworker.js'
            )

            // whenever parser returns a mesh, make mesh
            parser.addEventListener(
                'message',
                function(e) {
                    var cb = e.data
                    parserRequests++
                    // console.log(e)
                    if (cb.makeMesh) makeMesh(cb.makeMesh)
                    else console.log(cb)
                },
                false
            )
            parserPool.push(parser)
        }

        //initial tile load
        window.setTimeout(function() {}, 500)

        function updateTiles() {
            zoom = Math.floor(getZoom())

            var ul = { x: -1, y: -1, z: -1 }
            var ur = { x: 1, y: -1, z: -1 }
            var lr = { x: 1, y: 1, z: 1 }
            var ll = { x: -1, y: 1, z: 1 }

            var corners = [ul, ur, lr, ll, ul].map(function(corner) {
                raycaster.setFromCamera(corner, canvas.camera)
                return raycaster.intersectObject(plane)[0].point
            })

            if (corners[0] === screenPosition) return
            else screenPosition = corners[0]

            updater.postMessage([zoom, corners])
        }

        window.updateTiles = updateTiles

        // refresh tiles already downloaded
        function refreshTiles() {
            updater.postMessage({ refresh: true })
        }

        window.refreshTiles = refreshTiles

        // given a list of elevation and imagery tiles, download
        function getTiles([tiles, elevation]) {
            // document.querySelector('#progress').style.opacity = 1

            tiles = tiles.map(function(tile) {
                return slashify(tile)
            })

            tilesToGet += tiles.length
            updaterRequests += tiles.length
            totalTilesToLoad = tilesToGet

            elevation.forEach(function(coords) {
                //download the elevation image
                getPixels(
                    assembleUrl(null, coords),

                    function(err, pixels) {
                        // usually a water tile-- fill with 0 elevation
                        if (err) pixels = null
                        var parserIndex = 2 * (coords[1] % 2) + coords[2] % 2
                        parserPool[parserIndex].postMessage([
                            pixels,
                            coords,
                            tiles,
                            parserIndex,
                        ])
                    }
                )
            })
        }

        function makeMesh([data, [z, x, y]]) {
            meshes++

            var tileSize = basePlaneDimension / Math.pow(2, z)
            var vertices = 128
            var segments = vertices - 1

            // get image to drape
            var texture = new THREE.TextureLoader().load(
                //url
                assembleUrl(true, [z, x, y]),

                //callback function
                function() {
                    tilesToGet--
                    finished++

                    // scene.remove(placeholder)
                    plane.visible = true

                    if (tilesToGet === 0) {
                        document.querySelector('#progress').style.opacity = 0
                        updateTileVisibility()
                    }
                    if (finished == totalTilesToLoad && screenshot) {
                        setTimeout(function() {
                            console.log(
                                'Taking Screenshot for voxel',
                                datavoxelId
                            )
                            window.screenshotToS3(datavoxelId)
                        }, 3000)
                    } else if (finished == totalTilesToLoad) {
                        console.log('Screenshot not needed!')
                    }
                }
            )

            // set material
            var material = new THREE.MeshBasicMaterial({ map: texture })

            data = resolveSeams(canvas, data, neighborTiles, [z, x, y])
            var geometry = new THREE.PlaneBufferGeometry(
                tileSize,
                tileSize,
                segments,
                segments
            )

            geometry.attributes.position.array = new Float32Array(data)

            var plane = new THREE.Mesh(geometry, material)
            plane.coords = slashify([z, x, y])
            plane.zoom = z
            canvas.scene.add(plane)
            plane.visible = false
        }

        var zoom = getZoom()

        window.addEventListener('resize', onWindowResize, false)

        function onWindowResize() {
            canvas.camera.aspect = window.innerWidth / window.innerHeight
            canvas.camera.updateProjectionMatrix()
            canvas.renderer.setSize(window.innerWidth, window.innerHeight)
            updateTiles()
        }

        this.onWindowResize = onWindowResize

        function updateTileVisibility() {
            var zoom = Math.floor(getZoom())
            //update tile visibility based on zoom
            for (var s = 0; s < canvas.scene.children.length; s++) {
                var child = canvas.scene.children[s]
                if (child.zoom === zoom || child.zoom === undefined)
                    child.visible = true
                else child.visible = false
            }
        }
    }
    /**
     * Creates an InstancedBufferGeometry object.
     * @return {THREE.InstancedBufferGeometry} a generic InstancedBufferGeometry object.
     */
    initGeometry() {
        const buffer_geometry = new THREE.InstancedBufferGeometry()
        buffer_geometry.dynamic = true
        return buffer_geometry
    }

    setGeometry(geometry, geometryObject) {
        geometry.copy(geometryObject)
    }

    initAttribute(size, itemSize, normalized) {
        return new THREE.InstancedBufferAttribute(
            new Float32Array(size),
            itemSize,
            normalized
        )
    }

    static parseDataJSON(datajson) {
        // console.log(datajson)
        // Matrix of data
        const hashedData = datajson.geojson.hashedData
        const allIndices = datajson.allIndices

        const otherArray = new Float32Array(allIndices.length * 3)
        const addressArray = new Float32Array(allIndices.length * 3)

        // const array = new Float32Array(data.length * data[0].length * 3);
        const startColor = datajson.color1
        const endColor = datajson.color2

        for (let i = 0, j = 0; i < allIndices.length; i++, j = j + 3) {
            if (typeof hashedData[allIndices[i]] == 'undefined') {
                // console.log(allIndices[i], j, i)
            }
            if (typeof hashedData[allIndices[i]] !== 'undefined') {
                // console.log(allIndices[i], j, i)
                var currProjPt = project([
                    hashedData[allIndices[i]][0],
                    hashedData[allIndices[i]][1],
                ])
                // x, y coordinates
                otherArray[j] = currProjPt.x
                otherArray[j + 1] = currProjPt.z
                // // x, y coordinates
                // value/weight
                otherArray[j + 2] = hashedData[allIndices[i]][3]

                // voxel address
                addressArray[j] = hashedData[allIndices[i]][5]
                addressArray[j + 1] = hashedData[allIndices[i]][6]
                addressArray[j + 2] = hashedData[allIndices[i]][7]
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
        const bounds = [this.lowBnd, this.highBnd]

        return { otherArray, startColor, endColor, addressArray, bounds }
    }

    vlangBuildPixels(geometry, properties) {
        const translations = this.initAttribute(
            properties.size.length * 3,
            3,
            true
        )
        const values = this.initAttribute(properties.size.length, 1, true)
        const originalValues = this.initAttribute(
            properties.size.length,
            1,
            true
        )

        for (let i = 0, j = 0; j < properties.size.length; i = i + 3, j++) {
            translations.setXYZ(
                j,
                properties.translation[i],
                properties.translation[i + 1],
                properties.translation[i + 2]
            )
            values.setX(j, properties.size[j])
            originalValues.setX(j, properties.size[j])
        }

        this.setAttributes(geometry, translations, values, originalValues)
    }

    initTransValsAttrs(geometry, dataArray, addresses, lowBnd, highBnd) {
        const allElements = this.pxWidth * this.pxHeight

        const translations = this.initAttribute(allElements * 3, 3, true)
        const values = this.initAttribute(allElements, 1, true)
        const originalValues = this.initAttribute(allElements, 1, true)

        const valDiff = highBnd - lowBnd
        const remap = x =>
            valDiff * ((x - this.minVal) / (this.maxVal - this.minVal)) + lowBnd

        for (let i = 0, j = 0; i < dataArray.length; i = i + 3, j++) {
            let currIndex = addresses[i + 2]
            // console.log(currIndex)
            translations.setXYZ(
                currIndex,
                dataArray[i],
                0.3 + this.layerN * 0.001,
                dataArray[i + 1]
            )
            // translations.setXYZ(currIndex, dataArray[i], this.layerN * 0.00001, -dataArray[i+1]);
            values.setX(currIndex, remap(dataArray[i + 2]))
            originalValues.setX(currIndex, remap(dataArray[i + 2]))
        }
        this.setAttributes(geometry, translations, values, originalValues)
    }

    // Creates the attributes for the geometry
    // Will modify geometry object
    // Returns the geometry
    setAttributes(geometry, translations, values, originalValues) {
        geometry.addAttribute('translation', translations)
        geometry.addAttribute('size', values)
        geometry.addAttribute('originalsize', originalValues)
    }

    initMaterial(lowBnd, highBnd) {
        console.log(`[Pixels] ${this.layerName}`, { lowBnd, highBnd })

        let material = new THREE.RawShaderMaterial({
            uniforms: {
                show: {
                    type: 'f',
                    value: 1.0,
                },
                min: {
                    type: 'f',
                    value: lowBnd,
                },
                max: {
                    type: 'f',
                    value: highBnd,
                },
                transparency: {
                    type: 'f',
                    value: 0.5,
                },
                startColor: {
                    value: this.startColor,
                },
                endColor: {
                    value: this.endColor,
                },
                rotate: {
                    value: new THREE.Matrix3().set(
                        1.0,
                        0.0,
                        0.0,
                        0.0,
                        0.0,
                        0.0,
                        0.0,
                        -1.0,
                        0.0
                    ),
                },
            },
            vertexShader: document.getElementById('vertexShader').textContent,
            fragmentShader: this.shaderText,
        })
        material.transparent = true
        return material
    }

    get mesh() {
        if (this._mesh == undefined) {
            this._mesh = new THREE.Mesh(this.geometry, this.material)
            this._mesh.name = this.layerName
            this._mesh.frustumCulled = false
            return this._mesh
        } else {
            return this._mesh
        }
    }

    addToScene(scene) {
        scene.add(this.mesh)
    }
}
