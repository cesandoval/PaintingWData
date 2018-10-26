import React from 'react'
import * as Act from '../store/actions'
import { connect } from 'react-redux'

import { Popover, Slider } from 'antd'
import _ from 'lodash'
import { VictoryLine, VictoryChart, VictoryTheme } from 'victory'
// import RegressionGraph from './regressionGraph'
import * as NodeType from './nodeTypes'

class Panel extends React.Component {
    constructor(props) {
        super(props)
        this.props = props

        this.state = {
            node: {},
            visible: true,
            color: this.props.color,
        }

        this.changeColor = this.changeColor.bind(this)
        this.toggleVisibility = this.toggleVisibility.bind(this)
        this.soloShow = this.soloShow.bind(this)
        this.deleteNode = this.deleteNode.bind(this)
    }

    componentWillReceiveProps(props) {
        this.props = props
        // console.log('[Panel] componentWillReceiveProps()', this.props.index, props)
        // Get geometry

        const node = this.props.nodes[this.props.index]

        let pixels = this.props.geometries[this.props.index]

        if (pixels) {
            pixels.material.uniforms.show.value = node.visibility // TODO: refactor

            /*
            this.setState({
                visible: pixels.material.uniforms.show.value == 1,
                color:
                    '#' +
                    pixels.material.uniforms.startColor.value.getHexString(),
            })
            */
        }

        this.setState({
            node,
            visible: node.visibility,
            color: node.color,
        })

        /*
        if (pixels.material) {
            this.setState({
                visible: (pixels.material.uniforms.show.value == 1),
                color1: '#' + pixels.material.uniforms.startColor.value.getHexString(),
                color2: '#' + pixels.material.uniforms.endColor.value.getHexString(),
            })
        }
        */
    }

    componentDidMount() {
        // TODO: color1 to color
        Act.nodeUpdate({
            nodeKey: this.props.index,
            attr: 'color',
            value: this.props.color,
        })
    }

    changeColor(e) {
        console.log('changeColor(e)', e.target.value)

        Act.nodeUpdate({
            nodeKey: this.props.index,
            attr: 'color',
            value: e.target.value,
        })

        /* // using two color options for each layer
        if (e.target.name == 'color1'){
            pixels.material.uniforms.startColor.value.set(e.target.value)
        } else {
            pixels.material.uniforms.endColor.value.set(e.target.value)
        }
        */

        // if (window.renderSec) window.renderSec(0.5, 'vpl layer color')
    }

    toggleVisibility() {
        const visibility = !this.state.visible

        /*
        act.updateGeometry(
            this.props.index,
            'Visibility',
            visibility,
            'visible'
        )
        act.vlangUpdateNode({
            nodeKey: this.props.index,
            attr: 'visibility',
            value: visibility,
        })
        */

        Act.nodeUpdate({
            nodeKey: this.props.index,
            attr: 'visibility',
            value: visibility,
        })
    }

    soloShow() {
        console.log('soloShow()', this.props.index)

        /*
        act.vlangUpdateAllNode({
            attr: 'visibility',
            value: false,
        })
        act.vlangUpdateNode({
            nodeKey: this.props.index,
            attr: 'visibility',
            value: true,
        })
        */

        for (let index in this.props.geometries) {
            // Get geometry
            console.log(`index=${index}, solo=${this.props.index}`)

            if (index === this.props.index) {
                console.log(`set ${index} visiable`)
                Act.nodeUpdate({
                    nodeKey: index,
                    attr: 'visibility',
                    value: true,
                })
            } else {
                console.log(`set ${index} invisiable`)
                Act.nodeUpdate({
                    nodeKey: index,
                    attr: 'visibility',
                    value: false,
                })
            }
        }
    }

    deleteNode() {
        this.props.deleteNode()
    }

    changeFilter = ([min, max]) => {
        console.log(`changeFilter(${min}, ${max})`)
        const filter = Object.assign(this.state.node.filter, { min, max })

        Act.nodeUpdate({
            nodeKey: this.props.index,
            attr: 'filter',
            value: filter,
        })

        this.props.updated()
    }

    changeRemapMax = remapMax => {
        console.log(`changeRemapMax(${remapMax})`)
        const remap = { min: 0, max: remapMax }

        Act.nodeUpdate({
            nodeKey: this.props.index,
            attr: 'remap',
            value: remap,
        })

        this.props.updated()
    }

    render() {
        const margin0px = { margin: '0px' }

        const node = this.state.node
        const filterMax = node.filter ? node.filter.max : 1
        const filterMin = node.filter ? node.filter.min : 0
        const filterDefault = [filterMin, filterMax]

        const regularMax = this.props.regularMax
        const dataMax = node.max || regularMax
        const remapMax = node.remap && node.remap.max ? node.remap.max : dataMax

        const type = this.props.type
        const minVal =
            type === 'DATASET' && node.filter ? node.filter.minVal : 0
        const maxVal =
            type === 'DATASET' && node.filter ? node.filter.maxVal : 0

        const filter = (
            <div>
                <span>Filter</span>
                <Slider
                    range
                    defaultValue={filterDefault}
                    min={minVal ? minVal : 0}
                    max={maxVal ? maxVal : 1}
                    step={0.01}
                    onAfterChange={this.changeFilter}
                />
                <hr />
                <br />
                <span>Remap</span>
                <Slider
                    marks={{ [regularMax]: 'Regular', [dataMax]: 'Max' }}
                    defaultValue={remapMax}
                    max={dataMax}
                    step={0.01}
                    onAfterChange={this.changeRemapMax}
                />
            </div>
        )

        // const hasFilter = type !== 'DATASET' && NodeType[type].class !== 'logic'
        const hasFilter = NodeType[type].class !== 'logic'

        const isStatistics = NodeType[type].class === 'statistics'

        const chartLength = _.get(
            this.props,
            `geometries.${this.props.index}.values`,
            []
        ).length

        let data = []
        // TODO delete
        if (isStatistics) {
            console.log(this.props)
            console.log(chartLength)
            const observed_node = _.get(
                this.props,
                `links.inputs.${this.props.index}.Input2`
            )
            const node_values = _.get(
                this.props,
                `geometries.${this.props.index}.values`,
                []
            )
            const observed_values = _.get(
                this.props,
                `geometries.${observed_node}.values`,
                []
            )
            if (node_values.length > 0 && observed_values.length > 0) {
                const data_map = observed_values.reduce(
                    (computedData, value, index) => {
                        computedData[value] = node_values[index]
                        return computedData
                    },
                    {}
                )
                const sorted_keys = [...Object.keys(data_map)].sort()
                data = sorted_keys.reduce((computedData, key) => {
                    computedData.push({ x: key, y: data_map[key] })
                    return computedData
                }, [])
            }
        }

        console.log(data)

        // Why can't this be a component???
        const regressionGraph = (
            <div>
                <VictoryChart theme={VictoryTheme.material}>
                    <VictoryLine
                        interpolation="bundle"
                        style={{
                            data: { stroke: '#c43a31' },
                            parent: {
                                height: '300px',
                                width:
                                    chartLength <= 3
                                        ? `calc((100vw - 280px) / ${chartLength})`
                                        : 'calc((100vw - 280px) / 3)',
                                margin: 'auto',
                            },
                        }}
                        data={data}
                    />
                </VictoryChart>
            </div>
        )

        return (
            <g>
                {/*<foreignObject x={this.props.position.x + 20} y={this.props.position.y + 95} style={{cursor: 'pointer'}}>*/}
                <foreignObject
                    x={20}
                    y={95}
                    width="160"
                    height="28"
                    style={{ cursor: 'pointer' }}
                >
                    <div
                        style={{
                            position: 'fixed',
                            display: 'flex',
                            width: '157px',
                            justifyContent: 'space-around',
                            alignItems: 'center',
                        }}
                    >
                        <input
                            type="color"
                            name="color"
                            value={this.state.color}
                            onChange={this.changeColor}
                        />
                        {/* <input type="color" name="color2" value={this.state.color2} onChange={this.changeColor} /> */}
                        <div onClick={this.toggleVisibility}>
                            {this.state.visible == 1 ? (
                                <img
                                    title="show"
                                    style={margin0px}
                                    src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA0ODkuOTM0IDQ4OS45MzQiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ4OS45MzQgNDg5LjkzNDsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSIxNnB4IiBoZWlnaHQ9IjE2cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik00ODUuOTY3LDIzMy42MTdjLTc0LTkxLTE1My45LTEzNy4yLTIzNy43LTEzNy4yYy0zMy4yLDAtNjYuOCw3LjQtMTAwLDIxLjljLTI2LjEsMTEuNS01MiwyNy40LTc2LjksNDcuMyAgICBjLTQyLjEsMzMuNy02Ni45LDY3LjMtNjcuOSw2OC43Yy00LjgsNi42LTQuNiwxNS42LDAuNSwyMmM3My45LDkxLjEsMTUzLjksMTM3LjIsMjM3LjcsMTM3LjJjMzMuMiwwLDY2LjgtNy40LDEwMC0yMS45ICAgIGMyNi4xLTExLjUsNTItMjcuNCw3Ni45LTQ3LjNjNDIuMS0zMy43LDY2LjktNjcuMyw2Ny45LTY4LjdDNDkxLjI2NywyNDkuMDE3LDQ5MS4wNjcsMjQwLjAxNyw0ODUuOTY3LDIzMy42MTd6IE0zOTUuMjY3LDI5Ni44MTcgICAgYy0zNC44LDI3LjctODkuNiw2MC43LTE1My42LDYwLjdjLTY5LjEsMC0xMzYuNS0zNy45LTIwMC41LTExMi43YzEwLjEtMTEuOSwyOC42LTMxLjgsNTMuNC01MS42YzM0LjgtMjcuNyw4OS42LTYwLjcsMTUzLjYtNjAuNyAgICBjNjkuMSwwLDEzNi41LDM3LjksMjAwLjUsMTEyLjdDNDM4LjU2NywyNTcuMTE3LDQyMC4wNjcsMjc3LjExNywzOTUuMjY3LDI5Ni44MTd6IiBmaWxsPSIjMDAwMDAwIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNMzExLjI2NywyMjcuMDE3Yy05LjksMC0xOCw4LjEtMTgsMThjMCwyNi43LTIxLjcsNDguNC00OC40LDQ4LjRjLTI2LjcsMC00OC40LTIxLjctNDguNC00OC40ICAgIGMwLTI2LjcsMjEuNy00OC40LDQ4LjQtNDguNGM5LjksMCwxOC04LjEsMTgtMThjMC05LjktOC4xLTE4LTE4LTE4Yy00Ni42LDAtODQuNCwzNy45LTg0LjQsODQuNHMzNy44LDg0LjQsODQuNCw4NC40ICAgIGM0Ni42LDAsODQuNC0zNy45LDg0LjQtODQuNEMzMjkuMjY3LDIzNS4xMTcsMzIxLjE2NywyMjcuMDE3LDMxMS4yNjcsMjI3LjAxN3oiIGZpbGw9IiMwMDAwMDAiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K"
                                />
                            ) : (
                                <img
                                    title="hide"
                                    style={margin0px}
                                    src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA0OTAuMDM0IDQ5MC4wMzQiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ5MC4wMzQgNDkwLjAzNDsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSIxNnB4IiBoZWlnaHQ9IjE2cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik00MzUuNjY3LDU0LjMxMWMtNy03LjEtMTguNC03LTI1LjUsMGwtNjQsNjRjLTc5LjMtMzYtMTYzLjktMjcuMi0yNDQuNiwyNS41Yy02MC4xLDM5LjItOTYuNiw4OC41LTk4LjEsOTAuNiAgICBjLTQuOCw2LjYtNC42LDE1LjYsMC41LDIyYzM0LjIsNDIsNzAsNzQuNywxMDYuNiw5Ny41bC01Ni4zLDU2LjNjLTcsNy03LDE4LjQsMCwyNS41YzMuNSwzLjUsOC4xLDUuMywxMi43LDUuM3M5LjItMS44LDEyLjctNS4zICAgIGwzNTYtMzU1LjlDNDQyLjY2Nyw3Mi44MTEsNDQyLjY2Nyw2MS40MTEsNDM1LjY2Nyw1NC4zMTF6IE0yMDAuNDY3LDI2NC4wMTFjLTIuNi01LjktMy45LTEyLjMtMy45LTE5YzAtMTIuOSw1LTI1LjEsMTQuMi0zNC4zICAgIGMxNC40LTE0LjQsMzUuNy0xNy44LDUzLjMtMTAuM0wyMDAuNDY3LDI2NC4wMTF6IE0yOTAuNjY3LDE3My45MTFjLTMyLjctMjEtNzYuOC0xNy4yLTEwNS4zLDExLjNjLTE2LDE2LTI0LjcsMzcuMi0yNC43LDU5LjcgICAgYzAsMTYuNCw0LjcsMzIuMSwxMy40LDQ1LjZsLTM3LjEsMzcuMWMtMzIuNS0xOC44LTY0LjUtNDYuNi05NS42LTgyLjljMTMuMy0xNS42LDQxLjQtNDUuNyw3OS45LTcwLjggICAgYzY2LjYtNDMuNCwxMzIuOS01Mi44LDE5Ny41LTI4LjFMMjkwLjY2NywxNzMuOTExeiIgZmlsbD0iIzAwMDAwMCIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTQ4Ni4wNjcsMjMzLjYxMWMtMjQuNy0zMC40LTUwLjMtNTYtNzYuMy03Ni4zYy03LjktNi4xLTE5LjItNC43LTI1LjQsMy4xYy02LjEsNy44LTQuNywxOS4xLDMuMSwyNS4zICAgIGMyMC42LDE2LjEsNDEuMiwzNi4xLDYxLjIsNTkuNWMtMTEuOCwxMy44LTM0LjgsMzguNi02Niw2MS4zYy02MC4xLDQzLjctMTIwLjgsNTkuNS0xODAuMyw0Ni45Yy05LjctMi4xLTE5LjMsNC4yLTIxLjMsMTMuOSAgICBjLTIuMSw5LjcsNC4yLDE5LjMsMTMuOSwyMS4zYzE1LjUsMy4zLDMxLjEsNC45LDQ2LjgsNC45YzIzLjYsMCw0Ny40LTMuNyw3MS4xLTExLjFjMzEuMS05LjcsNjItMjUuNyw5MS45LTQ3LjUgICAgYzUwLjQtMzYuOSw4MC41LTc3LjYsODEuOC03OS4zQzQ5MS4zNjcsMjQ5LjAxMSw0OTEuMTY3LDI0MC4wMTEsNDg2LjA2NywyMzMuNjExeiIgZmlsbD0iIzAwMDAwMCIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo="
                                />
                            )}
                        </div>
                        <img
                            onClick={this.soloShow}
                            title="solo"
                            style={margin0px}
                            src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA0OTAgNDkwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0OTAgNDkwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCI+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTI2Mi43LDc2LjZWMThjMC4xLTkuOS03LjktMTgtMTcuOS0xOGMtOS45LDAtMTgsOC4xLTE4LDE4djQzLjRjLTQ4LjQsNC43LTkzLDI4LjMtMTI0LjMsNjYuMmMtNi4zLDcuNy01LjIsMTksMi40LDI1LjMgICAgYzMuNCwyLjgsNy40LDQuMSwxMS40LDQuMWM1LjIsMCwxMC4zLTIuMiwxMy45LTYuNWMyNC41LTI5LjcsNTguOS00OC40LDk2LjUtNTN2NDEuNGMwLDkuOSw4LjEsMTgsMTgsMThzMTgtOC4xLDE4LTE4VjgwLjIgICAgYzAuMS0wLjYsMC4xLTEuMiwwLjEtMS44QzI2Mi44LDc3LjgsMjYyLjgsNzcuMiwyNjIuNyw3Ni42eiIgZmlsbD0iIzAwMDAwMCIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTM4NC45LDMzNy4xYy03LjctNi4zLTE5LTUuMi0yNS4zLDIuNGMtMjQuNSwyOS43LTU5LDQ4LjQtOTYuNiw1M3YtNDEuN2MwLTkuOS04LjEtMTgtMTgtMThjLTkuOSwwLTE4LDguMS0xOCwxOFY0NzIgICAgYy0wLjEsOS45LDgsMTgsMTcuOSwxOGM5LjksMCwxOC04LjEsMTgtMTh2LTQzLjNjNDguNC00LjcsOTMtMjguMywxMjQuNC02Ni4zQzM5My42LDM1NC43LDM5Mi41LDM0My40LDM4NC45LDMzNy4xeiIgZmlsbD0iIzAwMDAwMCIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTE1MC41LDM1OS43Yy0yOS43LTI0LjUtNDguNS01OS4xLTUzLTk2LjhoNDEuNGM5LjksMCwxOC04LjEsMTgtMThjMC05LjktOC4xLTE4LTE4LTE4SDE4LjFjLTkuOSwwLTE4LDguMS0xOCwxOCAgICBjMCw5LjksOCwxOCwxOCwxOGg0My4yYzQuNyw0OC41LDI4LjMsOTMuMiw2Ni4zLDEyNC42YzMuNCwyLjgsNy40LDQuMSwxMS40LDQuMWM1LjIsMCwxMC4zLTIuMiwxMy45LTYuNiAgICBDMTU5LjIsMzc3LjMsMTU4LjEsMzY2LDE1MC41LDM1OS43eiIgZmlsbD0iIzAwMDAwMCIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTQ3MS45LDIyNi45aC00My40Yy00LjctNDguNS0yOC40LTkzLjItNjYuNS0xMjQuNWMtNy43LTYuMy0xOS01LjItMjUuMywyLjVjLTYuMyw3LjctNS4yLDE5LDIuNSwyNS4zICAgIGMyOS44LDI0LjUsNDguNiw1OSw1My4yLDk2LjdoLTQxLjVjLTkuOSwwLTE4LDguMS0xOCwxOGMwLDkuOSw4LjEsMTgsMTgsMThoNTguN2MwLjYsMC4xLDEuMiwwLjEsMS44LDAuMWMwLjYsMCwxLjMsMCwxLjktMC4xICAgIGg1OC42YzkuOSwwLDE4LTguMSwxOC0xOEM0ODkuOSwyMzUsNDgxLjgsMjI2LjksNDcxLjksMjI2Ljl6IiBmaWxsPSIjMDAwMDAwIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSIyNDUiIGN5PSIyNDUiIHI9IjE5LjkiIGZpbGw9IiMwMDAwMDAiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K"
                        />
                        {hasFilter && (
                            <Popover
                                placement="bottom"
                                title="Transformations"
                                content={filter}
                                trigger="click"
                            >
                                <img
                                    // onClick={this.Show}
                                    title="filter"
                                    style={margin0px}
                                    src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA0ODguOCA0ODguOCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDg4LjggNDg4Ljg7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4Ij4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNMzk2LjYsMGMtMzYuMywwLTY2LjksMjUuMy03NSw1OS4xSDMzYy05LjksMC0xOCw4LjEtMTgsMThjMCw5LjksOC4xLDE4LDE4LDE4aDI4OC42YzguMSwzMy45LDM4LjcsNTkuMSw3NSw1OS4xICAgIGM5LjksMCwxOC04LjEsMTgtMThjMC05LjktOC4xLTE4LTE4LTE4Yy0yMi43LDAtNDEuMS0xOC41LTQxLjEtNDEuMWMwLTIyLjcsMTguNS00MS4xLDQxLjEtNDEuMWMyMi42LDAsNDEuMSwxOC41LDQxLjEsNDEuMSAgICBjMCw5LjksOC4xLDE4LDE4LDE4YzkuOSwwLDE4LTguMSwxOC0xOEM0NzMuNywzNC42LDQzOS4xLDAsMzk2LjYsMHoiIGZpbGw9IiMwMDAwMDAiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik00NTUuOCwyMjUuOEgxNjcuMmMtOC4xLTMzLjktMzguNy01OS4xLTc1LTU5LjFjLTQyLjUsMC03Ny4xLDM0LjYtNzcuMSw3Ny4xYy0wLjEsNDIuNSwzNC41LDc3LjEsNzcuMSw3Ny4xICAgIGM5LjksMCwxOC04LjEsMTgtMThjMC05LjktOC4xLTE4LTE4LTE4Yy0yMi43LDAtNDEuMS0xOC41LTQxLjEtNDEuMWMwLTIyLjcsMTguNS00MS4xLDQxLjEtNDEuMWMyMi43LDAsNDEuMSwxOC41LDQxLjEsNDEuMSAgICBjMCw5LjksOC4xLDE4LDE4LDE4aDMwNC41YzkuOSwwLDE4LTguMSwxOC0xOEM0NzMuOCwyMzMuOSw0NjUuNywyMjUuOCw0NTUuOCwyMjUuOHoiIGZpbGw9IiMwMDAwMDAiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0zOTYuNiwzMzQuNmMtMzYuMywwLTY2LjksMjUuMy03NSw1OS4xSDMzYy05LjksMC0xOCw4LjEtMTgsMThjMCw5LjksOC4xLDE4LDE4LDE4aDI4OC42YzguMSwzMy45LDM4LjcsNTkuMSw3NSw1OS4xICAgIGM5LjksMCwxOC04LjEsMTgtMThjMC05LjktOC4xLTE4LTE4LTE4Yy0yMi43LDAtNDEuMS0xOC41LTQxLjEtNDEuMWMwLTIyLjcsMTguNS00MS4xLDQxLjEtNDEuMWMyMi42LDAsNDEuMSwxOC41LDQxLjEsNDEuMSAgICBjMCw5LjksOC4xLDE4LDE4LDE4YzkuOSwwLDE4LTguMSwxOC0xOEM0NzMuNywzNjkuMiw0MzkuMSwzMzQuNiwzOTYuNiwzMzQuNnoiIGZpbGw9IiMwMDAwMDAiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K"
                                />
                            </Popover>
                        )}
                        {isStatistics && (
                            <Popover
                                placement="bottom"
                                title="Inspect"
                                content={filter}
                                trigger="click"
                            >
                                <img
                                    title="inspect"
                                    style={margin0px}
                                    src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBoZWlnaHQ9IjE2cHgiIHZpZXdCb3g9IjAgLTIxIDUxMiA1MTIiIHdpZHRoPSIxNnB4Ij48ZyBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Im02NS4yODEyNSAxNTkuNTM1MTU2aDg0LjI0NjA5NGM1LjUyNzM0NCAwIDEwLjAwNzgxMi00LjQ4MDQ2OCAxMC4wMDc4MTItMTAuMDA3ODEydi04NC4yNDYwOTRjMC01LjUyMzQzOC00LjQ4MDQ2OC0xMC4wMDM5MDYtMTAuMDA3ODEyLTEwLjAwMzkwNmgtODQuMjQ2MDk0Yy01LjUyMzQzOCAwLTEwLjAwMzkwNiA0LjQ4MDQ2OC0xMC4wMDM5MDYgMTAuMDAzOTA2djg0LjI0NjA5NGMtLjAwMzkwNiA1LjUyNzM0NCA0LjQ3NjU2MiAxMC4wMDc4MTIgMTAuMDAzOTA2IDEwLjAwNzgxMnptMTAuMDA3ODEyLTg0LjI0NjA5NGg2NC4yMzA0Njl2NjQuMjMwNDY5aC02NC4yMzA0Njl6bTAgMCIgZmlsbD0iIzAwMDAwMCIvPjxwYXRoIGQ9Im02NS4yODEyNSAyMDEuNjU2MjVoMTgwLjYyNWM1LjUyNzM0NCAwIDEwLjAwMzkwNi00LjQ4MDQ2OSAxMC4wMDM5MDYtMTAuMDAzOTA2IDAtNS41MjczNDQtNC40NzY1NjItMTAuMDA3ODEzLTEwLjAwMzkwNi0xMC4wMDc4MTNoLTE4MC42MjVjLTUuNTIzNDM4IDAtMTAuMDAzOTA2IDQuNDgwNDY5LTEwLjAwMzkwNiAxMC4wMDc4MTMtLjAwMzkwNiA1LjUyMzQzNyA0LjQ3NjU2MiAxMC4wMDM5MDYgMTAuMDAzOTA2IDEwLjAwMzkwNnptMCAwIiBmaWxsPSIjMDAwMDAwIi8+PHBhdGggZD0ibTY1LjI4MTI1IDI0My43NzczNDRoMTcxLjE4MzU5NGM1LjUyNzM0NCAwIDEwLjAwNzgxMi00LjQ3NjU2MyAxMC4wMDc4MTItMTAuMDAzOTA2IDAtNS41MjczNDQtNC40ODA0NjgtMTAuMDA3ODEzLTEwLjAwNzgxMi0xMC4wMDc4MTNoLTE3MS4xODM1OTRjLTUuNTIzNDM4IDAtMTAuMDAzOTA2IDQuNDgwNDY5LTEwLjAwMzkwNiAxMC4wMDc4MTMtLjAwMzkwNiA1LjUyNzM0MyA0LjQ3NjU2MiAxMC4wMDM5MDYgMTAuMDAzOTA2IDEwLjAwMzkwNnptMCAwIiBmaWxsPSIjMDAwMDAwIi8+PHBhdGggZD0ibTE4Ny45MTAxNTYgMTU5LjUzNTE1Nmg3Ny45ODA0NjljNS41MjM0MzcgMCAxMC4wMDM5MDYtNC40ODA0NjggMTAuMDAzOTA2LTEwLjAwNzgxMiAwLTUuNTIzNDM4LTQuNDc2NTYyLTEwLjAwMzkwNi0xMC4wMDM5MDYtMTAuMDAzOTA2aC03Ny45ODA0NjljLTUuNTI3MzQ0IDAtMTAuMDA3ODEyIDQuNDgwNDY4LTEwLjAwNzgxMiAxMC4wMDM5MDYgMCA1LjUyNzM0NCA0LjQ4MDQ2OCAxMC4wMDc4MTIgMTAuMDA3ODEyIDEwLjAwNzgxMnptMCAwIiBmaWxsPSIjMDAwMDAwIi8+PHBhdGggZD0ibTE4Ny45MTAxNTYgNzUuMjg5MDYyaDkyLjk0NTMxM2M1LjUyNzM0MyAwIDEwLjAwNzgxMi00LjQ4MDQ2OCAxMC4wMDc4MTItMTAuMDA3ODEyIDAtNS41MjM0MzgtNC40ODA0NjktMTAuMDAzOTA2LTEwLjAwNzgxMi0xMC4wMDM5MDZoLTkyLjk0NTMxM2MtNS41MjczNDQgMC0xMC4wMDc4MTIgNC40ODA0NjgtMTAuMDA3ODEyIDEwLjAwMzkwNiAwIDUuNTI3MzQ0IDQuNDgwNDY4IDEwLjAwNzgxMiAxMC4wMDc4MTIgMTAuMDA3ODEyem0wIDAiIGZpbGw9IiMwMDAwMDAiLz48cGF0aCBkPSJtMTg3LjkxMDE1NiAxMTcuNDEwMTU2aDkyLjk0NTMxM2M1LjUyNzM0MyAwIDEwLjAwNzgxMi00LjQ4MDQ2OCAxMC4wMDc4MTItMTAuMDAzOTA2IDAtNS41MjczNDQtNC40ODA0NjktMTAuMDA3ODEyLTEwLjAwNzgxMi0xMC4wMDc4MTJoLTkyLjk0NTMxM2MtNS41MjczNDQgMC0xMC4wMDc4MTIgNC40ODA0NjgtMTAuMDA3ODEyIDEwLjAwNzgxMiAwIDUuNTIzNDM4IDQuNDgwNDY4IDEwLjAwMzkwNiAxMC4wMDc4MTIgMTAuMDAzOTA2em0wIDAiIGZpbGw9IiMwMDAwMDAiLz48cGF0aCBkPSJtMjgwLjg1NTQ2OSAzOTIuMjg1MTU2aC0yMTUuNTc0MjE5Yy01LjUyMzQzOCAwLTEwLjAwMzkwNiA0LjQ4MDQ2OS0xMC4wMDM5MDYgMTAuMDA3ODEzIDAgNS41MjM0MzcgNC40ODA0NjggMTAuMDAzOTA2IDEwLjAwMzkwNiAxMC4wMDM5MDZoMjE1LjU3NDIxOWM1LjUyNzM0MyAwIDEwLjAwNzgxMi00LjQ4MDQ2OSAxMC4wMDc4MTItMTAuMDAzOTA2IDAtNS41MjczNDQtNC40ODA0NjktMTAuMDA3ODEzLTEwLjAwNzgxMi0xMC4wMDc4MTN6bTAgMCIgZmlsbD0iIzAwMDAwMCIvPjxwYXRoIGQ9Im01NS4yNzM0MzggMzYwLjE2Nzk2OWMwIDUuNTI3MzQzIDQuNDgwNDY4IDEwLjAwNzgxMiAxMC4wMDc4MTIgMTAuMDA3ODEyaDIxNS41NzQyMTljNS41MjczNDMgMCAxMC4wMDM5MDYtNC40ODA0NjkgMTAuMDAzOTA2LTEwLjAwNzgxMiAwLTUuNTIzNDM4LTQuNDc2NTYzLTEwLjAwMzkwNy0xMC4wMDM5MDYtMTAuMDAzOTA3aC0yMTUuNTc0MjE5Yy01LjUyNzM0NCAwLTEwLjAwNzgxMiA0LjQ4MDQ2OS0xMC4wMDc4MTIgMTAuMDAzOTA3em0wIDAiIGZpbGw9IiMwMDAwMDAiLz48cGF0aCBkPSJtNjUuMjgxMjUgMzI4LjA1NDY4OGgxOTguNDgwNDY5YzUuNTI3MzQzIDAgMTAuMDA3ODEyLTQuNDgwNDY5IDEwLjAwNzgxMi0xMC4wMDc4MTMgMC01LjUyMzQzNy00LjQ4MDQ2OS0xMC4wMDM5MDYtMTAuMDA3ODEyLTEwLjAwMzkwNmgtMTk4LjQ4MDQ2OWMtNS41MjM0MzggMC0xMC4wMDM5MDYgNC40ODA0NjktMTAuMDAzOTA2IDEwLjAwMzkwNi0uMDAzOTA2IDUuNTI3MzQ0IDQuNDc2NTYyIDEwLjAwNzgxMyAxMC4wMDM5MDYgMTAuMDA3ODEzem0wIDAiIGZpbGw9IiMwMDAwMDAiLz48cGF0aCBkPSJtNjUuMjgxMjUgMjg1LjkwMjM0NGgxNzguMjQyMTg4YzUuNTI3MzQzIDAgMTAuMDA3ODEyLTQuNDgwNDY5IDEwLjAwNzgxMi0xMC4wMDc4MTMgMC01LjUyMzQzNy00LjQ4MDQ2OS0xMC4wMDM5MDYtMTAuMDA3ODEyLTEwLjAwMzkwNmgtMTc4LjI0MjE4OGMtNS41MjM0MzggMC0xMC4wMDM5MDYgNC40ODA0NjktMTAuMDAzOTA2IDEwLjAwMzkwNiAwIDUuNTI3MzQ0IDQuNDc2NTYyIDEwLjAwNzgxMyAxMC4wMDM5MDYgMTAuMDA3ODEzem0wIDAiIGZpbGw9IiMwMDAwMDAiLz48cGF0aCBkPSJtNTEyIDIzNi43MDcwMzFjMC0zMi40Mzc1LTEyLjYzMjgxMi02Mi45Mjk2ODctMzUuNTY2NDA2LTg1Ljg2MzI4MS0yMi45MzM1OTQtMjIuOTM3NS01My40MjU3ODItMzUuNTY2NDA2LTg1Ljg2MzI4Mi0zNS41NjY0MDYtMTcuNTM1MTU2IDAtMzQuNTAzOTA2IDMuNjk5MjE4LTUwLjAxNTYyNCAxMC43MTQ4NDR2LTExNS45ODQzNzZjMC01LjUyNzM0My00LjQ4MDQ2OS0xMC4wMDc4MTItMTAuMDA3ODEzLTEwLjAwNzgxMmgtMzIwLjUzOTA2M2MtNS41MjczNDMgMC0xMC4wMDc4MTIgNC40ODA0NjktMTAuMDA3ODEyIDEwLjAwNzgxMnY0NDkuNTQyOTY5YzAgNS41MjczNDQgNC40ODA0NjkgMTAuMDA3ODEzIDEwLjAwNzgxMiAxMC4wMDc4MTNoMzIwLjUzOTA2M2M1LjUyNzM0NCAwIDEwLjAwNzgxMy00LjQ4MDQ2OSAxMC4wMDc4MTMtMTAuMDA3ODEzdi0xMTIuMTM2NzE5YzEyLjU0Mjk2OCA1LjY3NTc4MiAyNi4wNDI5NjggOS4xNzE4NzYgNDAuMDIzNDM3IDEwLjMwNDY4OHYxMDEuODMyMDMxYzAgNS41MjczNDQgNC40ODA0NjkgMTAuMDA3ODEzIDEwLjAwNzgxMyAxMC4wMDc4MTMgNS41MjM0MzcgMCAxMC4wMDM5MDYtNC40ODA0NjkgMTAuMDAzOTA2LTEwLjAwNzgxM3YtMTAxLjgzMjAzMWMyOC42ODM1OTQtMi4zMjAzMTIgNTUuMzE2NDA2LTE0LjU4OTg0NCA3NS44NDM3NS0zNS4xNDg0MzggMjIuOTM3NS0yMi45MzM1OTMgMzUuNTY2NDA2LTUzLjQyNTc4MSAzNS41NjY0MDYtODUuODYzMjgxem0tMTIxLjQxNDA2MiAxMDEuNDEwMTU3Yy0xOS41NTA3ODIgMC0zOC4yNTM5MDctNS40ODgyODItNTQuMzQzNzUtMTUuNzM0Mzc2LS4xMDU0NjktLjA3NDIxOC0uMjE0ODQ0LS4xNDA2MjQtLjMyNDIxOS0uMjEwOTM3LTYuMDkzNzUtMy45MTQwNjMtMTEuODE2NDA3LTguNTA3ODEzLTE3LjA1ODU5NC0xMy43NS0xMC4yNzM0MzctMTAuMjczNDM3LTE4LjA3MDMxMy0yMi4zNDc2NTYtMjMuMTY3OTY5LTM1Ljg4MjgxMy0xLjk0OTIxOC01LjE3MTg3NC03LjcyMjY1Ni03Ljc4NTE1Ni0xMi44OTA2MjUtNS44MzU5MzctNS4xNzE4NzUgMS45NDkyMTktNy43ODUxNTYgNy43MTg3NS01LjgzNTkzNyAxMi44OTA2MjUgNi4xMDkzNzUgMTYuMjE4NzUgMTUuNDQxNDA2IDMwLjY3OTY4OCAyNy43NDIxODcgNDIuOTc2NTYyIDQuOTQ1MzEzIDQuOTQ1MzEzIDEwLjI0MjE4OCA5LjQxMDE1NyAxNS44MzIwMzEgMTMuMzcxMDk0djExMy42MDU0NjloLTMwMC41MjczNDN2LTQyOS41MzUxNTZoMzAwLjUzMTI1djExNy40NjA5MzdjLTUuNTkzNzUgMy45NjA5MzgtMTAuODkwNjI1IDguNDI1NzgyLTE1LjgzNTkzOCAxMy4zNzEwOTQtMTIuMzAwNzgxIDEyLjI5Njg3NS0yMS42MzI4MTIgMjYuNzU3ODEyLTI3Ljc0MjE4NyA0Mi45NzY1NjItMS45NDkyMTkgNS4xNzE4NzYuNjY0MDYyIDEwLjk0NTMxMyA1LjgzNTkzNyAxMi44OTA2MjYgNS4xNzU3ODEgMS45NDkyMTggMTAuOTQxNDA3LS42NjQwNjMgMTIuODkwNjI1LTUuODM1OTM4IDUuMTAxNTYzLTEzLjUzNTE1NiAxMi44OTQ1MzItMjUuNjA5Mzc1IDIzLjE2Nzk2OS0zNS44Nzg5MDYgMzkuNTQyOTY5LTM5LjU0Njg3NSAxMDMuODgyODEzLTM5LjU0Mjk2OSAxNDMuNDI1NzgxIDAgMTkuMTU2MjUgMTkuMTUyMzQ0IDI5LjcwMzEyNSA0NC42MjEwOTQgMjkuNzAzMTI1IDcxLjcxMDkzNyAwIDI3LjA4OTg0NC0xMC41NDY4NzUgNTIuNTU4NTk0LTI5LjcwNzAzMSA3MS43MTg3NS0xOS4xMjEwOTQgMTkuMTQ0NTMxLTQ0LjU4NTkzOCAyOS42OTE0MDctNzEuNjk1MzEyIDI5LjY5MTQwN3ptMCAwIiBmaWxsPSIjMDAwMDAwIi8+PHBhdGggZD0ibTI3OS4xNTYyNSAyMjYuNzE0ODQ0Yy01LjUgMC0xMC4wMDc4MTIgNC40ODA0NjgtMTAuMDA3ODEyIDEwLjAwNzgxMiAwIDUuNDk2MDk0IDQuNTA3ODEyIDkuOTc2NTYzIDEwLjAwNzgxMiA5Ljk3NjU2M3MxMC4wMDM5MDYtNC40ODA0NjkgMTAuMDAzOTA2LTkuOTc2NTYzYzAtNS41MzEyNS00LjUwMzkwNi0xMC4wMDc4MTItMTAuMDAzOTA2LTEwLjAwNzgxMnptMCAwIiBmaWxsPSIjMDAwMDAwIi8+PC9nPjwvc3ZnPgo="
                                />
                            </Popover>
                        )}
                        {isStatistics && (
                            <Popover
                                placement="bottom"
                                title="Graph"
                                content={regressionGraph}
                                trigger="click"
                            >
                                <img
                                    title="graph"
                                    style={margin0px}
                                    src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUwMi42NjQgNTAyLjY2NCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTAyLjY2NCA1MDIuNjY0OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCI+CjxnPgoJPGc+CgkJPGc+CgkJCTxwYXRoIGQ9Ik00NzIuMDc3LDI1LjQzMkgzMC42MDlDMTMuNzYyLDI1LjQzMiwwLDM5LjIxNiwwLDU2LjAxOXYzMTcuNDE0ICAgICBjMCwxNi43ODIsMTMuNzYyLDMwLjU4NywzMC42MDksMzAuNTg3aDQ0MS40NjhjMTYuODI1LDAsMzAuNTg3LTEzLjgwNSwzMC41ODctMzAuNTg3VjU2LjAxOSAgICAgQzUwMi42NjQsMzkuMjE2LDQ4OC45MDIsMjUuNDMyLDQ3Mi4wNzcsMjUuNDMyeiBNNDY0LjM3NiwzNTAuOTM1SDM4LjI4OFY2OC4zMzZoNDI2LjA4OFYzNTAuOTM1eiIgZmlsbD0iIzAwMDAwMCIvPgoJCQk8cG9seWdvbiBwb2ludHM9IjE5NC42OTgsNDE4LjUzOCAxMzYuOTMxLDQ3Ny4yMzIgMzY2LjU3NCw0NzcuMjMyIDMwOC44MDcsNDE4LjUzOCAgICAiIGZpbGw9IiMwMDAwMDAiLz4KCQkJPHBhdGggZD0iTTEwMy4zNDYsMjk0LjI2OWMxMS4yODIsMCwyMC40NzEtOS4xNjgsMjAuNDcxLTIwLjQ0OWMwLTIuMDQ5LTAuNjA0LTMuOTA0LTEuMTY1LTUuNzgxICAgICBjMjYuMTY1LTIxLjA5Niw3Mi4zOTItNTguMjg0LDkzLjQ2Ni03NC41MjdjMy4zMjIsMi4zNTEsNy4xODMsNC4wMzQsMTEuNTYyLDQuMDM0YzMuNjQ1LDAsNi44ODEtMS4yMDgsOS44MzYtMi44NjkgICAgIGMxMy41NDYsMTEuNTE5LDM2LjU4NCwzMS4xMDUsNTIuOTM1LDQ1LjAxOGMtMC4yMTYsMS4xODYtMC42OSwyLjI0My0wLjY5LDMuNDk0YzAsMTEuMzAzLDkuMTg5LDIwLjQ3MSwyMC40OTIsMjAuNDcxICAgICBzMjAuNDkyLTkuMTY4LDIwLjQ5Mi0yMC40NzFjMC0yLjAwNi0wLjYwNC0zLjg0LTEuMTQzLTUuNjczbDUyLjkzNS00Ny44MDFjMi44NDcsMS40ODgsNS45MSwyLjU0NSw5LjM2MiwyLjU0NSAgICAgYzExLjMwMywwLDIwLjQ3MS05LjE2OCwyMC40NzEtMjAuNDcxcy05LjE2OC0yMC40NzEtMjAuNDcxLTIwLjQ3MXMtMjAuNDQ5LDkuMTY4LTIwLjQ0OSwyMC40OTJjMCwyLjY5NiwwLjU4Miw1LjI2MywxLjUzMSw3LjYxNCAgICAgYy0xNC43OTgsMTMuMzUyLTM3LjYxOSwzMy45NzQtNTEuODU2LDQ2LjgzYy0zLjE3MS0yLjA0OS02Ljc1Mi0zLjU1OS0xMC44NS0zLjU1OWMtNC44MzIsMC05LjA2LDEuOTItMTIuNTU0LDQuNzAyICAgICBjLTEzLjUyNS0xMS40OTctMzUuMzk4LTMwLjA5MS01MC45NS00My4zMTRjMC44Mi0yLjIsMS40MDItNC41MDgsMS40MDItNy4wMWMwLTExLjMwMy05LjE2OC0yMC40NzEtMjAuNDcxLTIwLjQ3MSAgICAgcy0yMC40NzEsOS4xNjgtMjAuNDcxLDIwLjQ3MWMwLDIuNTAyLDAuNjA0LDQuODMyLDEuNDI0LDcuMDMybC05My45NjIsNzMuMTAzYy0zLjI3OS0yLjI0My03LjA1NC0zLjg4My0xMS4zMjUtMy44ODMgICAgIGMtMTEuMzAzLDAtMjAuNDcxLDkuMTY4LTIwLjQ3MSwyMC40NzFDODIuODc1LDI4NS4xMDEsOTIuMDQzLDI5NC4yNjksMTAzLjM0NiwyOTQuMjY5eiIgZmlsbD0iIzAwMDAwMCIvPgoJCTwvZz4KCTwvZz4KCTxnPgoJPC9nPgoJPGc+Cgk8L2c+Cgk8Zz4KCTwvZz4KCTxnPgoJPC9nPgoJPGc+Cgk8L2c+Cgk8Zz4KCTwvZz4KCTxnPgoJPC9nPgoJPGc+Cgk8L2c+Cgk8Zz4KCTwvZz4KCTxnPgoJPC9nPgoJPGc+Cgk8L2c+Cgk8Zz4KCTwvZz4KCTxnPgoJPC9nPgoJPGc+Cgk8L2c+Cgk8Zz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K"
                                />
                            </Popover>
                        )}
                        {this.props.type !== 'DATASET' && (
                            <img
                                onClick={this.deleteNode}
                                title="delete"
                                style={margin0px}
                                src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA0ODcuNiA0ODcuNiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDg3LjYgNDg3LjY7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4Ij4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNDU0LjUsNzUuM0gzNTIuMXYtMjRjMC0yOC4zLTIzLTUxLjMtNTEuMy01MS4zaC0xMTRjLTI4LjMsMC01MS4zLDIzLTUxLjMsNTEuM3YyMy45SDMzLjFjLTkuOSwwLTE4LDguMS0xOCwxOCAgICBjMCw5LjksOC4xLDE4LDE4LDE4aDI3LjJWNDI1YzAsMzQuNSwyOC4xLDYyLjYsNjIuNiw2Mi42aDI0MS45YzM0LjUsMCw2Mi42LTI4LjEsNjIuNi02Mi42VjE2OC41YzAtOS45LTguMS0xOC0xOC0xOCAgICBjLTkuOSwwLTE4LDguMS0xOCwxOFY0MjVjMCwxNC42LTExLjksMjYuNi0yNi42LDI2LjZoLTI0MmMtMTQuNiwwLTI2LjYtMTEuOS0yNi42LTI2LjZWMTExLjNoMzU4LjNjMTAsMCwxOC04LjEsMTgtMTggICAgUzQ2NC40LDc1LjMsNDU0LjUsNzUuM3ogTTMxNi4xLDc1LjJIMTcxLjVWNTEuM2MwLTguNCw2LjktMTUuMywxNS4zLTE1LjNoMTE0YzguNSwwLDE1LjMsNi45LDE1LjMsMTUuM1Y3NS4yeiIgZmlsbD0iIzAwMDAwMCIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTE2Ny4yLDE1MC41Yy05LjksMC0xOCw4LjEtMTgsMTh2NDEuNGMwLDkuOSw4LjEsMTgsMTgsMThjOS45LDAsMTgtOC4xLDE4LTE4di00MS40QzE4NS4yLDE1OC42LDE3Ny4xLDE1MC41LDE2Ny4yLDE1MC41ICAgIHoiIGZpbGw9IiMwMDAwMDAiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0xNjcuMiwyNjMuNGMtOS45LDAtMTgsOC4xLTE4LDE4djExMi45YzAsOS45LDguMSwxOCwxOCwxOGM5LjksMCwxOC04LjEsMTgtMThWMjgxLjQgICAgQzE4NS4yLDI3MS41LDE3Ny4xLDI2My40LDE2Ny4yLDI2My40eiIgZmlsbD0iIzAwMDAwMCIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTI0My44LDE1MC41Yy05LjksMC0xOCw4LjEtMTgsMTh2MTIyLjJjMCw5LjksOC4xLDE4LDE4LDE4YzkuOSwwLDE4LTguMSwxOC0xOFYxNjguNSAgICBDMjYxLjgsMTU4LjYsMjUzLjcsMTUwLjUsMjQzLjgsMTUwLjV6IiBmaWxsPSIjMDAwMDAwIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNMjQzLjgsMzQ0LjJjLTkuOSwwLTE4LDguMS0xOCwxOHYzMi4xYzAsOS45LDguMSwxOCwxOCwxOGM5LjksMCwxOC04LjEsMTgtMTh2LTMyLjFDMjYxLjgsMzUyLjMsMjUzLjcsMzQ0LjIsMjQzLjgsMzQ0LjIgICAgeiIgZmlsbD0iIzAwMDAwMCIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTMyMC40LDE1MC41Yy05LjksMC0xOCw4LjEtMTgsMTh2NjNjMCw5LjksOC4xLDE4LDE4LDE4YzkuOSwwLDE4LTguMSwxOC0xOHYtNjNDMzM4LjQsMTU4LjYsMzMwLjMsMTUwLjUsMzIwLjQsMTUwLjV6IiBmaWxsPSIjMDAwMDAwIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNMzIwLjQsMjg1Yy05LjksMC0xOCw4LjEtMTgsMTh2OTEuM2MwLDkuOSw4LjEsMTgsMTgsMThjOS45LDAsMTgtOC4xLDE4LTE4VjMwM0MzMzguNCwyOTMuMSwzMzAuNCwyODUsMzIwLjQsMjg1eiIgZmlsbD0iIzAwMDAwMCIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo="
                            />
                        )}
                    </div>
                </foreignObject>
            </g>
        )
    }
}

const mapStateToProps = state => {
    return {
        nodes: state.vpl.nodes,
        links: state.vpl.links,
        map: state.map,
        geometries: state.map.geometries,
        regularMax: state.datasets.bounds[1],
    }
}

export default connect(mapStateToProps)(Panel)
