/*global datavoxelId*/

import React from 'react'
import { connect } from 'react-redux'
import * as Act from '@/store/actions'
import axios from 'axios'

import hashKey from '@/utils/hashKey'

import Layer from './Layer'

import testFile from '../store/test_userFile.json'
/**
 * The top 2/3rds of the sidebar, "Layers".
 */
class Layers extends React.Component {
    constructor(props) {
        super(props)

        this.checkMemory()
    }

    checkMemory = () => {
        axios
            .get('/getUserfile/' + datavoxelId, { options: {} })
            .then(({ data }) => {
                // console.log('checkmemory', data)

                //  Test
                console.log('checkmemory', testFile)
                data = testFile

                if (data.datasets) this.loadMemory(data)
                else this.initDatasets()
            })
    }

    loadMemory = data => {
        console.log('loadMemory()')
        Act.loadMemory(data)
    }

    /**
     * Requests Datajsons, and then adds a transformed version to the Redux state.
     * Because of this, the last line will trigger "componentWillReceiveProps" in "../map/map.js".
     */
    initDatasets = () => {
        console.log('initDatasets()')

        // NEED REFACTORING
        // TODO: Change this when migrate to actual code
        // GET RID OF DATA... THIS SHOULD BE DONE ON THE FLY WITH A TRANSFORM

        console.log({ datavoxelId })

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
            .catch(e => console.log('initDatasets() error', e))
    }
    /**
     * Renders the "Layers" component, which is the top 2/3rd of the sidebar on the left.
     */
    render() {
        console.log('Layers Props', JSON.stringify(this.props))
        return (
            <div className="layers">
                {Object.entries(this.props.datasets.layers).map(
                    ([i, layer]) => (
                        <Layer
                            key={i}
                            layerKey={i}
                            propName={layer.propertyName}
                            userPropName={layer.userLayerName}
                            name={layer.name}
                            visible={layer.visible}
                            showSidebar={layer.showSidebar}
                        />
                    )
                )}
            </div>
        )
    }
}

export default connect(s => ({
    datasets: s.datasets,
    vpl: s.vpl,
    options: s.options,
}))(Layers)
