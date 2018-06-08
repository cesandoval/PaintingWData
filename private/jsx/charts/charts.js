import React from 'react'
// import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import * as Act from '../store/actions'
import {
    VictoryLine,
    VictoryChart,
    VictoryLabel,
    VictoryScatter,
    VictoryBar,
    VictoryBrushContainer,
    BrushHelpers,
} from 'victory'
var kernel = require('kernel-smooth')
// var science = require('science')
console.log(BrushHelpers.onMouseUp)
class Charts extends React.Component {
    constructor(props) {
        super(props)

        this.state = { densityData: [], histogramData: [] }
        // this.handleClick = this.handleClick.bind(this)
    }

    // componentDidMount() {
    //     document.addEventListener('mouseup', this.handleClick)
    // }

    // componentWillUnmount() {
    //     document.removeEventListener('mouseup', this.handleClick)
    // }

    // handleClick(e) {
    //     // console.log(e.target, e.target.key, this.node, typeof this.node)
    //     // console.log(this.getDOMNode().contains(e.target))
    //     // console.log(ReactDOM.findDOMNode(e.target))
    //     // console.log(this.refs['1cf8riveu4'], console.log(e.target.refs))
    //     // console.log(this.node.contains(e.target))
    //     // console.log(ReactDOM.findDOMNode(e.target))
    //     // if (this.node.getDOMNode(e.target)) {
    //     //     console.log('You clicked INSIDE the component.')
    //     // } else {
    //     //     console.log('You clicked OUTSIDE the component.')
    //     // }
    // }
    componentWillReceiveProps(newProps) {
        this.props = newProps
        if (
            Object.keys(this.props.geometries).length !== 0 &&
            this.props.geometries.constructor === Object
        ) {
            let visibleNodeKeys = Object.entries(newProps.nodes)
                .filter(
                    ([, node]) =>
                        node.visibility == true && node.type == 'DATASET'
                )
                .map(([key]) => key)

            this.setState({ visibleNodeKeys: visibleNodeKeys })

            if (!this.state.started) {
                this.setState({ started: true })
                const chartData = this.getDensityData()
                this.setState({
                    densityData: chartData.densityData,
                    histogramData: chartData.histogramData,
                })
            }
        }
    }

    filterCharts(key, domain) {
        console.log('sjsjsjsjsjs')
        Act.nodeUpdate({
            nodeKey: key,
            attr: 'filter',
            value: {
                max: domain.x[1],
                min: domain.x[0],
            },
        })
        Act.setRefreshVoxels({ value: true })
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
        const chartLength = Object.keys(this.state.densityData).length

        let visibleNodeKeys =
            typeof this.state.visibleNodeKeys != 'undefined'
                ? this.state.visibleNodeKeys
                : []
        return (
            <div id="layer-charts">
                {visibleNodeKeys.map(key => {
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
                                containerComponent={
                                    <VictoryBrushContainer
                                        brushDimension="x"
                                        brushDomain={{
                                            x: [
                                                this.props.nodes[key].filter
                                                    .min,
                                                this.props.nodes[key].filter
                                                    .max,
                                            ],
                                        }}
                                        defaultBrushArea="disable"
                                        brushStyle={{
                                            stroke: 'rgba(0, 0, 0, 0.6)',
                                            fill: 'rgba(255, 255, 255, 0.1)',
                                        }}
                                        events={{
                                            onMouseUp: (evt, targetProps) => {
                                                this.filterCharts(
                                                    key,
                                                    targetProps.domain
                                                )
                                                return BrushHelpers.onMouseUp(
                                                    evt,
                                                    targetProps
                                                )
                                            },
                                        }}
                                    />
                                }
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
                                        data={this.state.densityData[key]}
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
