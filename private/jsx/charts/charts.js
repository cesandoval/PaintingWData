import React from 'react'
import { connect } from 'react-redux'
// import * as Act from '../store/actions'
import {
    VictoryLine,
    VictoryChart,
    VictoryLabel,
    VictoryScatter,
    VictoryBar,
} from 'victory'
var kernel = require('kernel-smooth')
// var science = require('science')

class Charts extends React.Component {
    constructor(props) {
        super(props)

        this.state = { densityData: [], histogramData: [] }
    }

    componentWillReceiveProps(newProps) {
        if (!this.state.started) {
            this.setState({ started: true })
            this.props = newProps
            const chartData = this.getDensityData()
            this.setState({
                densityData: chartData.densityData,
                histogramData: chartData.histogramData,
            })
        }
        this.props = newProps
        if (
            Object.keys(this.props.geometries).length !== 0 &&
            this.props.geometries.constructor === Object
        ) {
            let nodeLayers = Object.values(newProps.nodes).filter(
                f => f.type == 'DATASET'
            )
            // let visibleNodes = nodeLayers.filter(l => l.visibility)
            let visibleKeys = nodeLayers.map(function(l) {
                if (l.visibility == true) {
                    console.log(l.visibility, l.nodeKey, 6666)
                    return l.nodeKey
                }
            })
            console.log('updating......')
            console.log(visibleKeys)
        }
    }

    getDensityData() {
        const layersDensity = {}
        const layersHistogram = {}
        for (var index in this.props.layers) {
            let currLayer = this.props.layers[index]

            let vals = []
            for (var currPoint in currLayer.geojson.otherdata) {
                let currVal = currLayer.geojson.otherdata[currPoint][3]
                if (currVal != 0) {
                    vals.push(currVal)
                }
            }

            let density = kernel.density(vals, kernel.fun.gaussian, 0.5)
            let max = math.max(vals)
            let stepSize = max / 512
            let xRange = d3.range(0, max, stepSize)

            var bins = d3.layout.histogram().bins(20)(vals)
            let currHistogramData = []
            for (let bin in bins) {
                currHistogramData.push({ x: bins[bin].x, y: bins[bin].y })
            }

            let currDensityData = []
            for (let i in xRange) {
                currDensityData.push({ x: xRange[i], y: density(xRange[i]) })
            }
            layersDensity[currLayer.layerKey] = currDensityData
            layersHistogram[currLayer.layerKey] = currHistogramData
        }
        return { densityData: layersDensity, histogramData: layersHistogram }
    }

    render() {
        const chartLength = this.state.densityData.length
        console.log('rendering chartssssssss')

        return (
            <div id="layer-charts">
                {Object.entries(this.state.densityData).map(([key, data]) => {
                    return (
                        <span className="layer-chart" key={key}>
                            <VictoryChart
                                style={{
                                    parent: {
                                        height: '300px',
                                        width:
                                            chartLength <= 3
                                                ? `calc(80vw / ${chartLength})`
                                                : 'calc(80vw / 3)',
                                        margin: 'auto',
                                    },
                                }}
                            >
                                <VictoryLabel
                                    textAnchor="start"
                                    x={150}
                                    y={25}
                                    text={
                                        this.props.nodes[key]
                                            ? this.props.nodes[key].name
                                            : ''
                                    }
                                    style={{
                                        fontSize: 14,
                                        fontFamily: 'sans-serif',
                                        fontStyle: 'normal',
                                        fontVariant: 'normal',
                                        fontWeight: 'normal',
                                        fontStretch: 'normal',
                                        lineHeight: 'normal',
                                    }}
                                />
                                {this.props.panelShow == 'Chart:Density' && (
                                    <VictoryLine
                                        style={{
                                            data: {
                                                stroke: this.props.nodes[key]
                                                    ? this.props.nodes[key]
                                                          .color
                                                    : '',
                                            },
                                        }}
                                        key={key}
                                        data={data}
                                        interpolation={'natural'}
                                    />
                                )}

                                {this.props.panelShow == 'Chart:Scatter' && (
                                    <VictoryScatter
                                        style={{
                                            data: {
                                                fill: this.props.nodes[key]
                                                    ? this.props.nodes[key]
                                                          .color
                                                    : 'gray',
                                            },
                                        }}
                                        key={key}
                                        size={7}
                                        data={[
                                            { x: 1, y: 2 },
                                            { x: 2, y: 3 },
                                            { x: 3, y: 5 },
                                            { x: 4, y: 4 },
                                            { x: 5, y: 7 },
                                        ]}
                                    />
                                )}

                                {this.props.panelShow == 'Chart:Histogram' && (
                                    <VictoryBar
                                        style={{
                                            data: {
                                                fill: this.props.nodes[key]
                                                    ? this.props.nodes[key]
                                                          .color
                                                    : 'gray',
                                            },
                                        }}
                                        key={key}
                                        alignment="start"
                                        data={this.state.histogramData[key]}
                                        barRatio={0.999}
                                    />
                                )}
                            </VictoryChart>)
                        </span>
                    )
                })}
                <style jsx>{`
                    #layer-charts {
                        display: flex;
                        overflow-x: scroll;
                        overflow-y: hidden;
                        cursor: ${chartLength <= 3 ? '' : 'ew-resize'};
                    }

                    .layer-chart {
                        flex: 1;
                        display: flex;
                        text-align: center;
                    }
                `}</style>
            </div>
        )
    }
}

export default connect(s => ({
    mapStarted: s.map.started,
    datasets: s.datasets,
    layers: s.datasets.layers,
    geometries: s.map.geometries,
    nodes: s.vpl.nodes,
    pcoordsValue: s.options.pcoordsValue,
    panelShow: s.interactions.panelShow,
}))(Charts)
