import React from 'react'
import { connect } from 'react-redux'
// import * as Act from '../store/actions'
import { VictoryLine, VictoryGroup, VictoryChart, VictoryStack } from 'victory'
// var science = require('science')

class Charts extends React.Component {
    // TODO.... ADD THE NAME OF THE LAYERS TO THE DICTIONARY INSTEAD OF PASSING AN ARRAYY
    // THIS WAY, WE CAN DISPLAY THE NAME INSTEAD OF THE INDEX....

    constructor(props) {
        super(props)

        this.state = { densityData: [] }
    }

    componentDidMount() {}

    componentWillReceiveProps(newProps) {
        if (
            Object.keys(this.props.geometries).length !== 0 &&
            this.props.geometries.constructor === Object
        ) {
            console.log('LOADING CHARTTTTTT')
        }
        if (!this.state.started) {
            this.setState({ started: true })
            this.props = newProps
            this.setState({ densityData: this.getDensityData() })
        }
    }

    getDensityData() {
        // var margin = { top: 20, right: 30, bottom: 30, left: 40 }

        // var x = d3.scale
        //     .linear()
        //     .domain([30, 110])
        //     .range([margin.left, 960 - margin.right])

        let layersVals = {}
        for (var index in this.props.layers) {
            let currLayer = this.props.layers[index]
            let vals = []
            for (var currPoint in currLayer.geojson.otherdata) {
                vals.push(currLayer.geojson.otherdata[currPoint][3])
            }
            layersVals[index] = vals
            // let density = this.kernelDensityEstimator(
            //     this.kernelEpanechnikov(7),
            //     x.ticks(40)
            // )(vals)
            // console.log(density)
            /* eslint-disable */
            var kde = science.stats.kde().sample(vals)
            console.log(kde.bandwidth(500)(d3.range(0, 100, 1)))
        }

        console.log(layersVals)
        return _.range(7).map(() => {
            return [
                { x: 1, y: _.random(1, 5) },
                { x: 2, y: _.random(1, 10) },
                { x: 3, y: _.random(2, 10) },
                { x: 4, y: _.random(2, 10) },
                { x: 5, y: _.random(2, 15) },
            ]
        })
    }

    kernelDensityEstimator(kernel, X) {
        return function(V) {
            return X.map(function(x) {
                return [
                    x,
                    d3.mean(V, function(v) {
                        return kernel(x - v)
                    }),
                ]
            })
        }
    }

    kernelEpanechnikov(k) {
        return function(v) {
            return Math.abs((v /= k)) <= 1 ? 0.75 * (1 - v * v) / k : 0
        }
    }

    render() {
        // let chartsRef = charts => (this.pcoordsRef = charts)
        // width: '80vw',
        // height: '300px',
        return (
            <VictoryChart width={1010} height={500}>
                <VictoryGroup
                    style={{
                        densityData: { strokeWidth: 6 },
                    }}
                >
                    <VictoryStack>
                        {this.state.densityData.map((data, i) => {
                            return (
                                <VictoryLine
                                    style={{
                                        data: { stroke: 'cyan' },
                                    }}
                                    key={i}
                                    data={data}
                                    interpolation={'natural'}
                                />
                            )
                        })}
                    </VictoryStack>
                </VictoryGroup>
            </VictoryChart>
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
