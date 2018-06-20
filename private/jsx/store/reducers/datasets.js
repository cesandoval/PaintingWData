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
        case t.IMPORT_DATASETS: {
            const { datasets } = action // datasets is an Array

            // TODO: check how to use datasets value to setup `minMax` and `allIndices`
            // TODO: refactor color......

            // const color10 = d3.scaleOrdinal(d3.schemeCategory10).range() // d3.js v4 (backup)
            const color10 = d3.scale.category10().range() // d3.js v3

            // shuffle the color10
            for (let i = color10.length; i; i--) {
                let j = Math.floor(Math.random() * i)
                ;[color10[i - 1], color10[j]] = [color10[j], color10[i - 1]]
            }

            let layers = datasets.map((l, index) => {
                const length = l.geojson.geojson.features.length
                const propertyName =
                    l.geojson.geojson.features[0].properties.property

                // Will hold a transoformed geojson
                const transGeojson = {
                    name: l.geojson.layername,
                    type: l.geojson.geojson.features[0].geometry.type,
                    length: length,
                    // data: Array(Math.floor(Math.sqrt(length))),
                    // OTHERDATA SHOULD BE ELIMINATED ONCE THE GRAPH CREATOR IS MIGRATED TO THE NEW VERSION
                    otherdata: Array(length),
                    hashedData: {},
                    minMax: Array(2),
                }
                // geojson -> Float32Array([x, y, z, w, id])
                // Map Geojson data to matrix index

                const projOffset = 111.111
                const ptDistance = l.Datavoxel.ptDistance * projOffset
                const lowBnd = ptDistance / 10
                const highBnd = ptDistance * 1.2
                const bounds = [lowBnd, highBnd]

                // Define the Shader
                let shaderContent = document.getElementById('fragmentShader')
                    .textContent
                shaderContent = shaderContent.replace(
                    /1.5/g,
                    parseFloat(1 / ptDistance)
                )

                const mappedGeojson = l.geojson.geojson.features.map(g => {
                    // Shouldn't need to parse
                    //const coords = g.geometry.coodinates.map(a=>(parseFloat(a)))
                    const coords = g.geometry.coordinates
                    // const id = parseFloat(g.id);
                    const weight = parseFloat(g.properties[l.layername])
                    const row = g.properties.neighborhood.row
                    const column = g.properties.neighborhood.column
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
                // mappedGeojson.sort();
                // for (let i = 0; i < Math.floor(Math.sqrt(length)); i++){
                //     let j = i * 200;
                //     transGeojson.data[i] = mappedGeojson.slice(j, j+200);
                // }

                let minVal = Number.POSITIVE_INFINITY
                let maxVal = Number.NEGATIVE_INFINITY

                for (let i = 0, j = 0; i < length; i++, j = j + 3) {
                    if (mappedGeojson[i][3] < minVal) {
                        minVal = mappedGeojson[i][3]
                    }
                    if (mappedGeojson[i][3] > maxVal) {
                        maxVal = mappedGeojson[i][3]
                    }
                    transGeojson.otherdata[i] = mappedGeojson[i]
                    transGeojson.hashedData[mappedGeojson[i][7]] =
                        mappedGeojson[i]
                }

                // TODO: more than 10 color
                l.color1 = color10[index % 10]
                l.color2 = l.color1
                // l.color2 = d3.rgb(l.color1).brighter().toString()

                transGeojson.minMax = [minVal, maxVal]
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
            return {
                ...state,
                layers: _.keyBy(layers, 'layerKey'),
                minMax: layers[0].geojson.minMax,
                allIndices: layers[0].allIndices,
                bounds: layers[0].bounds,
                userId: datasets[0].userId,
            }
        }
        default:
            return state
    }
}
