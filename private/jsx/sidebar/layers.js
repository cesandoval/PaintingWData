/*global datavoxelId*/

import React from 'react'
import { connect } from 'react-redux'
import * as act from '../store/actions'
import axios from 'axios'

import Layer from './layer'

// const color10 = d3.scaleOrdinal(d3.schemeCategory10).range() // d3.js v4 (backup)
const color10 = d3.scale.category10().range() // d3.js v3

// shuffle the color10
for (let i = color10.length; i; i--) {
    let j = Math.floor(Math.random() * i)
    ;[color10[i - 1], color10[j]] = [color10[j], color10[i - 1]]
}

const createLayer = (
    name,
    propertyName,
    visible,
    color1 = '#00ff00',
    color2 = '#0000ff',
    geojson = [],
    bbox,
    rowsCols,
    bounds,
    allIndices,
    shaderText,
    userLayerName
) => ({
    name,
    propertyName,
    visible,
    color1,
    color2,
    geojson,
    bbox,
    rowsCols,
    bounds,
    allIndices,
    shaderText,
    userLayerName,
})

class Layers extends React.Component {
    constructor(props) {
        super(props)
        this.getLayers = this.getLayers.bind(this)
        this.getLayers()
    }
    // Assumes that geojson will be nonzero size
    getLayers() {
        // TODO Change this when migrate to actual code
        // GET RID OF DATA... THIS SHOULD BE DONE ON THE FLY WITH A TRANSFORM
        axios
            .get('/datajson/all/' + datavoxelId, { options: {} })
            .then(({ data }) => {
                act.vlangAddLayers(
                    data.map(l => {
                        let property =
                            l.geojson.geojson.features[0].properties.property
                        return {
                            userLayerName:
                                l.Datafile.Datalayers[0].userLayerName,
                            name: l.geojson.layername,
                            property: property,
                        }
                    })
                )
                act.sideAddLayers(
                    data.map((l, index) => {
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
                        let shaderContent = document.getElementById(
                            'fragmentShader'
                        ).textContent
                        shaderContent = shaderContent.replace(
                            /1.5/g,
                            parseFloat(1 / ptDistance)
                        )

                        const mappedGeojson = l.geojson.geojson.features.map(
                            g => {
                                // Shouldn't need to parse
                                //const coords = g.geometry.coodinates.map(a=>(parseFloat(a)))
                                const coords = g.geometry.coordinates
                                // const id = parseFloat(g.id);
                                const weight = parseFloat(
                                    g.properties[l.layername]
                                )
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
                            }
                        )
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
                        return createLayer(
                            l.layername,
                            propertyName,
                            true,
                            l.color1,
                            l.color2,
                            transGeojson,
                            l.Datavoxel.bbox.coordinates,
                            l.Datavoxel.rowsCols,
                            bounds,
                            l.Datavoxel.allIndices,
                            shaderContent,
                            l.Datafile.Datalayers[0].userLayerName
                        )
                    })
                )
            })
    }
    render() {
        return (
            <div className="layers">
                {this.props.layers.map((layer, i) => (
                    <Layer
                        key={i}
                        propName={layer.propertyName}
                        userPropName={layer.userLayerName}
                        name={layer.name}
                        visible={layer.visible}
                        color1={layer.color1}
                        color2={layer.color2}
                    />
                ))}
            </div>
        )
    }
}

export default connect(s => ({ layers: s.sidebar.layers }))(Layers)
