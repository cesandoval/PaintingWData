import React from 'react'
import { connect } from 'react-redux'
import * as Act from '../store/actions'

// TODO List

// 1.
// the hover style like: http://bl.ocks.org/eesur/1a2514440351ec22f176

class PCoords extends React.Component {
    // TODO.... ADD THE NAME OF THE LAYERS TO THE DICTIONARY INSTEAD OF PASSING AN ARRAYY
    // THIS WAY, WE CAN DISPLAY THE NAME INSTEAD OF THE INDEX....

    constructor(props) {
        super(props)

        this.state = {
            pc: null,
        }

        this.pcoordsValue = {}
        this.build = this.build.bind(this)
        this.calcRanges = this.calcRanges.bind(this)
    }
    componentWillReceiveProps(nprops) {
        this.props = nprops

        if (
            Object.keys(this.props.geometries).length !== 0 &&
            this.props.geometries.constructor === Object
        ) {
            // TODO: should be renamed to 'datasetNodes'
            let nodeLayers = Object.values(nprops.nodes).filter(
                f => f.type == 'DATASET'
            )
            let visibleNodes = nodeLayers.filter(l => l.visibility)

            this.setState({ visibleLayers: visibleNodes.length })
            if (
                visibleNodes.length != this.state.visibleLayers &&
                this.state.started
            ) {
                let visibleNames = {}
                for (var key in this.layersHashProperty) {
                    if (
                        Object.values(visibleNodes)
                            .map(i => i.nodeKey)
                            .includes(key)
                    ) {
                        visibleNames[this.layersHashProperty[key]] = {}
                    }
                }
                if (
                    !(
                        Object.keys(visibleNames).length === 0 &&
                        visibleNames.constructor === Object
                    )
                ) {
                    this.pc
                        .dimensions(visibleNames)
                        .render()
                        .updateAxes()
                }
                if (nprops.pcoordsValue != 'undefined') {
                    this.pc.brushExtents(nprops.pcoordsValue)
                }
            }
            if (!this.state.started) {
                this.setState({ started: true })
                let sidebarLayers = nprops.layers.filter(l => l.visible)
                // get the max length of Voxels of layers(?)
                var maxVoxels = 0
                for (let i = 0; i < sidebarLayers.length; i++) {
                    let currVoxels = sidebarLayers[i].geojson.length
                    if (currVoxels > maxVoxels) {
                        maxVoxels = currVoxels
                    }
                }
                const bounds = nprops.datasets.bounds
                var indicesArray = nprops.datasets.allIndices

                this.lowBnd = bounds[0]
                this.highBnd = bounds[1]

                // Sets the mins and maxs values of every layer
                const mins = Array(nprops.layers.length)
                const maxs = Array(nprops.layers.length)
                const hashedMins = {}
                const hashedMaxs = {}
                const layersHashProperty = {}
                // var layerIndeces = {}
                // const layersNameProperty = {}
                for (let i = 0; i < nprops.layers.length; i++) {
                    mins[i] = nprops.layers[i].geojson.minMax[0]
                    maxs[i] = nprops.layers[i].geojson.minMax[1]

                    layersHashProperty[nprops.layers[i].layerKey] =
                        nprops.layers[i].userLayerName +
                        '_' +
                        nprops.layers[i].propertyName
                    hashedMins[nprops.layers[i].layerKey] =
                        nprops.layers[i].geojson.minMax[0]
                    hashedMaxs[nprops.layers[i].layerKey] =
                        nprops.layers[i].geojson.minMax[1]
                }
                this.minVal = mins
                this.maxVal = maxs

                this.hashedMins = hashedMins
                this.hashedMaxs = hashedMaxs
                this.layersHashProperty = layersHashProperty
                // this.layersNameProperty = layersNameProperty
                // this.brushed = false;

                // TODO: Assumes that each layer has different length.
                // Assumes that all of the layers have the same length
                // and also that the data matches up
                // ie. indexes == same location

                //clean the container first
                let pcContainer = document.getElementById('parcoords')
                while (pcContainer.firstChild) {
                    pcContainer.removeChild(pcContainer.firstChild)
                }

                this.setState({ visibleLayers: visibleNodes.length })

                // var visibleIndices = Object.values(visibleNodes).map(i => i.name).reduce((a, e) => (a[e] = layerIndeces[e], a), {});
                // let visibleLayers = Object.values(visibleIndices).map(i => nprops.layers[i])
                let numLayers = visibleNodes.length
                // TODO: should be reuse, so rename numLayer to visibleLayersLength

                let dictBuild = Array(maxVoxels)
                for (let j = 0; j < numLayers; j++) {
                    for (let i = 0; i < maxVoxels; i++) {
                        if (dictBuild[i] == undefined) {
                            dictBuild[i] = {}
                        }
                        if (
                            indicesArray[i] in
                            nprops.layers[j].geojson.hashedData
                        ) {
                            dictBuild[i][
                                nprops.layers[j].userLayerName +
                                    '_' +
                                    nprops.layers[j].propertyName
                            ] =
                                nprops.layers[j].geojson.hashedData[
                                    indicesArray[i]
                                ][3]
                            // review: [3] ?
                        } else {
                            dictBuild[i][
                                nprops.layers[j].userLayerName +
                                    '_' +
                                    nprops.layers[j].propertyName
                            ] = 0
                        }
                    }
                }

                this.build(dictBuild)
                // this.layerIndeces = layerIndeces
                // this.layersNameProperty = layersNameProperty
            }
        }

        if (this.pc) {
            let pcoordsValue = {}

            nprops.layers.map(({ userLayerName, propertyName, layerKey }) => {
                const node = nprops.nodes[layerKey]
                const key = userLayerName + '_' + propertyName
                const filter = node.filter
                const min = filter.min
                const max = filter.max
                const isMin = min == filter.minVal
                const isMax = max == filter.maxVal
                const isFiltered = !isMin || !isMax
                const isBrushed = this.pcoordsValue[key]

                // update brushs if is filtered, or is brushed but isn't filtered
                if (isFiltered || (!isFiltered && isBrushed))
                    pcoordsValue[key] = [min, max]
            })

            // check if status are updated
            let visibleDatasets = Object.values(nprops.nodes).filter(
                f => f.type == 'DATASET' && f.visibility
            )
            const layerU = visibleDatasets.length != this.state.visibleLayers
            const pcoordsU = !_.isEqual(pcoordsValue, this.pcoordsValue)

            if (layerU || pcoordsU) {
                this.pcoordsValue = pcoordsValue

                try {
                    this.pc.brushExtents(pcoordsValue)
                } catch (e) {
                    // console.log(e.message)
                }
            }
        }
    }

    build(data) {
        let minVal = this.minVal[0]
        let maxVal = this.maxVal[0]

        // linear color scale
        const blue_to_brown = d3.scale
            .linear()
            .domain([minVal, maxVal])
            .range([d3.rgb(245, 165, 3), d3.rgb(74, 217, 217)])
            .interpolate(d3.interpolateLab)

        const pc = d3
            .parcoords()('#parcoords')
            .mode('queue')
            .data(data)
            .composite('darken')
            .color(function(d) {
                var keys = Object.keys(d)
                return blue_to_brown(d[keys[0]])
            })
            .alpha(0.35)
            .render()
            .createAxes()
            .reorderable()
            .brushMode('1D-axes')

        pc.on('brushend', this.calcRanges.bind(this))

        this.pc = pc
        this.setState({ pc: pc })
    }

    calcRanges() {
        // review: what is the mean of radoms 'true'?
        // this.pc.randoms = true

        const brushSelection = this.pc.brushExtents()
        const layerNames = Object.keys(brushSelection)

        // Calculate range of data
        let maxObjs = {}
        let minObjs = {}

        let brushes = {}
        if (layerNames.length > 0) {
            // review: when is the layerNames.length less then 0?
            for (let i = 0; i < layerNames.length; i++) {
                let selection = brushSelection[layerNames[i]]
                minObjs[layerNames[i]] = selection[0]
                maxObjs[layerNames[i]] = selection[1]
                brushes[layerNames[i]] = [selection[0], selection[1]]
            }
        }
        this.minObjs = minObjs
        this.maxObjs = maxObjs

        /*
        const lowBnd = this.lowBnd
        const highBnd = this.highBnd
        // console.log({ highBnd, lowBnd })
        */

        /*
        const remap = function(x, i, mins, maxs) {
            return (
                (highBnd - lowBnd) * ((x - mins[i]) / (maxs[i] - mins[i])) +
                lowBnd
            )
        }
        */

        // the range(min and max) of uniforms is 0 - 1
        // for (let name in minObjs) {
        for (let i in this.props.layers) {
            // review: replace minObjs to layerNames.length
            const layer = this.props.layers[i]
            const name = `${layer.userLayerName}_${layer.propertyName}`
            // Checks if the layer has been filtered, if it has, changes the min and max values
            if (layerNames.includes(name)) {
                const maxVal = this.hashedMaxs[layer.layerKey]
                const minVal = this.hashedMins[layer.layerKey]

                const max = maxObjs[name]
                const min = minObjs[name]

                const filter = { max, min, maxVal, minVal }
                console.log(`PCoords`, filter)

                Act.nodeUpdate({
                    nodeKey: layer.layerKey,
                    attr: 'filter',
                    value: filter,
                })
            }
        }

        Act.setRefreshVoxels({ value: true })
    }
    style() {
        return {
            backgroundColor: 'white',
            width: '80vw',
            height: '300px',
            position: 'fixed',
            overflow: 'hidden',
            bottom: '30px',
            right: '0',
            zIndex: '10',
            opacity: 0.5,
        }
    }
    render() {
        let pcoordsRef = parcoords => (this.pcoordsRef = parcoords)
        const hasVisibleLayers = this.state.visibleLayers ? true : false

        return (
            <div
                id="parcoords"
                className="parcoords"
                ref={pcoordsRef}
                style={this.style()}
            >
                <style jsx>{`
                    #parcoords {
                        &::after {
                            content: 'No Visible Dataset Layers';
                            visibility: ${hasVisibleLayers ? 'hidden' : ''};
                            position: absolute;
                            margin: auto;
                            top: 139px;
                            left: 0;
                            right: 0;
                            text-align: center;
                            font-size: 18px;
                            width: 320px;
                            letter-spacing: 1px;
                            font-weight: 500;
                        }

                        :global(svg) {
                            visibility: ${hasVisibleLayers ? '' : 'hidden'};
                        }
                    }
                `}</style>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        mapStarted: state.map.started,
        datasets: state.datasets,
        layers: _.toArray(state.datasets.layers),
        geometries: state.map.geometries,
        nodes: state.vpl.nodes,
        panelShow: state.interactions.panelShow,
    }
}

export default connect(mapStateToProps)(PCoords)
