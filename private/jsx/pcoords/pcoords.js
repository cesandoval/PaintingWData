import React from 'react'
import { connect } from 'react-redux'

// TODO List

// 1.
// When the layer is turned off, and on,
// the parallel coordinates widget loses the `brushed` property.
// Keep track of the property so it does not restart.

// 2.
// the hover style like: http://bl.ocks.org/eesur/1a2514440351ec22f176

class PCoords extends React.Component {
    // TODO.... ADD THE NAME OF THE LAYERS TO THE DICTIONARY INSTEAD OF PASSING AN ARRAYY
    // THIS WAY, WE CAN DISPLAY THE NAME INSTEAD OF THE INDEX....

    constructor(props) {
        super(props)

        this.state = {
            pc: null,
            previousBrush: {},
        }

        this.build = this.build.bind(this)
        this.calcRanges = this.calcRanges.bind(this)
    }
    componentWillReceiveProps(nprops) {
        this.props = nprops

        if (
            Object.keys(this.props.geometries).length !== 0 &&
            this.props.geometries.constructor === Object
        ) {
            let nodeLayers = Object.values(nprops.vpl.nodes).filter(
                f => f.type == 'DATASET'
            )
            let visibleNodes = nodeLayers.filter(l => l.visibility)

            this.setState({ visibleLayers: visibleNodes.length })
            if (
                visibleNodes.length != this.state.visibleLayers &&
                this.state.started
            ) {
                let visibleNames = {}
                for (var key in this.layersNameProperty) {
                    if (
                        Object.values(visibleNodes)
                            .map(i => i.name)
                            .includes(this.layersNameProperty[key])
                    ) {
                        visibleNames[key] = {}
                    }
                }
                // TODO if the visible names are empty, destroy de dimensions.....
                console.log(visibleNames)
                console.log(this.pc.state)
                this.pc
                    .dimensions(visibleNames)
                    .render()
                    .updateAxes()
                if (
                    Object.keys(this.state.previousBrush).length !== 0 &&
                    this.state.previousBrush.constructor === Object
                ) {
                    console.log(this.state.previousBrush)
                    this.pc.brushExtents(this.state.previousBrush)
                }
                // this.pc.brushExtents({'astham rate_Rate':[206.78030303030303, 497.4431818181818]})
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
                var layerIndeces = {}
                const layersNameProperty = {}

                for (let i = 0; i < nprops.layers.length; i++) {
                    layerIndeces[nprops.layers[i].name] = i
                    layersNameProperty[
                        nprops.layers[i].userLayerName +
                            '_' +
                            nprops.layers[i].propertyName
                    ] =
                        nprops.layers[i].name
                    mins[i] = nprops.layers[i].geojson.minMax[0]
                    maxs[i] = nprops.layers[i].geojson.minMax[1]
                }
                this.minVal = mins
                this.maxVal = maxs
                this.layersNameProperty = layersNameProperty
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
                this.layerIndeces = layerIndeces
                this.layersNameProperty = layersNameProperty
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
            .parcoords({ previousBrush: this.state.previousBrush })(
                '#parcoords'
            )
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
        // .interactive()

        pc.on('brushend', this.calcRanges.bind(this))
        this.pc = pc
        this.setState({ pc: pc })
    }

    calcRanges() {
        // review: what is the mean of radoms 'true'?
        this.pc.randoms = true

        const brushSelection = this.pc.brushExtents()
        const layerNames = Object.keys(brushSelection)

        // Calculate range of data
        let maxObjs = {}
        let minObjs = {}

        // This might be restarting all the brushes instead of just adding new ones. What i need is the intersection.....
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

        this.setState({ previousBrush: brushes })

        // Update Layers
        const lowBnd = this.lowBnd
        const highBnd = this.highBnd

        const remap = function(x, i, mins, maxs) {
            return (
                (highBnd - lowBnd) * ((x - mins[i]) / (maxs[i] - mins[i])) +
                lowBnd
            )
        }

        // the range(min and max) of uniforms is 0 - 1
        // for (let name in minObjs) {
        for (let i in this.props.layers) {
            // review: replace minObjs to layerNames.length
            const layer = this.props.layers[i]
            const name = `${layer.userLayerName}_${layer.propertyName}`
            const dictName = layer.name
            // Checks if the layer has been filtered, if it has, changes the min and max values
            if (layerNames.includes(name)) {
                let pixels = this.props.geometries[layer.layerKey]

                // this was misbehaving
                // if (!(minObjs[name] && maxObjs[name])) continue
                pixels.material.uniforms.min.value = remap(
                    minObjs[name],
                    this.layerIndeces[dictName],
                    this.minVal,
                    this.maxVal
                )
                pixels.material.uniforms.max.value = remap(
                    maxObjs[name],
                    this.layerIndeces[dictName],
                    this.minVal,
                    this.maxVal
                )
            }
        }
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
        return (
            <div
                id="parcoords"
                className="parcoords"
                ref={pcoordsRef}
                style={this.style()}
            />
        )
    }
}

const mapStateToProps = state => {
    return {
        mapStarted: state.map.started,
        datasets: state.datasets,
        layers: _.toArray(state.datasets.layers),
        geometries: state.map.geometries,
        vpl: state.vpl,
    }
}

export default connect(mapStateToProps)(PCoords)
