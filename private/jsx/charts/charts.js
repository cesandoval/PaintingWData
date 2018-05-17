import React from 'react'
import { connect } from 'react-redux'
// import * as Act from '../store/actions'
import { VictoryLine, VictoryGroup, VictoryChart } from 'victory'

class Charts extends React.Component {
    // TODO.... ADD THE NAME OF THE LAYERS TO THE DICTIONARY INSTEAD OF PASSING AN ARRAYY
    // THIS WAY, WE CAN DISPLAY THE NAME INSTEAD OF THE INDEX....

    constructor(props) {
        super(props)

        this.state = {}
    }

    componentDidMount() {
        console.log(this.props)
    }

    componentWillReceiveProps(newProps) {
        this.props = newProps
    }

    style() {
        // return {
        //     backgroundColor: 'white',
        //     width: '80vw',
        //     height: '300px',
        //     position: 'fixed',
        //     overflow: 'hidden',
        //     bottom: '30px',
        //     right: '0',
        //     zIndex: '10',
        //     opacity: 0.5,
        // }
        //
    }

    render() {
        // let chartsRef = charts => (this.pcoordsRef = charts)
        // width: '80vw',
        // height: '300px',
        return (
            <VictoryChart width={1010} height={500}>
                <VictoryGroup
                    style={{
                        data: { strokeWidth: 6 },
                    }}
                >
                    <VictoryLine
                        style={{
                            data: { stroke: 'cyan' },
                        }}
                        interpolation="natural"
                        data={[
                            { x: 1, y: 2 },
                            { x: 2, y: 3 },
                            { x: 3, y: 5 },
                            { x: 4, y: 4 },
                            { x: 5, y: 7 },
                        ]}
                    />
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
