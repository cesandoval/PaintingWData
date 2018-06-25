import * as t from '../types'

const initialDatasetsState = {
    layers: {},
    minMax: [],
    allIndices: [],
    bounds: [],
    userId: 0,
}
export default (state = initialDatasetsState, action) => {
    switch (action.type) {
        /**
         * Imports datasets from "layers.js", which then triggers the creation of Pixels in "map.js" (componentWillReceiveProps).
         */
        case t.IMPORT_DATASETS: {
            /*eslint-disable*/
            debugger;
            const { datasets } = action // "datasets" is an Array; each element is an Object containing
                                        // all the relevant geojson data.
            // TODO: check how to use datasets value to setup `minMax` and `allIndices`
            // TODO: refactor color......
            // Takes an array of colors, and shuffles them.
            const color10 = d3.scale.category10().range()
            for (let i = color10.length; i; i--) {
                let j = Math.floor(Math.random() * i)
                ;[color10[i - 1], color10[j]] = [color10[j], color10[i - 1]]
            }
            // Transforms each "datasets" element into an element of "layers".
            let layers = datasets.map((l, index) => {
                const length = l.geojson.geojson.features.length
                const propertyName = l.geojson.geojson.features[0].properties.property
                // Will hold a transformed geojson.
                const transGeojson = {
                    // The layer name.
                    name: l.geojson.layername,
                    // The type.
                    type: l.geojson.geojson.features[0].geometry.type,
                    // The number of features in the geojson.
                    length: length,
                    // TODO: OTHERDATA SHOULD BE ELIMINATED ONCE THE GRAPH CREATOR IS MIGRATED TO THE NEW VERSION
                    otherdata: Array(length),
                    // Empty for now.
                    hashedData: {},
                    minMax: Array(2),
                }
                // Calculates the lower and upper bounds.
                const projOffset = 111.111
                const ptDistance = l.Datavoxel.ptDistance * projOffset
                const lowBnd = ptDistance / 10
                const highBnd = ptDistance * 1.2
                const bounds = [lowBnd, highBnd]
                // Define "shaderContent"; C++ code for the shader.
                let shaderContent = document.getElementById('fragmentShader')
                    .textContent
                shaderContent = shaderContent.replace(
                    /1.5/g,
                    parseFloat(1 / ptDistance)
                )
                // Each feature in "features" is mapped to an array of Floats; they constitute "mappedGeojson".
                const mappedGeojson = l.geojson.geojson.features.map(g => {
                    // The latitude/longitude of the feature.
                    const coords = g.geometry.coordinates
                    // The size of the feature.
                    const weight = parseFloat(g.properties[l.layername])
                    // Row/column of the feature.
                    const row = g.properties.neighborhood.row
                    const column = g.properties.neighborhood.column
                    // Some index.
                    const pointIndex = g.properties.pointIndex
                    return new Float32Array([
                        coords[0],
                        coords[1],
                        0,
                        weight,
                        1,
                        row,
                        column,
                        pointIndex,
                    ])
                })
                // We now compute "minVal" and "maxVal", the minimum and maximum weights over all the features.
                let minVal = Number.POSITIVE_INFINITY
                let maxVal = Number.NEGATIVE_INFINITY
                for (let i = 0; i < length; i++) {
                    if (mappedGeojson[i][3] < minVal) {
                        minVal = mappedGeojson[i][3]
                    }
                    if (mappedGeojson[i][3] > maxVal) {
                        maxVal = mappedGeojson[i][3]
                    }
                    // "otherdata" becomes "mappedGeojson".
                    transGeojson.otherdata[i] = mappedGeojson[i]
                    // "hashedData" is the same, but the keys are "pointIndex" pointing to the associated feature.
                    transGeojson.hashedData[mappedGeojson[i][7]] =
                        mappedGeojson[i]
                }
                // TODO: more than 10 color
                l.color1 = color10[index % 10]
                l.color2 = l.color1
                // "minMax" holds the highest and lowest weights over all features.
                transGeojson.minMax = [minVal, maxVal]
                // Return some stuff.
                return {
                    name: l.layername,
                    propertyName: propertyName,
                    visible: true,
                    color1: l.color1,
                    color2: l.color2,
                    geojson: transGeojson,
                    bbox: l.Datavoxel.bbox.coordinates,
                    rowsCols: l.Datavoxel.rowsCols,
                    bounds: bounds,
                    allIndices: l.Datavoxel.allIndices,
                    shaderText: shaderContent,
                    userLayerName: l.Datafile.Datalayers[0].userLayerName,
                    layerKey: l.layerKey,
                }
            })
            // Return all the data in all the layers.
            return {
                ...state,
                layers: _.keyBy(layers, 'layerKey'),
                minMax: layers[0].geojson.minMax,
                allIndices: layers[0].allIndices,
                bounds: layers[0].bounds,
                userId: datasets[0].userId,
            }
        }
        case t.LOAD_TABLE_DATA: {
            const { value } = action
            const loading = { tableData: value }

            return Object.assign({}, state, loading)
        }
        default:
            return state
    }
}
