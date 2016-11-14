
export default class Pixels {
    // GeometryObject will be a Three.js geometry
    // dataArray will be an array which holds the x, y, and value for each object
    // Example: Float32Array([x1, y1, v1, x2, y2, v2, ...])
    constructor(graph, geometryObject, dataArray, startColor, endColor, pxWidth=200, pxHeight=200, n=0){
        // Constants
        this.ELEMENTS_PER_ITEM = 3
        this.pxWidth = pxWidth;
        this.pxHeight = pxHeight;

        // Pixels (Geometry)
        this.geometry = this.initGeometry();
        this.setGeometry(this.geometry, geometryObject)
        this.startColor = new THREE.Color(startColor);
        this.endColor = new THREE.Color(endColor);
        this.layerN = n;

        // Sanity Check
        if (dataArray.length % this.ELEMENTS_PER_ITEM != 0)
            console.error("Wrong sized data array passed to Pixels constructor!");

        this.numElements = dataArray.length / this.ELEMENTS_PER_ITEM;

        this.initTransValsAttrs(this.geometry, dataArray);
        this.material = this.initMaterial();

        this.addToScene(graph.scene);
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
        const data = datajson.geojson.data;

        const array = new Float32Array(data.length * data[0].length * 3);
        const startColor = datajson.color1;
        const endColor = datajson.color2;

        const shift = x => ( (x * 2 - 1) * 300 );

        for (let i = 0; i < data.length; i++){
            for (let j = 0; j < data[0].length; j++){
                // x, y coordinates
                array[(i * data.length + j) * 3 + 0] = shift(data[i][j][0]);
                array[(i * data.length + j) * 3 + 1] = shift(data[i][j][1]);
                // value/weight
                array[(i * data.length + j) * 3 + 2] = data[i][j][3];
            }
        }


        // Old implementation using a datajson.geojson array
        // Very memory inefficient
        //for (var i = 0, j = 0; i < data.length * data[0].length; i++, j = j + 3) {
            //// x, y coordinates
            //array[j]   = (datajson.geojson[i].geometry.coordinates[0]*2 - 1)*300;
            //array[j+1] = (datajson.geojson[i].geometry.coordinates[1]*2 - 1)*300;
            //// Value
            //array[j+2] = datajson.geojson[i].properties[datajson.name];
        //}

        return { array, startColor, endColor };

    }

    get addresses() {
        if (this._addresses == undefined) {
            this._addresses = new Array(this.numElements);

            for (let i = 0; i < this.pxWidth*this.pxHeight; i++) {
                //console.log([Math.floor(i/this.pxWidth), i%this.pxWidth]);
                this._addresses[i] = [Math.floor(i/this.pxWidth), i%this.pxWidth];
            }

            return this._addresses;

        } else {
            return this._addresses;
        }
    }

    initTransValsAttrs(geometry, dataArray) {
        const numElements = dataArray.length / this.ELEMENTS_PER_ITEM;

        const translations = this.initAttribute(numElements * 3, 3, true);
        const values = this.initAttribute(numElements, 1, true);

        for (let i = 0, j = 0; i < dataArray.length; i = i + 3, j++){
            translations.setXYZ(j, dataArray[i], this.layerN * 0.01, dataArray[i+1]);
            values.setX(j, 1.0-dataArray[i+2]);
        }
        this.setAttributes(geometry, translations, values);
    }

    // Creates the attributes for the geometry
    // Will modify geometry object
    // Returns the geometry
    setAttributes(geometry, translations, values) {
        geometry.addAttribute('translation', translations);
        geometry.addAttribute('size', values);
    }

    initMaterial(){
        let material = new THREE.RawShaderMaterial({
            uniforms: {
                show: {
                    type: 'f',
                    value: 1.0
                },
                min: {
                    type: 'f',
                    value: 0.0
                },
                max: {
                    type: 'f',
                    value: 1.0
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
