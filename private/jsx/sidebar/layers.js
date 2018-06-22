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

/*
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
*/

class Layers extends React.Component {
    constructor(props) {
        super(props)
        this.getLayers = this.getLayers.bind(this)
        this.getLayers() // NEED REFACTORING
    }
    // Assumes that geojson will be nonzero size
    getLayers() {
        // TODO Change this when migrate to actual code
        // GET RID OF DATA... THIS SHOULD BE DONE ON THE FLY WITH A TRANSFORM
        axios
            .get('/datajson/all/' + datavoxelId, { options: {} })
            .then(({ data }) => {
                let datasets = data.map(dataset => {
                    const hashKey =
                        (+new Date()).toString(32) +
                        Math.floor(Math.random() * 36).toString(36)

                    if (!dataset.layerKey) {
                        dataset.layerKey = hashKey
                    }
                    return dataset
                })
                act.importDatasets({ datasets })
            })
            .catch(e => console.log('getLayers() error', e))
    }
    render() {
        return (
            <div className="layers">
                {Object.entries(this.props.layers).map(([i, layer]) => (
                    <Layer
                        key={i}
                        layerKey={i}
                        propName={layer.propertyName}
                        userPropName={layer.userLayerName}
                        name={layer.name}
                        visible={layer.visible}
                        showSidebar={layer.showSidebar}
                        // color1={layer.color1}
                        // color2={layer.color2}
                    />
                ))}
            </div>
        )
    }
}

export default connect(s => ({ layers: s.datasets.layers }))(Layers)
