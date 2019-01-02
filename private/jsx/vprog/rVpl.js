/*global datavoxelId*/

import React from 'react'
import { connect } from 'react-redux'
import Rx from 'rxjs/Rx'
import _ from 'lodash'
import axios from 'axios'

import * as Act from '../store/actions.js'

import Slider from './Slider.js'
import Panel from './Panel.js'
import { Popover, Button, Menu, Dropdown } from 'antd'

import hashKey from '@/utils/hashKey'

import * as NodeType from './nodeTypes'
import * as svg from './svg/svg'

// import testFile from '../store/test_userFile.json'

// import { Nodes, Links } from './mockData' // deprecated

/* TODO
    - remove color2
    - nodeSVG() for dataset layer. need property?

*/

const style = {
    node: {
        rx: '2px', // rect radius
        // ry: '2px', // same as rx
        minWidth: 200,
        minHeight: 130,
        plug: {
            height: 20,
            width: 20,
            marginTop: 30,
        },
        topOffset: 5,
        fontSize: {
            // px unit
            nodeName: 14,
            propertyName: 10,
            plugName: 14,
        },
    },
}

function observer(label = '') {
    return {
        // next: (n) => console.log(label, 'Next: ', n),
        error: e => console.log(label, 'Error: ', e),
        complete: c => console.log(label, c, 'Completed'),
    }
}

class VPL extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            tempLink: {
                from: { x: 50, y: 50 },
                to: { x: 50, y: 50 },
            },
            panning: {
                x: 0,
                y: 0,
            },
            hover: '',
            hasNodeUpdated: {},
            nodeEvalStatus: {},
            nodeInQueue: {},
            refreshVoxels: false,
        }

        this.checked = {
            datasetNode: false,
        }

        this.geometries = {}

        // TODO: should be stored in the redux when  start
        this.originDatasetArray = {}
    }

    // create the dataset nodes if they're not exitst.
    initDatasetNode = () => {
        const { nodeEvalStatus, hasNodeUpdated } = this.state
        const layers = this.props.layers
        console.log('initDatasetNode()', layers, this.props.nodes)

        Object.entries(layers).map(([key, layer], index) => {
            // console.log(index, { layer })

            const datasetNode = this.newNodeObj('DATASET')

            datasetNode.position = {
                x: 50,
                y: 100 + 150 * index,
            }
            datasetNode.name = layer.propertyName
            datasetNode.color = layer.color1

            const min = layer.geojson.minMax[0]
            const max = layer.geojson.minMax[1]

            datasetNode.filter = { max, min, maxVal: max, minVal: min }

            nodeEvalStatus[key] = Promise.resolve(true)
            hasNodeUpdated[key] = false
            Act.nodeAdd({
                nodeKey: key,
                node: datasetNode,
            })
        })

        const datasetsLoaded = !_.isEmpty(layers)
        if (datasetsLoaded) this.checkMemory()
        this.setState({ nodeEvalStatus, hasNodeUpdated })
        return datasetsLoaded
    }

    checkMemory = () => {
        axios
            .get('/getUserfile/' + datavoxelId, { options: {} })
            .then(({ data }) => {
                console.log('checkmemory', { data })

                // Test
                // console.log('checkmemory', { testFile })
                // data = testFile

                if (data.voxelId) this.loadMemory(data)
            })
    }

    loadMemory = data => {
        Act.loadMemory(data)
        setTimeout(() => {
            Act.setRefreshVoxels({ value: true })
        }, 500)
    }

    newNodeObj = type => {
        const nodes = this.props.nodes

        // TODO: limit the nodes length
        const nodesLength =
            Object.keys(nodes).length -
            Object.values(nodes).filter(f => f.type == 'DATASET').length
        const rows = 3
        const cols = 3

        let init = { x: 300, y: 50 }
        let step = {
            x: 250 * Math.floor(nodesLength / rows),
            y: 150 * (nodesLength % rows),
        }

        // if the nodes length is over the limit
        if (nodesLength >= cols * rows) {
            init = { x: 50, y: 50 + 150 * rows }
            step = {
                x: 100 * (nodesLength - cols * rows),
                y: 0,
            }
        }

        // Options for node inherit to class.
        const classOptions = {
            increaseInput:
                NodeType[type] !== NodeType.DATASET &&
                NodeType[type] !== NodeType.LOG,
        }

        const newNode = {
            name: type,
            type: type,
            classOptions,
            savedData: {},
            updateStatus: 2, // 0 = No Update, 1 = Filter Only, 2 = Full update
            options: {},
            inputs: { ...NodeType[type].inputs },
            filter: {
                max: 1,
                min: 0,
            },
            position: {
                x: init.x + step.x,
                y: init.y + step.y,
            },
            color: d3.hsl(this.getRandomInt(0, 360), '0.6', '0.6').toString(),
            opacity: 0.5,
            visibility: true,
        }
        return newNode
    }

    componentDidUpdate() {
        const { hasNodeUpdated, refreshVoxels } = this.state
        const { nodes, map } = this.props
        this.geometries = Object.assign({}, map.geometries)
        if (!this.checked.datasetNode) {
            this.checked.datasetNode = this.initDatasetNode()
        }
        if (refreshVoxels) {
            this.setState({ refreshVoxels: false })
            for (let nodeKey in nodes) {
                let node = nodes[nodeKey]
                if (
                    _.get(node, 'updateStatus', 2) > 0 &&
                    !_.get(hasNodeUpdated, nodeKey, false)
                ) {
                    this.markNodesForUpdate(nodeKey)
                }
            }
        }
        if (this.props.refreshVoxels && !refreshVoxels) {
            Act.setRefreshVoxels({ value: false })
            this.setState({ refreshVoxels: true })
        }
    }

    componentDidMount() {
        // const bodyDOM = document.body
        const vplDOM = document.querySelector('svg.vpl')
        const mouseDown$ = Rx.Observable.fromEvent(vplDOM, 'mousedown')
        const mouseUp$ = Rx.Observable.fromEvent(vplDOM, 'mouseup')
        const mouseMove$ = Rx.Observable.fromEvent(vplDOM, 'mousemove').share()
        const mouseLeave$ = Rx.Observable.fromEvent(vplDOM, 'mouseleave')
        // const empty$ = Rx.Observable.empty()

        this.mouseTracker$ = mouseDown$
            .map(down => {
                const nodeDOM = down.target.closest('g.node')
                const plugDOM = down.target.closest('g.plug')
                const controlDOM = down.target.closest('g.control')
                const svgDOM = down.target.closest('svg')

                down.purpose = nodeDOM ? 'move' : 'none'

                down.purpose = plugDOM ? 'link' : down.purpose
                down.purpose = controlDOM ? 'none' : down.purpose
                down.purpose = down.shiftKey ? 'pan' : down.purpose

                switch (down.purpose) {
                    case 'move': {
                        const [x, y] = nodeDOM
                            .getAttribute('transform')
                            .match(/-?\d+/g)
                        down.info = { x, y, nodeDOM }
                        break
                    }
                    case 'link': {
                        down.info = { nodeDOM, plugDOM, svgDOM }
                        break
                    }
                    case 'pan': {
                        const [x, y] = svgDOM
                            .getAttribute('viewBox')
                            .split(' ')
                            .map(n => parseFloat(n))

                        down.info = { x, y, svgDOM }

                        break
                    }
                }

                console.log('down purpose : ', down.purpose, down.info)

                return mouseMove$
                    .takeUntil(mouseUp$.merge(mouseLeave$))
                    .map(move => ({ move, down }))
                    .combineLatest(
                        // get the lastest mouse up event
                        mouseUp$
                            .merge(mouseLeave$)
                            .mapTo(true)
                            .first()
                            .startWith(false),
                        ({ move, down }, up) => ({ move, down, up })
                    )
            })
            .concatAll()
            .do(({ move, down }) => {
                // prevent text/element selection with cursor drag
                down.preventDefault()
                move.preventDefault()
                down.stopPropagation()
                move.stopPropagation()
            })
            .share()

        this.moveNode$ = this.mouseTracker$
            .filter(({ down }) => down.purpose == 'move')
            // .do(({down, move}) => {console.log('moveNode$', {move, down})})
            // .throttleTime(30) // limit execution time for opt performance
            .map(({ down, move }) => ({
                nodeKey: down.info.nodeDOM.getAttribute('data-key'),
                x: Number(down.info.x) + (move.clientX - down.clientX),
                y: Number(down.info.y) + (move.clientY - down.clientY),
            }))
            /* no used when panning
            .map(({ nodeKey, x, y }) => ({
                nodeKey,
                // prevent the position to be set to a negative number.
                x: x < 0 ? 0 : x,
                y: y < 0 ? 0 : y,
            }))
            */
            .do(({ nodeKey, x, y }) => {
                // console.log("nodeMove", {nodeKey, x, y})
                const newPosition = { x, y }
                const moveNode = { nodeKey, newPosition }

                this.moveNode(moveNode)
            })
            .subscribe(observer('moveNode$'))

        this.linkNode$ = this.mouseTracker$
            .filter(({ down }) => down.purpose == 'link')
            // .do(({down, link}) => {console.log('linkNode$', {link, down})})
            // .throttleTime(30) // limit execution time for opt performance
            .do(({ down, move }) => {
                const plugRect = down.info.plugDOM.getBoundingClientRect()
                const svgRect = down.info.svgDOM.getBoundingClientRect()

                const from = {
                    x: plugRect.right - svgRect.left,
                    y: plugRect.top + plugRect.height / 2 - svgRect.top,
                }
                const to = {
                    // minus 2 to avoid targeting the `link` element.
                    x: move.clientX - svgRect.left - 2,
                    y: move.clientY - svgRect.top - 2,
                }

                // console.log('this.moveTempLink(from, to)', from, to)
                this.moveTempLink({ from, to })
            })
            .filter(({ up }) => up)
            .do(({ down, move }) => {
                // clear temp link
                this.moveTempLink({ from: { x: 0, y: 0 }, to: { x: 0, y: 0 } })

                const toPlugDOM = move.target.closest('g[data-plug]')

                if (toPlugDOM) {
                    const toPlugType = toPlugDOM.getAttribute('data-plug-type')
                    // console.log('toPlugType= ', toPlugType)

                    if (toPlugType == 'input') {
                        // className="plug" data-node-key={nodeKey} data-plug="true" data-plug-type="output" data-output={output}
                        const srcNode = down.info.plugDOM.getAttribute(
                            'data-node-key'
                        )

                        // className="plug" data-node-key={nodeKey} data-plug="true" data-plug-type="input" data-input={input}
                        const toNode = toPlugDOM.getAttribute('data-node-key')
                        const toInput = toPlugDOM.getAttribute('data-input')

                        this.linkNode({ srcNode, toNode, toInput })
                    }
                }
            })
            .do(() => {
                this.setState({ refreshVoxels: true })
            })
            .subscribe(observer('linkNode$'))

        this.panVpl$ = this.mouseTracker$
            .filter(({ down }) => down.purpose == 'pan')
            .do(({ down, move }) => {
                console.log('panVpl$', { move, down })
            })
            // .throttleTime(30) // limit execution time for opt performance
            .map(({ down, move }) => ({
                x: Number(down.info.x) - (move.clientX - down.clientX),
                y: Number(down.info.y) - (move.clientY - down.clientY),
            }))
            /*
            // limit the position.
            .map(({ nodeKey, x, y }) => ({
                nodeKey,
                x: x < 0 ? 0 : x,
                y: y < 0 ? 0 : y,
            }))
            */
            .do(({ x, y }) => {
                // console.log('panVpl', { x, y })

                const newPosition = { x, y }
                this.panning(newPosition)
            })
            .subscribe(observer('panVpl$'))

        this.shiftKeyEvent$ = Rx.Observable.merge(
            Rx.Observable.fromEvent(window, 'keydown'),
            Rx.Observable.fromEvent(window, 'keyup')
        )
            .filter(f => f.key == 'Shift')
            .map(m => m.type == 'keydown')
            .do(d => {
                vplDOM.style.cursor = d ? 'all-scroll' : ''
            })
            .subscribe(observer('shiftKeyEvent$'))

        this.mouseHover$ = mouseMove$
            .throttleTime(100) // limit execution time for opt performance
            .map(move => {
                const nodeDOM = move.target.closest('g.node')

                // return nodeKey
                return nodeDOM ? nodeDOM.getAttribute('data-key') : null
            })
            .distinctUntilChanged()
            .do(nodeKey => {
                this.setState({ hover: nodeKey })
                Act.setActiveNode({ value: nodeKey })
                console.log('mouseHover', nodeKey)
            })
            .subscribe(observer('mouseHover$'))
    }

    componentWillUnmount() {
        console.log('componentWillUnmount', 'unsubscribe observer')
        this.moveNode$.unsubscribe()
        this.linkNode$.unsubscribe()
        this.panVpl$.unsubscribe()
        this.shiftKeyEvent$.unsubscribe()
        this.mouseHover$.unsubscribe()
    }

    panning = ({ x, y }) => {
        const panning = { x, y }

        this.setState({ panning })
    }

    moveNode = ({ nodeKey, newPosition }) => {
        Act.nodeUpdate({ nodeKey, attr: 'position', value: newPosition })
    }

    deleteNode = nodeKey => {
        const { outputs } = this.props.links

        Object.keys(_.get(outputs, nodeKey, [])).map(node =>
            Act.nodeUpdate({
                nodeKey: node,
                attr: 'updateStatus',
                value: 2,
            })
        )

        Act.nodeRemove({ nodeKey })

        this.setState({ refreshVoxels: true })
    }

    markNodesForUpdate = initNode => {
        const { hasNodeUpdated, nodeInQueue } = this.state
        const { outputs, inputs } = this.props.links
        const { nodes } = this.props
        hasNodeUpdated[initNode] = true
        const nodeQueue = Object.keys(_.get(outputs, initNode, {}))
        const nodesToUpdate = [initNode]
        while (nodeQueue.length > 0) {
            let currentNode = nodeQueue.shift()
            if (!nodesToUpdate.includes(currentNode)) {
                hasNodeUpdated[currentNode] = true
                nodesToUpdate.push(currentNode)
                for (let child in outputs[currentNode]) {
                    nodeQueue.push(child)
                }
            }
        }

        let promises = nodesToUpdate.map(node =>
            _.get(nodeInQueue, node, Promise.resolve(true))
        )

        Promise.all(promises).then(() => {
            nodesToUpdate.map(currentNode =>
                Act.nodeUpdate({
                    nodeKey: currentNode,
                    attr: 'updateStatus',
                    value: 2,
                })
            )
            let shortcircuit = false

            let nodeEvaluating = Promise.resolve(true)
            for (let i = 0; i < nodesToUpdate.length; i++) {
                const { nodeKey, type } = nodes[nodesToUpdate[i]]
                if (type !== 'DATASET') {
                    if (
                        _.get(inputs, nodeKey) &&
                        Object.keys(inputs[nodeKey]).length >=
                            Object.keys(NodeType[type].inputs).length
                    ) {
                        nodeEvaluating = nodeEvaluating.then(() =>
                            this.computeNode(nodeKey)
                        )
                    } else {
                        this.nodeOutput({
                            nodeKey: nodeKey,
                            geometry: null,
                        })
                        hasNodeUpdated[nodeKey] = false
                        shortcircuit = true
                    }
                } else {
                    nodeEvaluating = nodeEvaluating.then(() =>
                        this.computeDatabaseNode(nodeKey)
                    )
                }
            }
            nodesToUpdate.map(node => {
                nodeInQueue[node] = nodeEvaluating
            })

            if (shortcircuit) {
                this.setState({
                    hasNodeUpdated,
                    nodeInQueue,
                })
            } else {
                this.setState({
                    nodeInQueue,
                })
            }
        })

        this.setState({ hasNodeUpdated })
    }

    linkNode = ({ srcNode, toNode, toInput }) => {
        Act.nodeUpdate({
            nodeKey: toNode,
            attr: 'savedData',
            value: {},
        })
        Act.linkAdd({ srcNode, toNode, toInput })
        Act.nodeUpdate({
            nodeKey: toNode,
            attr: 'updateStatus',
            value: 2,
        })
    }

    updateNodeOption = (nodeKey, attr, value) => {
        const newValue = prompt(`Please input a value for ${attr}`, value)

        if (!_.isEmpty(newValue)) {
            console.log(
                `updated the ${value} => ${newValue} for '${attr}' of ${nodeKey}`
            )

            Act.nodeOptionUpdate({ nodeKey, attr, value: newValue })
            Act.nodeUpdate({
                nodeKey: nodeKey,
                attr: 'updateStatus',
                value: 2,
            })

            this.setState({ refreshVoxels: true })
        }
    }

    // deprecated
    changeNodeFilter = (nodeKey, min, max) => {
        console.log(`changeFilter(${nodeKey}, ${min}, ${max})`)

        const filter = { min, max }

        Act.nodeOptionUpdate({
            nodeKey,
            attr: 'filter',
            value: filter,
        })

        this.setState({ refreshVoxels: true })
    }

    createTempLink = () => {
        return (
            <path
                markerEnd="url(#Triangle)"
                ref={ref => (this.tempLink = ref)}
                key="tempLink"
                className={'link tempLink'}
                d={this.diagonal(
                    this.state.tempLink.from,
                    this.state.tempLink.to
                )}
            />
        )
    }

    moveTempLink = ({ from, to }) => {
        this.setState({ tempLink: { from, to } })
    }

    createLink = ({ linkKey, linkInfo, from, to }) => {
        const linkRef = 'link_' + linkKey
        const hoverNode = this.state.hover

        const nodeHover = hoverNode
            ? hoverNode == linkInfo.srcNode || hoverNode == linkInfo.toNode
            : null

        const style = {
            cursor: 'pointer',
            strokeWidth: nodeHover ? '3px' : null,
            stroke: nodeHover ? '#ec6651' : null,
        }
        return (
            <path
                style={style}
                markerEnd="url(#Triangle)"
                ref={ref => (this[linkRef] = ref)}
                key={linkKey}
                className={'link'}
                d={this.diagonal(from, to)}
                data-src-node={linkInfo.srcNode}
                data-to-node={linkInfo.toNode}
                onClick={this.deleteLink}
            />
        )
    }

    deleteLink = event => {
        const { hasNodeUpdated } = this.state
        const linkDOM = event.target
        const srcNode = linkDOM.getAttribute('data-src-node')
        const toNode = linkDOM.getAttribute('data-to-node')

        Act.linkRemove({ srcNode, toNode })
        Act.nodeUpdate({
            nodeKey: toNode,
            attr: 'savedData',
            value: {},
        })

        hasNodeUpdated[srcNode] = false
        hasNodeUpdated[toNode] = false

        Act.nodeUpdate({
            nodeKey: srcNode,
            attr: 'updateStatus',
            value: 2,
        })

        Act.nodeUpdate({
            nodeKey: toNode,
            attr: 'updateStatus',
            value: 2,
        })

        this.setState({ hasNodeUpdated, refreshVoxels: true })
    }

    createLinks = () => {
        const outputs = this.props.links.outputs

        const svgDOM = document.querySelector('svg.vpl')
        if (!svgDOM) return ''

        return Object.entries(outputs).map(([srcNode, input]) => {
            const svgRect = svgDOM.getBoundingClientRect()

            const outputPlugDOM = this[`${srcNode}_plug_output`]
            if (!outputPlugDOM) return ''

            return Object.entries(input).map(([toNode, inputKey]) => {
                const inputPlugDOM = this[`${toNode}_plug_input_${inputKey}`]
                if (!inputPlugDOM) return ''
                const linkKey = `${srcNode}_${toNode}`
                const linkInfo = { srcNode, toNode }

                const outputPlugRect = outputPlugDOM.getBoundingClientRect()
                const inputPlugRect = inputPlugDOM.getBoundingClientRect()

                const from = {
                    x: outputPlugRect.right - svgRect.left,
                    y:
                        outputPlugRect.top +
                        outputPlugRect.height / 2 -
                        svgRect.top,
                }
                const to = {
                    x: inputPlugRect.left - svgRect.left,
                    y:
                        inputPlugRect.top +
                        inputPlugRect.height / 2 -
                        svgRect.top,
                }

                return this.createLink({ linkKey, linkInfo, from, to })
            })
        })
    }

    // Computes database node voxels
    computeDatabaseNode = datasetKey => {
        const { geometries } = this
        const { nodes } = this.props
        const geometry = _.get(geometries, datasetKey) //geometries[datasetKey]
        if (!geometry) {
            return Promise.resolve(true)
        }
        if (!this.originDatasetArray[datasetKey]) {
            // copy original size array
            const oriArray = geometry.geometry.attributes.originalsize.array
            this.originDatasetArray[datasetKey] = oriArray
        }

        const oriArray = this.originDatasetArray[datasetKey]
        geometry.geometry.attributes.size.array = oriArray

        let node = _.cloneDeep(nodes[datasetKey])

        if (node.filter) {
            const { min, max } = node.filter
            node.filter.min = min / node.filter.maxVal
            node.filter.max = max / node.filter.maxVal
        }
        return this.evalArithmeticNode({
            node,
            mathFunction: arr => arr[0],
            options: {},
            geometries: [geometry],
        })
    }

    // Computes non database node voxels
    computeNode = nodeKey => {
        const { hasNodeUpdated, nodeEvalStatus } = this.state
        const { nodes } = this.props
        const { inputs } = this.props.links

        let canComplete = Promise.resolve(true)
        if (nodeKey in inputs && hasNodeUpdated[nodeKey]) {
            const parents = Object.values(inputs[nodeKey])
            const node = nodes[nodeKey]

            // Retrieves the evaluating status of parent nodes
            for (let i = 0; i < parents.length; i++) {
                const parent = parents[i]
                canComplete = canComplete.then(() => nodeEvalStatus[parent])
            }

            // Starts evaluating node
            nodeEvalStatus[nodeKey] = canComplete.then(() => {
                const mapGeometries = this.geometries
                const { updateStatus } = node
                let mathFunction = NodeType[node.type].arithmetic

                // If update status is set to filter, changes the function to return last computed values instead
                if (updateStatus === 1) {
                    const values = _.get(node, 'savedData.actualValues', [])
                    mathFunction = () => Promise.resolve(values)
                }
                const options = Object.assign(
                    NodeType[node.type].options,
                    node.options
                )

                const inputKeys = Object.values(inputs[node.nodeKey])
                let inputGeometries = inputKeys.map(
                    index => mapGeometries[index]
                )

                let voxelComputed = Promise.resolve(true)

                // Evaluates node if all the input nodes are connected
                if (
                    inputGeometries.filter(f => f).length === inputKeys.length
                ) {
                    voxelComputed = this.evalArithmeticNode({
                        node,
                        mathFunction,
                        options,
                        geometries: inputGeometries,
                    })
                } else {
                    this.nodeOutput({ nodeKey: node.nodeKey, geometry: null })
                    hasNodeUpdated[node.nodeKey] = false
                    this.setState({ hasNodeUpdated, refreshVoxels: false })
                }
                return voxelComputed
            })
        }
        this.setState({ nodeEvalStatus })
        return canComplete
    }

    diagonal(source, target) {
        return (
            'M' +
            source.x +
            ',' +
            source.y +
            'C' +
            (source.x + target.x) / 2 +
            ',' +
            source.y +
            ' ' +
            (source.x + target.x) / 2 +
            ',' +
            target.y +
            ' ' +
            target.x +
            ',' +
            target.y
        )
    }

    createNodeObject = (node, key) => {
        // console.log(`createNodeObject(${node}, ${key})`, node)
        const nodeRef = 'node_' + key

        return (
            <g
                key={key}
                className="node"
                ref={ref => (this[nodeRef] = ref)}
                data-key={key}
                transform={`translate(${node.translate.x},${node.translate.y})`}
            >
                {this.decideNodeType(node)}
            </g>
        )
    }

    evalArithmeticNode = async ({
        node,
        mathFunction,
        options,
        geometries,
    }) => {
        const savedData = _.get(node, 'savedData', {})
        const arraySize = geometries[0].geometry.attributes.size.count
        const hashedData = {}
        const allIndices = this.props.datasets.allIndices

        const amplifier = 3

        let transArray = geometries.map(
            geometry => geometry.geometry.attributes.translation.array
        )

        let geomArray = geometries.map(geometry =>
            Array.from(geometry.geometry.attributes.size.array)
        )

        const firstLayer = Object.values(this.props.layers)[0]
        const firstGeometry = Object.values(this.props.map.geometries)[0]

        const mathCallback = actualValues => {
            const { hasNodeUpdated } = this.state
            hasNodeUpdated[node.nodeKey] = false
            savedData['actualValues'] = actualValues

            let sizeArray = actualValues.map(x => (x > 0 ? x : 0))
            const originDataMax = math.max(sizeArray)
            const originDataMin = math.min(sizeArray)
            const newBounds = [originDataMin, originDataMax]

            Act.nodeUpdate({
                nodeKey: node.nodeKey,
                attr: 'max',
                value: originDataMax,
            })

            Act.nodeUpdate({
                nodeKey: node.nodeKey,
                attr: 'savedData',
                value: savedData,
            })

            Act.nodeUpdate({
                nodeKey: node.nodeKey,
                attr: 'updateStatus',
                value: 0,
            })

            this.setState({ hasNodeUpdated })

            if (node.remap) {
                const dataMax = math.max(sizeArray)
                const dataMin = 0 // always be zero.
                const originScale = dataMax - dataMin
                const newScale = node.remap.max - dataMin

                const remap = x =>
                    x ? x * newScale / originScale + dataMin : 0

                if (originScale > 0) sizeArray = sizeArray.map(remap)
            }

            // new: filter feature (2017 Nov. )
            if (node.filter) {
                const dataMax = math.max(sizeArray)
                const dataMin = 0 // should be zero

                let { min, max } = node.filter
                const range = dataMax - dataMin

                min = dataMin + min * range
                max = dataMin + max * range
                sizeArray = sizeArray.map(x => (x <= max && x >= min ? x : 0))
            }

            if (NodeType[node.type].class == 'logic') {
                const trueValue = this.props.datasets.bounds[1]
                sizeArray = sizeArray.map(x => (x ? trueValue : x))
            }

            const translationArray = new Float32Array(arraySize * amplifier)
            for (let i = 0, j = 0; j < arraySize; i = i + amplifier, j++) {
                for (let k = amplifier - 1; k >= 0; k--) {
                    translationArray[i + k] =
                        transArray.map(ta => ta[i + k]).find(f => f != 0) || 0
                }

                if (allIndices.includes(j)) {
                    let hashedArray = Array(8)
                    hashedArray[3] = sizeArray[j]
                    hashedData[j] = hashedArray
                }
            }

            let props = {
                size: sizeArray,
                translation: translationArray,
            }

            let geometry = {
                minMax: this.props.datasets.minMax,
                addressArray: firstGeometry.addresses,
                properties: props,
                cols: firstLayer.rowsCols.cols,
                rows: firstLayer.rowsCols.rows,
                bounds: newBounds,
                shaderText: firstLayer.shaderText,
                n: _.size(this.props.layers) + 1,
                name: node.name,
                type: node.type,
                layerName: node.nodeKey,
                length: Math.max(...geometries.map(g => g.numElements)),
                hashedData: hashedData,
                allIndices: allIndices,
                color1: node.color,
                color2: node.color,
            }
            this.addVoxelGeometry(geometry)
        }

        return Promise.resolve(mathFunction(geomArray, options, savedData))
            .then(result => mathCallback(result))
            .catch(err => {
                console.error(err)
                const { hasNodeUpdated } = this.state
                hasNodeUpdated[node.nodeKey] = false
                this.setState({ hasNodeUpdated })
                Act.nodeUpdate({
                    nodeKey: node.nodeKey,
                    attr: 'updateStatus',
                    value: 0,
                })
            })
    }

    decideNodeType(node) {
        return this.nodeSVG(node)
    }

    nodeSVG = ({
        color,
        name,
        type,
        nodeKey,
        options,
        inputs,
        classOptions,
    }) => {
        // const inputs = NodeType[type].inputs
        if (inputs === undefined) {
            inputs = NodeType[type].inputs
        }
        const output = NodeType[type].output

        const typeOptions = NodeType[type].options

        // const nodeName = layerName
        const nodeName = name || NodeType[type].fullName
        const Style = style.node

        // const nodeWidth = nodeName.length > 10 ? Style.minWidth + (nodeName.length - 10) * Style.fontSize.nodeName * 0.6 : Style.minWidth // 0.6 is the font width/height ratio
        const nodeWidth = Style.minWidth
        const nodeHeight = Style.minHeight

        const desc = (
            <span
                style={{
                    width: '280px',
                    display: 'block',
                }}
            >
                {NodeType[type].desc.split('\n').map((line, idx) => (
                    <p
                        style={{ fontSize: '12px' }}
                        key={`${nodeKey}_desc_${idx}`}
                    >
                        {line}
                    </p>
                ))}
            </span>
        )

        return (
            <g data-node-name={nodeName}>
                <rect
                    key={nodeKey}
                    className="background"
                    width={nodeWidth}
                    height={
                        nodeHeight +
                        Math.max(
                            0,
                            Style.plug.marginTop *
                                (Object.entries(inputs).length - 2)
                        )
                    }
                    x="0"
                    y="0"
                    style={{
                        // fill: `${updateStatus > 0 ? '#92A3A8' : '#ecf0f1'}`,
                        fill: '#ecf0f1',
                        stroke: '#ccc',
                        rx: '2px',
                    }}
                />

                {/* input Plugs */}
                {Object.entries(inputs).map(([input, abbr], index) => (
                    <g
                        key={`${nodeKey}_plug_input_${input}`}
                        ref={ref =>
                            (this[`${nodeKey}_plug_input_${input}`] = ref)
                        }
                        className="plug"
                        data-node-key={nodeKey}
                        data-plug="true"
                        data-plug-type="input"
                        data-input={input}
                        transform={`translate(0, ${Style.plug.height / 2 +
                            Style.topOffset +
                            Style.plug.marginTop * index})`}
                    >
                        <rect
                            width={Style.plug.width}
                            height={Style.plug.height}
                            x={0}
                            y={-Style.plug.height / 2}
                            style={{ fill: '#fff', stroke: '#ccc' }}
                        />
                        <text
                            x={Style.plug.width / 2}
                            y={0}
                            fontSize={Style.fontSize.plugName}
                            style={{
                                textAnchor: 'middle',
                                fontFamily: 'Monospace',
                                fill: '#4a4a4a',
                                dominantBaseline: 'central',
                            }}
                        >
                            {abbr}
                        </text>
                    </g>
                ))}
                {/* Adding more nodes */}
                {_.get(classOptions, 'increaseInput', false) && (
                    <foreignObject
                        transform={`translate(${2}, ${Style.plug.height / 2 +
                            Style.topOffset +
                            Style.plug.marginTop *
                                (Object.entries(inputs).length - 0.5)})`}
                    >
                        <img
                            onClick={() => {
                                const x_index =
                                    Object.entries(inputs).length + 1
                                Act.nodeUpdate({
                                    nodeKey,
                                    attr: 'inputs',
                                    value: {
                                        ...inputs,
                                        [`Input${x_index}`]: Object.entries(
                                            inputs
                                        )[x_index - 2][1], //`I${x_index - 1}`,
                                    },
                                })
                            }}
                            title="add"
                            style={{ cursor: 'pointer' }}
                            src={svg.PLUS}
                        />
                    </foreignObject>
                )}
                {/* Removing */}
                {_.get(classOptions, 'increaseInput', false) &&
                    Object.entries(inputs).length > 2 && (
                        <foreignObject
                            transform={`translate(${2}, ${Style.plug.height /
                                2 +
                                Style.topOffset +
                                Style.plug.marginTop *
                                    (Object.entries(inputs).length + 0.5)})`}
                        >
                            <img
                                onClick={() => {
                                    const entries = Object.entries(inputs)
                                    const newInput = entries
                                        .slice(0, entries.length - 1)
                                        .reduce(
                                            (accum, current) => ({
                                                ...accum,
                                                [current[0]]: current[1],
                                            }),
                                            {}
                                        )
                                    const srcNode = _.get(
                                        this.props.links.inputs,
                                        `${nodeKey}.${
                                            entries[entries.length - 1][0]
                                        }`
                                    )
                                    if (srcNode) {
                                        Act.linkRemove({
                                            srcNode,
                                            toNode: nodeKey,
                                        })
                                    }
                                    Act.nodeUpdate({
                                        nodeKey,
                                        attr: 'updateStatus',
                                        value: 2,
                                    })
                                    Act.nodeUpdate({
                                        nodeKey,
                                        attr: 'inputs',
                                        value: newInput,
                                    })
                                    this.setState({ refreshVoxels: true })
                                }}
                                title="minus"
                                style={{ cursor: 'pointer' }}
                                src={svg.MINUS}
                            />
                        </foreignObject>
                    )}
                <Button type="primary" icon="cloud-download" />
                {/* Output Plug */}
                <g
                    ref={ref => (this[`${nodeKey}_plug_output`] = ref)}
                    className="plug"
                    data-node-key={nodeKey}
                    data-plug="true"
                    data-plug-type="output"
                    data-output={output}
                    transform={`translate(${nodeWidth -
                        Style.plug.width}, ${Style.plug.height / 2 +
                        Style.topOffset})`}
                >
                    <rect
                        width={Style.plug.width}
                        height={Style.plug.height}
                        x={0}
                        y={-Style.plug.height / 2}
                        style={{ fill: '#fff', stroke: '#ccc' }}
                    />
                    <text
                        x={Style.plug.width / 2}
                        y={0}
                        fontSize={Style.fontSize.plugName}
                        style={{
                            textAnchor: 'middle',
                            fontFamily: 'Monospace',
                            fill: '#4a4a4a',
                            dominantBaseline: 'central',
                        }}
                    >
                        {output[0]}
                    </text>
                </g>

                <Popover
                    placement="top"
                    title={nodeName}
                    content={desc}
                    trigger="click"
                >
                    <text
                        x={nodeWidth / 2}
                        y="25"
                        fontSize={Style.fontSize.nodeName + 'px'}
                        style={{
                            textAnchor: 'middle',
                            fontFamily: 'Monospace',
                            fill: '#536469',
                            cursor: 'help',
                        }}
                    >
                        {nodeName.length > 10
                            ? `${nodeName.substr(0, 13)}...`
                            : nodeName}
                    </text>
                </Popover>
                <g
                    className="control"
                    transform={`translate(0, ${Math.max(
                        0,
                        Style.plug.marginTop *
                            (Object.entries(inputs).length - 2)
                    )})`}
                >
                    <Slider index={nodeKey} />
                    <Panel
                        color={color}
                        index={nodeKey}
                        type={type}
                        deleteNode={() => {
                            this.deleteNode(nodeKey)
                        }}
                        updated={() => {
                            // this.markNodesForUpdate(index)
                            Act.setRefreshVoxels({ value: true })
                        }}
                        // changeFilter={(min, max) => {
                        //     this.changeNodeFilter(nodeKey, min, max)
                        // }}
                    />

                    {/* NODE OPTIONS */
                    Object.entries(typeOptions).map(([attr, def], index) => {
                        // if (attr == 'filter') return

                        // 'attribute': 'default value'
                        const value = options[attr] || def

                        return (
                            <text
                                key={`${nodeKey}_option_${attr}`}
                                onClick={() => {
                                    this.updateNodeOption(
                                        nodeKey,
                                        attr,
                                        Number(value)
                                    )
                                }}
                                x={nodeWidth / 2}
                                y={43 + index * 13}
                                fontSize={Style.fontSize.propertyName + 'px'}
                                style={{
                                    cursor: 'pointer',
                                    textAnchor: 'middle',
                                    fontFamily: 'Monospace',
                                    fill: '#b3b3b3',
                                }}
                            >
                                {_.startCase(attr)} :{' '}
                                {String(value).substring(0, 6)}
                                <title>Click to edit it</title>
                            </text>
                        )
                    })}
                </g>
            </g>
        )
    }

    getRandomInt(min, max) {
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor(Math.random() * (max - min)) + min //The maximum is exclusive and the minimum is inclusive
    }

    addNode = type => {
        const { nodeEvalStatus } = this.state
        const nodeHashKey = hashKey()
        nodeEvalStatus[nodeHashKey] = Promise.resolve(true)
        Act.nodeAdd({
            nodeKey: nodeHashKey,
            node: this.newNodeObj(type),
        })
        this.setState({ nodeEvalStatus })
    }

    linkMarker() {
        return (
            <defs>
                <marker
                    id="Triangle"
                    viewBox="0 0 10 10"
                    refX="10"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto"
                    markerUnits="userSpaceOnUse"
                >
                    <path d="M 0 0 L 0 10 L 10 10 L 10 0 z" />
                </marker>
            </defs>
        )
    }

    addVoxelGeometry = geometry => {
        // TODO: adding Geometry function should be more simple
        const map = this.props.map.instance
        const circle = new THREE.CircleBufferGeometry(1, 20)
        const otherArray = []

        const color1 = geometry.color1
        const color2 = geometry.color2

        // let shaderContent = document.getElementById( 'fragmentShader' ).textContent;
        // shaderContent = shaderContent.replace(/1.5/g, parseFloat(1/ptDistance));
        this.nodeOutput({ nodeKey: geometry.layerName, geometry: null })

        const P = new PaintGraph.Pixels(
            geometry.layerName,
            map,
            circle,
            otherArray,
            color1,
            color2,
            geometry.minMax,
            geometry.addressArray,
            geometry.cols,
            geometry.rows,
            geometry.n,
            geometry.bounds,
            geometry.shaderText,
            true,
            geometry.properties
        )

        this.nodeOutput({
            nodeKey: geometry.layerName,
            geometry: P,
        })
    }

    nodeOutput = ({ nodeKey, geometry }) => {
        if (geometry) this.geometries[nodeKey] = geometry
        else delete this.geometries[nodeKey]

        Act.nodeOutput({ nodeKey, geometry })
    }

    render() {
        const nodes = this.props.nodes

        const nodeTypeGroupByClass = _.groupBy(
            Object.entries(NodeType).map(([typeKey, val]) => ({
                ...val,
                typeKey,
            })),
            'class'
        )
        const NodeMenu = (
            <Menu onClick={({ key }) => this.addNode(key)}>
                {Object.entries(nodeTypeGroupByClass).map(
                    ([key, types]) =>
                        key != 'dataset' ? (
                            <Menu.SubMenu title={key.toUpperCase()} key={key}>
                                {types.map(({ fullName, typeKey }) => (
                                    <Menu.Item key={typeKey}>
                                        {fullName + ' Node'}
                                    </Menu.Item>
                                ))}
                            </Menu.SubMenu>
                        ) : (
                            ''
                        )
                )}
            </Menu>
        )
        return (
            <div className="pull-right col-md-10 vplContainer">
                <div id="menuAddNode" className="map-menu">
                    <Dropdown overlay={NodeMenu}>
                        <Button icon="plus" size="large">
                            Add Node
                        </Button>
                    </Dropdown>
                </div>
                <style jsx>{`
                    #menuAddNode {
                        position: absolute;
                        right: 50px;
                        top: 30px;

                        :global(button) {
                            margin: 10px;
                            border-color: #00000030;
                            background-color: #ffffffe0;
                            &:hover {
                                color: #e75332;
                                border-color: #e75332;
                            }
                        }
                    }
                    :global(.ant-dropdown-menu-item) {
                        &:hover {
                            background-color: hsl(11, 79%, 98%);
                        }
                    }
                `}</style>

                <div className="row">
                    <svg
                        className="vpl"
                        ref={ref => (this.mainSvgElement = ref)}
                        width="3000"
                        height="3000"
                        viewBox={`${this.state.panning.x} ${
                            this.state.panning.y
                        } 3000 3000`}
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {this.linkMarker()}

                        {Object.entries(nodes).map(([key, node]) => {
                            node.name = node.name ? node.name : node.type
                            node.translate = node.position
                            node.nodeKey = key

                            return this.createNodeObject(node, key)
                        })}

                        <g
                            transform={`translate(${this.state.panning.x},${
                                this.state.panning.y
                            })`}
                        >
                            {// do not display temp link when its `from` and `to` is the same
                            // (this.state.tempLink.from.x == this.tempLink.tempLink.to.x && this.state.tempLink.from.y == this.tempLink.tempLink.to.y)
                            JSON.stringify(this.state.tempLink.from) !=
                            JSON.stringify(this.state.tempLink.to)
                                ? this.createTempLink()
                                : ''}
                            {this.createLinks()}
                        </g>
                    </svg>
                </div>
                <style jsx>{`
                    svg.vpl :global(*) {
                        user-select: none;
                    }
                `}</style>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        nodes: state.vpl.nodes,
        links: state.vpl.links,
        map: state.map,
        layers: state.datasets.layers,
        datasets: state.datasets,
        refreshVoxels: state.interactions.refreshVoxels,
    }
}

export default connect(mapStateToProps)(VPL)
