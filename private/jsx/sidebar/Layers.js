/*global datavoxelId*/

import React from 'react'
import { connect } from 'react-redux'
import * as Act from '@/store/actions'
import axios from 'axios'

import hashKey from '@/utils/hashKey'

import Layer from './Layer'
/**
 * The top 2/3rds of the sidebar, "Layers".
 */
class Layers extends React.Component {
    constructor(props) {
        super(props)
        this.getLayers = this.getLayers.bind(this)
        this.getLayers() // NEED REFACTORING
    }
    /**
     * Requests Datajsons, and then adds a transformed version to the Redux state.
     * Because of this, the last line will trigger "componentWillReceiveProps" in "../map/map.js".
     */
    getLayers() {
        // TODO: Change this when migrate to actual code
        // GET RID OF DATA... THIS SHOULD BE DONE ON THE FLY WITH A TRANSFORM
        axios
            .get('/datajson/all/' + datavoxelId, { options: {} })
            .then(({ data }) => {
                /*
                 * "data" is an array of "datasets", which contain important voxel information.
                 * For each "dataset" in "data", add the "layerKey" property if it doesn't exist.
                 */
                let datasets = data.map(dataset => {
                    // The hash function.
                    const layerHashKey = hashKey()
                    if (!dataset.layerKey) {
                        dataset.layerKey = layerHashKey
                    }
                    return dataset
                })
                // With "datasets", we'll add a transformed version of this to the Redux state.
                Act.importDatasets({ datasets })
            })
            .catch(e => console.log('getLayers() error', e))
    }
    /**
     * Renders the "Layers" component, which is the top 2/3rd of the sidebar on the left.
     */
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
                    />
                ))}
            </div>
        )
    }
}

export default connect(s => ({ layers: s.datasets.layers }))(Layers)
