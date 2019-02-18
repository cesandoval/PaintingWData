import React from 'react'
import { InputNumber, Row, Col, Button } from 'antd'
import {
    VictoryLine,
    VictoryChart,
    VictoryScatter,
    VictoryBar,
    VictoryTheme,
    VictoryAxis,
    VictoryZoomContainer,
} from 'victory'
import _ from 'lodash'
import { saveSvgAsPng } from 'save-svg-as-png'

const pointToJson = point => ({ x: point[0], y: point[1] })
const paddingTop = { paddingTop: '10%' }
const fullWidth = { width: '100%' }
const textAlignCenter = { textAlign: 'center' }

export const exportComponent = nodeKey => {
    const svg = document.getElementById(`bf-${nodeKey}`)
    console.log(svg.childNodes)
    saveSvgAsPng(svg.children[0].children[0], nodeKey, {
        encoderOptions: 1,
    })
    return nodeKey
}

export const bestFit = node => {
    const line = _.get(node, 'savedData.line', [])
    const samples = _.get(node, 'savedData.samples', [])
    if (Object.keys(_.get(node, 'inputs', {})).length > 2) {
        return <text>This feature is only avaiable for 2D regression</text>
    }
    return (
        <Row style={{ textAlign: 'right' }}>
            <Col id={`bf-${node.nodeKey}`} span={22}>
                <VictoryChart theme={VictoryTheme.material}>
                    <VictoryLine
                        style={{
                            parent: { border: '1px solid #ccc' },
                        }}
                        data={line.map(pointToJson)}
                    />
                    <VictoryScatter
                        style={{ data: { fill: '#c43a31' } }}
                        size={3}
                        data={samples.map(pointToJson)}
                    />
                    <VictoryAxis
                        label="X"
                        style={{
                            axis: { stroke: '#756f6a' },
                            axisLabel: { fontSize: 20, padding: 30 },
                        }}
                    />
                    <VictoryAxis
                        dependentAxis
                        label="Y"
                        style={{
                            axis: { stroke: '#756f6a' },
                            axisLabel: { fontSize: 20, padding: 35 },
                        }}
                    />
                </VictoryChart>
            </Col>
            <Col span={2} style={paddingTop}>
                <Button
                    shape="circle"
                    icon="export"
                    size="large"
                    onClick={() => exportComponent(node.nodeKey)}
                />
            </Col>
        </Row>
    )
}

export const kCluster = (node, barsShown, callback) => {
    const bar = _.get(node, 'savedData.bar', []).slice()
    if (!barsShown) {
        barsShown = bar.length
    }
    const filteredBar = bar
        .sort((a, b) => a[1] - b[1])
        .reverse()
        .slice(0, barsShown)
    const domain = {
        x: [0, Math.max(...filteredBar.map(point => point[0])) * 1.2],
        y: [0, Math.max(...filteredBar.map(point => point[1])) * 1.2],
    }
    const style = {
        data: {
            fill: '#c43a31',
            stroke: '#c43a31',
            fillOpacity: 0.7,
            strokeWidth: 2,
        },
    }
    return (
        <Row style={{ textAlign: 'right' }}>
            <Col id={`bf-${node.nodeKey}`} span={20}>
                <VictoryChart
                    theme={VictoryTheme.material}
                    containerComponent={<VictoryZoomContainer />}
                >
                    <VictoryBar
                        barRatio={1}
                        style={style}
                        data={filteredBar.map(pointToJson)}
                        domain={domain}
                        labels={d => (barsShown <= 20 ? `${d.y} nodes` : '')}
                    />
                    <VictoryAxis
                        label="Predicted Values"
                        style={{
                            axis: { stroke: '#756f6a' },
                            axisLabel: { fontSize: 20, padding: 30 },
                        }}
                    />
                    <VictoryAxis
                        dependentAxis
                        label="Nodes in Cluster"
                        style={{
                            axis: { stroke: '#756f6a' },
                            axisLabel: { fontSize: 20, padding: 30 },
                        }}
                    />
                </VictoryChart>
            </Col>
            <Col span={4} style={Object.assign(paddingTop, textAlignCenter)}>
                <text>Nodes Shown</text>
                <InputNumber
                    min={1}
                    max={bar.length}
                    defaultValue={barsShown}
                    style={fullWidth}
                    onChange={value => callback(value)}
                />
                <Button
                    shape="circle"
                    icon="export"
                    size="large"
                    onClick={() => exportComponent(node.nodeKey)}
                />
            </Col>
        </Row>
    )
}
