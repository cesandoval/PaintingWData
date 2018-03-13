import React from 'react'
import { connect } from 'react-redux'
import * as Act from '../store/actions'

import { Slider as ASlider } from 'antd'

class Slider extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            value: 0.5,
            nodeKey: this.props.index,
        }

        /*
        this.dp = {
            cX: 0,
            sX: 0,
            held: false,
        }
        // this.newProps = {}
        this.circleHandleMouseDown = this.circleHandleMouseDown.bind(this)
        this.containerMouseMove = this.containerMouseMove.bind(this)
        this.containerMouseUp = this.containerMouseUp.bind(this)
        this.containerMouseDown = this.containerMouseDown.bind(this)
        */
    }

    componentWillReceiveProps(props) {
        const nodeKey = this.state.nodeKey
        this.setState({
            value: props.nodes[nodeKey].opacity,
        })
    }

    /*
    circleHandleMouseDown(event) {
        event.stopPropagation()
        this.dp.held = true
    }

    containerMouseDown(event) {
        event.stopPropagation()
        this.dp.held = true
        this.dp.sX = event.clientX
        let target = $(event.currentTarget)
        let left = target.position().left
        target
            .children('circle')
            .attr(
                'transform',
                'translate(' + (event.clientX - 4 - parseInt(left)) + ',' + '0)'
            )
        this.dp.cX = event.clientX
    }

    containerMouseUp(event) {
        let target = $(event.currentTarget)
        let left = target.position().left
        let opacityValue = event.clientX - 4 - parseInt(left)

        const valDiff = 100 - 0
        const remap = x => valDiff * ((x - 0) / (160 - 0)) + 0

        Act.nodeUpdate({
            nodeKey: this.props.index,
            attr: 'opacity',
            value: parseFloat(remap(opacityValue)) / 100.0,
        })

        event.stopPropagation()
        this.dp.held = false
        this.dp.cX = 0
    }

    containerMouseMove(event) {
        event.stopPropagation()
        if (this.dp.held) {
            let target = $(event.currentTarget)
            let left = target.position().left
            target
                .children('circle')
                .attr(
                    'transform',
                    'translate(' +
                        (event.clientX - 4 - parseInt(left)) +
                        ',' +
                        '0)'
                )
        }
    }
    */
    changeOpacity = value => {
        Act.nodeUpdate({
            nodeKey: this.state.nodeKey,
            attr: 'opacity',
            value,
        })
    }

    render() {
        /*
        return (
            <g
                onMouseDown={this.containerMouseDown}
                onMouseUp={this.containerMouseUp}
                onMouseMove={this.containerMouseMove}
                className={'sliderContainer'}
                transform={`translate(20, 76)`}
            >
                <rect width={160} height={'5px'} />
                <circle
                    onMouseDown={this.circleHandleMouseDown}
                    className={'sliderHandle'}
                    cx={0}
                    cy={3}
                    r={'8'}
                    transform={'translate(85, 0)'}
                />
            </g>
        )
           */
        return (
            <foreignObject x={20} y={65}>
                <div style={{ position: 'fixed', width: '157px' }}>
                    <ASlider
                        min={0}
                        max={1}
                        step={0.05}
                        value={this.state.value}
                        onChange={this.changeOpacity}
                    />
                </div>
            </foreignObject>
        )
    }
}

const mapStateToProps = state => {
    return {
        nodes: state.vpl.nodes,
        // links: state.vpl.links,
        // geometries: state.map.geometries,
    }
}

export default connect(mapStateToProps)(Slider)
