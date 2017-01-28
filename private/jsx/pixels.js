
export default class Pixels {
    // GeometryObject will be a Three.js geometry
    // dataArray will be an array which holds the x, y, and value for each object
    // Example: Float32Array([x1, y1, v1, x2, y2, v2, ...])
    constructor(graph, geometryObject, dataArray, startColor, endColor, minMax, addresses, pxWidth=200, pxHeight=200, n=0){
        const lowBnd = .0015;
        const highBnd = .012;

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

        this.initTransValsAttrs(this.geometry, dataArray, lowBnd, highBnd);
        this.material = this.initMaterial(lowBnd, highBnd);

        this.neighborsOf(8);

        this.addToScene(graph.scene);
    }

    // Zoom Extent based on geo's bbox
    static zoomExtent(canvas, bbox) {
        let aabbMin = new THREE.Vector3();
        let aabbMax = new THREE.Vector3();
        let radius = 0;
        let newBbox = bbox[0]

        aabbMin.x = newBbox[0][0];
        aabbMin.y = -newBbox[0][1];
        aabbMin.z = 0;
        aabbMax.x = newBbox[2][0];
        aabbMax.y = -newBbox[2][1];
        aabbMax.z = 0;

        // Compute world AABB center
        let aabbCenter = new THREE.Vector3();
        aabbCenter.x = (aabbMax.x + aabbMin.x) * 0.5;
        aabbCenter.z = (aabbMax.y + aabbMin.y) * 0.5;
        aabbCenter.y = (aabbMax.z + aabbMin.z) * 0.5;
        canvas.controls.target = aabbCenter;

        // Compute world AABB "radius" (approx: better if BB height)
        let diag = new THREE.Vector3();
        diag = diag.subVectors(aabbMax, aabbMin);
        radius = diag.length() * 0.5;

        // Compute offset needed to move the camera back that much needed to center AABB (approx: better if from BB front face)
        let offset = radius / Math.tan(Math.PI / 180.0 * canvas.camera.fov * 0.5);
        let thiscam = canvas.camera;
        let newPos = new THREE.Vector3(aabbCenter.x, offset, aabbCenter.z)

        //set camera position and target
        thiscam.position.set(newPos.x, newPos.y, newPos.z);
    }

    // Create a InstancedBufferGeometry Object
    // See Three.js Docs for more info
    initGeometry() {
        return new THREE.InstancedBufferGeometry();
    }

    setGeometry(geometry, geometryObject) {
        geometry.copy(geometryObject);
    }

    initAttribute(size, itemSize, normalized) {
        return new THREE.InstancedBufferAttribute(new Float32Array(size), itemSize, normalized);
    }

    static parseDataJSON(datajson) {
        // Matrix of data
        // const data = datajson.geojson.data;
        const otherData = datajson.geojson.otherdata;
        const otherArray = new Float32Array(otherData.length * 3)
        const addressArray = new Float32Array(otherData.length * 3)

        // const array = new Float32Array(data.length * data[0].length * 3);
        const startColor = datajson.color1;
        const endColor = datajson.color2;


        let minVal = Number.POSITIVE_INFINITY;
        let maxVal = Number.NEGATIVE_INFINITY;

        for (let i = 0, j=0; i < otherData.length; i++, j=j+3){
            // x, y coordinates
            otherArray[j] = otherData[i][0];
            otherArray[j + 1] = otherData[i][1];
            // value/weight
            otherArray[j + 2] = otherData[i][3];

            // voxel address
            addressArray[j] = otherData[i][5];
            addressArray[j+1] = otherData[i][6];
            addressArray[j+2] = otherData[i][7];

            if (otherData[i][3]<minVal) { minVal=otherData[i][3] };
            if (otherData[i][3]>maxVal) { maxVal=otherData[i][3]};
        }

        const minMax = [minVal, maxVal];

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


        // Old implementation using a datajson.geojson array
        // Very memory inefficient
        //for (var i = 0, j = 0; i < data.length * data[0].length; i++, j = j + 3) {
            //// x, y coordinates
            //array[j]   = (datajson.geojson[i].geometry.coordinates[0]*2 - 1)*300;
            //array[j+1] = (datajson.geojson[i].geometry.coordinates[1]*2 - 1)*300;
            //// Value
            //array[j+2] = datajson.geojson[i].properties[datajson.name];
        //}

        return { otherArray, startColor, endColor, minMax, addressArray};

    }

    // get addresses() {
    //     if (this._addresses == undefined) {
    //         this._addresses = new Array(this.numElements);

    //         for (let i = 0; i < this.pxWidth*this.pxHeight; i++) {
    //             //console.log([Math.floor(i/this.pxWidth), i%this.pxWidth]);
    //             this._addresses[i] = [Math.floor(i/this.pxWidth), i%this.pxWidth];
    //         }

    //         return this._addresses;

    //     } else {
    //         return this._addresses;
    //     }
    // }

    initTransValsAttrs(geometry, dataArray, lowBnd, highBnd) {
        const allElements = this.pxWidth * this.pxHeight;
        console.log(allElements);
        const numElements = dataArray.length / this.ELEMENTS_PER_ITEM;

        const translations = this.initAttribute(numElements * 3, 3, true);
        const values = this.initAttribute(numElements, 1, true);

        const remap = x => (highBnd-lowBnd)*((x-this.minVal)/(this.maxVal-this.minVal))+lowBnd;
        const mapColor = x => (x-this.minVal)/(this.maxVal-this.minVal);

        for (let i = 0, j = 0; i < dataArray.length; i = i + 3, j++){
            translations.setXYZ(j, dataArray[i], 0, -dataArray[i+1]);
            values.setX(j, remap(dataArray[i+2]));
        }
        //
        this.setAttributes(geometry, translations, values);
    }

    // Creates the attributes for the geometry
    // Will modify geometry object
    // Returns the geometry
    setAttributes(geometry, translations, values) {
        geometry.addAttribute('translation', translations);
        geometry.addAttribute('size', values);
    }

    neighborsOf(numberOfNeighbors) {
        const addresses = this.addresses;
        const currValues = this.mesh.geometry.attributes.size.array;

        // neighborhood: {
        //     column: Math.floor(i/rows),
        //     row: i%rows
        // }, 

        // console.log(addresses);
        // console.log(currValues);

        var numberOfNeighbors = 0;

        const neighbors =  new Float32Array(addresses.length);
        for (let i = 0, j = 0; i < addresses.length; i = i + 3, j++) {
            let currNeighbors = new Float32Array(numberOfNeighbors);
            let row = addresses[i];
            let col = addresses[i+1];
            let currIndex = col * this.pxHeight;
            if (numberOfNeighbors == 0) {
                neighbors[i] = [currIndex];
            }

        }
        // console.log(neighbors);


        // var m = this.pxWidth;
        // var n = this.pxHeight;
        // var pixelAddress = this._pixels[pixelIndex];
        // var x = pixelAddress[0];
        //     y = pixelAddress[1];
        
        // var indices = [-1, 0, 1];
        // var ret = [];
        // var arrayM = Array.apply(null, Array(m)).map(function (_, i) {return i;});
        // var arrayN = Array.apply(null, Array(n)).map(function (_, i) {return i;});
        
        // for (var di = 0; di < indices.length; di++) {
        //     for (var dj = 0; dj < indices.length; dj ++) {
        //         var wBoolean = arrayM.indexOf(x+indices[di]) >= 0;
        //         var hBoolean = arrayN.indexOf(y+indices[dj]) >= 0;
        //         if (wBoolean == true && hBoolean == true) {
        //             //if (!(indeces[di]==0 && indeces[dj]==0)) {
        //             var new_index = ((x+indices[di])*m)+(y+indices[dj]);
        //             ret.push(new_index);
        //             //}
        //         }
                
        //     }
        // }
        // return ret;

    }

    allNeighbors() {
        this._addresses();
        for (var i = 0; i<this.pxHeight*this.pxWidth; i++) {
            this._neighbors[i] = this.neighborsOf(i);
        }
        return this._neighbors
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
        scene.add( this.mesh );
    }

}
