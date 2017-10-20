import React from 'react'
import { connect } from 'react-redux'
import Rx from 'rxjs/Rx'
import _ from 'lodash'

import * as Action from '../store/actions.js'
// import * as consts  from '../store/consts.js';

import Slider from './Slider.js'
import Panel from './Panel.js'
import { ButtonGroup, DropdownButton, MenuItem } from 'react-bootstrap'

import * as NodeType from './nodeTypes'
// console.log('NodeType', Object.keys(NodeType))

import { Nodes, Links } from './mockData'
// console.log('mockData', {nodes, links})

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
            nodeName: 16,
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

        this.newProps = {}

        this.state = {
            Nodes,
            Links: Object.assign(
                {
                    inputs: {},
                    outputs: {},
                },
                Links
            ),
            tempLink: {
                from: { x: 50, y: 50 },
                to: { x: 50, y: 50 },
            },
        }

        this.checked = {
            datasetNode: false,
        }
    }

    // create the dataset nodes if they're not exitst.
    initDatasetNode = () => {
        // TODO: should get dataset layers from props.
        const datasets = this.props.layers
        const nodes = this.state.Nodes
        console.log('initDatasetNode()', datasets)

        datasets.map((dataset, index) => {
            // console.log('dataset', dataset)

            // TODO: generate hash key for datasets.
            if (!nodes[dataset.name]) {
                const datasetNode = this.newNodeObj('DATASET')

                datasetNode.position = {
                    x: 50,
                    y: 50 + 150 * index,
                }
                datasetNode.name = dataset.name

                nodes[dataset.name] = datasetNode
            }
        })

        this.setState({ Nodes: nodes })

        return datasets.length > 0
    }

    newNodeObj = type => {
        const nodes = this.state.Nodes

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

        const newNode = {
            name: type,
            type: type,
            options: {},
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

    componentWillReceiveProps(newProps) {
        this.newProps = newProps
        // console.log(this.newProps)

        if (!this.checked.datasetNode) {
            this.checked.datasetNode = this.initDatasetNode()
        }
    }

    componentDidMount() {
        // const bodyDOM = document.body
        const vplDOM = document.querySelector('svg.vpl')
        const mouseDown$ = Rx.Observable.fromEvent(vplDOM, 'mousedown')
        const mouseUp$ = Rx.Observable.fromEvent(vplDOM, 'mouseup')
        const mouseMove$ = Rx.Observable.fromEvent(vplDOM, 'mousemove')
        const mouseLeave$ = Rx.Observable.fromEvent(vplDOM, 'mouseleave')
        // const empty$ = Rx.Observable.empty()

        this.mouseTracker$ = mouseDown$
            .map(down => {
                // console.log(down)

                const nodeDOM = down.target.closest('g.node')
                const plugDOM = down.target.closest('g.plug')
                const controlDOM = down.target.closest('g.control')
                const svgDOM = down.target.closest('svg')

                down.purpose = nodeDOM ? 'move' : 'none'

                down.purpose = plugDOM ? 'link' : down.purpose
                down.purpose = controlDOM ? 'none' : down.purpose

                switch (down.purpose) {
                    case 'move': {
                        const [x, y] = nodeDOM
                            .getAttribute('transform')
                            .match(/\d+/g)
                        down.info = { x, y, nodeDOM }
                        break
                    }
                    case 'link': {
                        down.info = { nodeDOM, plugDOM, svgDOM }
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
            .map(({ nodeKey, x, y }) => ({
                nodeKey,
                // prevent the position be set to a negative number.
                x: x < 0 ? 0 : x,
                y: y < 0 ? 0 : y,
            }))
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
                this.linkThenComputeNode()
            })
            .subscribe(observer('linkNode$'))
    }

    componentWillUnmount() {
        console.log('componentWillUnmount', 'unsubscribe observer')
        this.mouseTracker$.unsubscribe()
        this.moveNode$.unsubscribe()
        this.linkNode$.unsubscribe()
    }

    componentDidUpdate() {
        // componentDidUpdate(nextProps){
        // console.log('props changed ...', nextProps)
    }

    moveNode = ({ nodeKey, newPosition }) => {
        // console.log('moveNode()', {nodeKey, newPosition})
        const nodes = this.state.Nodes
        nodes[nodeKey].position = newPosition

        this.setState({ Nodes: nodes })
    }

    deleteNode = nodeKey => {
        console.log(`deleteNode(${nodeKey})`)

        const nodes = this.state.Nodes

        // prevent to delete dataset node.
        if (nodes[nodeKey].type == 'DATASET') {
            console.warn('deleteNode(): can not delete dataset node.')
            return false
        }

        delete nodes[nodeKey]

        const links = this.state.Links

        const toNode = nodeKey
        const srcNodes = Object.values(links.inputs[toNode] || {})
        srcNodes.map(srcNode => {
            delete links.outputs[srcNode][toNode]
        })
        delete links.inputs[toNode]

        const srcNode = nodeKey
        const toNodesToPlugs = Object.entries(links.outputs[srcNode] || {})
        toNodesToPlugs.map(([toNode, toPlug]) => {
            delete links.inputs[toNode][toPlug]
        })

        delete links.outputs[srcNode]

        this.setState({
            Nodes: nodes,
            Links: links,
        })

        // force remove the node geometry on the map.
        Action.mapRemoveGeometry(nodeKey)
        this.linkThenComputeNode()
    }

    linkNode = ({ srcNode, toNode, toInput }) => {
        console.log('linkNode()', srcNode, toNode, toInput)

        // const inputs = {
        //   [toNode]: {
        //     [toInput]: srcNode,
        //   },
        // }
        // const outputs = {
        //   [srcNode]: {
        //     [toNode]: toInput,
        //   },
        // }

        const links = this.state.Links

        // limitation of link
        if (srcNode == toNode) return console.warn('linkNode(): link same node')

        if (links.inputs[toNode] && links.inputs[toNode][toInput]) {
            console.warn('linkNode(): one input only allow one link')
            delete links.outputs[links.inputs[toNode][toInput]][toNode]
        }

        // inputs
        if (links.inputs[toNode]) {
            // delete the others same srcNode
            Object.entries(links.inputs[toNode]).map(([_toInput, _srcNode]) => {
                if (srcNode == _srcNode) delete links.inputs[toNode][_toInput]
            })

            links.inputs[toNode][toInput] = srcNode
        } else
            links.inputs[toNode] = {
                [toInput]: srcNode,
            }

        // outputs
        if (links.outputs[srcNode]) links.outputs[srcNode][toNode] = toInput
        else
            links.outputs[srcNode] = {
                [toNode]: toInput,
            }

        this.setState({ Links: links })
    }

    updateNodeOption = (nodeKey, attr, value) => {
        const nodes = this.state.Nodes
        const newValue = prompt(`Please input a value for ${attr}`, value)

        if (!_.isEmpty(newValue)) {
            console.log(
                `updated the ${value} => ${newValue} for '${attr}' of ${nodeKey}`
            )

            nodes[nodeKey].options[attr] = newValue
            this.setState({ Nodes: nodes })
            this.linkThenComputeNode()
        }
    }
    createTempLink = () => {
        return (
            <path
                markerEnd="url(#Triangle)"
                ref={ref => (this.tempLink = ref)}
                key="tempLink"
                className={'link'}
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
        return (
            <path
                style={{ cursor: 'pointer' }}
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
        const linkDOM = event.target
        const srcNode = linkDOM.getAttribute('data-src-node')
        const toNode = linkDOM.getAttribute('data-to-node')

        const links = this.state.Links

        const toPlug = links.outputs[srcNode][toNode]

        delete links.outputs[srcNode][toNode]
        delete links.inputs[toNode][toPlug]

        this.setState({ Links: links })
        this.linkThenComputeNode()
    }

    createLinks = () => {
        const outputs = this.state.Links.outputs

        const svgDOM = document.querySelector('svg.vpl')
        if (!svgDOM) return ''

        return Object.entries(outputs).map(([srcNode, input]) => {
            const svgRect = svgDOM.getBoundingClientRect()

            // const srcNodeDOM = this['node_' + srcNode]
            const outputPlugDOM = this[`${srcNode}_plug_output`]

            // console.log('srcNodeDOM', srcNodeDOM)

            return Object.entries(input).map(([toNode, inputKey]) => {
                // const toNodeDOM = this['node_' + toNode]
                const inputPlugDOM = this[`${toNode}_plug_input_${inputKey}`]

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

    linkThenComputeNode = () => {
        /*
        inputs: { // for arithmetic iterate
          // [toNode]: {
          //   [toInput]: srcNode,
          // },
          '$nodeC':{
            'Minuend': '$nodeA',
            'Subtrahend': '$nodeB',
          },
          '$nodeD':{
            'Numerator': '$nodeB',
            'Denominator': '',
          },
        },
        outputs: { // for checking the limitation of links
          // [srcNode]: {
          //   [toNode]: toInput,
          // },
          '$nodeA':{
            '$nodeC': 'Minuend',
          },
          '$nodeB':{
            '$nodeC': 'Subtrahend',
            '$nodeD': 'Numerator',
          },
        },
        */

        const nodes = this.state.Nodes
        window.nodes = nodes

        const datasetNodes = Object.entries(nodes)
            .filter(([, value]) => value.type == 'DATASET')
            .map(([key]) => key)

        const outputs = _.cloneDeep(this.state.Links.outputs)
        const inputs = _.cloneDeep(this.state.Links.inputs)

        // collect node inputs if inputs enough like node type setting
        const nodeInputsFromNode = {}

        Object.entries(inputs).map(([toNodeKey, inputsSrcNode]) => {
            const toNode = nodes[toNodeKey]
            const toNodeTypeInputs = Object.keys(NodeType[toNode.type].inputs)

            const toNodeInputs = toNodeTypeInputs.map(
                input => inputsSrcNode[input]
            )
            if (toNodeInputs.filter(f => f).length == toNodeTypeInputs.length) {
                // console.log(toNodeKey, 'enough input')
                nodeInputsFromNode[toNodeKey] = inputsSrcNode
            } else {
                // console.log(toNodeKey, 'less input')
            }
        })

        console.log({ nodeInputsFromNode })

        // getting a output Tree Structure to check the order of output.
        const nodeOutputTree = {}

        const getOutputToNode = output => {
            Object.keys(output).map(toNodeKey => {
                if (outputs[toNodeKey]) {
                    output[toNodeKey] = outputs[toNodeKey]
                    getOutputToNode(output[toNodeKey])
                } else output[toNodeKey] = true
            })
        }

        datasetNodes.map(datasetNodeKey => {
            if (outputs[datasetNodeKey]) {
                nodeOutputTree[datasetNodeKey] = outputs[datasetNodeKey]
                getOutputToNode(nodeOutputTree[datasetNodeKey])
            }
        })

        // console.log({ nodeOutputTree })

        let outputOrder = [[]]

        const getOutputOrder = (tree, depth) => {
            // console.log(`S getOutputOrder(${depth})`, tree)
            let depthNodes = []
            let deepDepth = depth + 1

            Object.entries(tree).map(([nodeKey, value]) => {
                if (nodeInputsFromNode[nodeKey]) {
                    depthNodes.push(nodeKey)
                    getOutputOrder(value, deepDepth)
                }
            })

            // console.log(`E getOutputOrder(${depth})`, tree, depthNodes)
            outputOrder[depth] = outputOrder[depth]
                ? [...outputOrder[depth], ...depthNodes]
                : [...depthNodes]
        }

        Object.entries(nodeOutputTree).map(([nodeKey, value]) => {
            outputOrder[0].push(nodeKey)
            getOutputOrder(value, 1)
        })

        outputOrder = _.uniq(_.flatten(outputOrder))
        // console.log({ outputOrder })

        window.nodeOutputTree = nodeOutputTree
        window.nodeInputsFromNode = nodeInputsFromNode
        window.outputOrder = outputOrder

        // TODO: save computed data to this state
        // TODO: refactoring this function. some node has different input order.
        const computeNodeThenAddVoxel = (node, inputNodes) => {
            const mapGeometries = this.newProps.map.geometries
            const mathFunction = NodeType[node.type].arithmetic
            const options = Object.assign(
                NodeType[node.type].options,
                node.options
            )

            let inputGeometries = inputNodes.map(index => mapGeometries[index])

            /*
            console.log(
                `computeNodeThenAddVoxel() ${node.type} ${node.nodeKey}`,
                { node, inputNodes, mapGeometries, inputGeometries, options }
            )
            */

            if (inputGeometries.filter(f => f).length == inputNodes.length)
                this.evalArithmeticNode(
                    node,
                    mathFunction,
                    options,
                    inputGeometries
                )
        }

        Object.entries(nodes).map(([nodeKey, node]) => {
            if (node.type != 'DATASET') Action.mapRemoveGeometry(nodeKey)
        })

        outputOrder.map(nodeKey => {
            const node = nodes[nodeKey]
            if (node.type != 'DATASET') {
                const inputNodes = Object.values(nodeInputsFromNode[nodeKey])
                computeNodeThenAddVoxel(node, inputNodes)
            }
        })

        return { nodeInputsFromNode, nodeOutputTree, outputOrder }
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

    evaluateNodeType = (node, geometry1, geometry2 = {}, names = []) => {
        return this.evalArithmeticNode(
            geometry1,
            geometry2,
            node,
            NodeType[node.type].arithmetic,
            names
        )
    }

    // TODO: refactoring this function. some node has different input order.
    evalArithmeticNode = (node, mathFunction, options, geometries) => {
        // evalArithmeticNode(geometry1, geometry2, node, mathFunction, names) {
        // console.log(`evalArithmeticNode()`, { node, mathFunction, geometries })
        const arraySize = geometries[0].geometry.attributes.size.count
        const hashedData = {}
        const allIndices = this.newProps.layers[0].allIndices

        const amplifier = 3

        // let transArray1 = geometry1.geometry.attributes.translation.array;
        // let transArray2 = geometry2.geometry.attributes.translation.array;
        let transArray = geometries.map(
            geometry => geometry.geometry.attributes.translation.array
        )

        // let geomArray1 = Array.from(geometry1.geometry.attributes.size.array);
        // let geomArray2 = Array.from(geometry2.geometry.attributes.size.array);
        let geomArray = geometries.map(geometry =>
            Array.from(geometry.geometry.attributes.size.array)
        )

        // let sizeArray = mathFunction(geomArray1, geomArray2);
        let sizeArray = mathFunction(geomArray, options)

        /*
        const translationArray = new Float32Array(arraySize*3);
        for (let i = 0, j = 0; j < arraySize; i = i + 3, j++){s
            translationArray[i] = this.getNotZero(transArray1[i], transArray2[i]);
            translationArray[i+1] = this.getNotZero(transArray1[i+1], transArray2[i+1]);
            translationArray[i+2] = this.getNotZero(transArray1[i+2], transArray2[i+2]);
            if (allIndices.includes(j)) {
                let hashedArray = Array(8);
                hashedArray[3] = sizeArray[j];
                hashedData[j] = hashedArray;
            }
        }
        */

        const translationArray = new Float32Array(arraySize * amplifier)
        for (let i = 0, j = 0; j < arraySize; i = i + amplifier, j++) {
            for (let k = amplifier - 1; k >= 0; k--) {
                // `.find(f=> f != 0) || 0` replace `getNotZero()`
                translationArray[i + k] =
                    transArray.map(ta => ta[i + k]).find(f => f != 0) || 0
            }

            if (allIndices.includes(j)) {
                let hashedArray = Array(8)
                hashedArray[3] = sizeArray[j]
                hashedData[j] = hashedArray
            }
        }

        let min = math.min(Array.from(sizeArray))
        let max

        if (node.type == 'DIVISION') {
            max = math.max(
                sizeArray.filter(item => item !== Number.POSITIVE_INFINITY)
            )
        } else {
            max = math.max(sizeArray)
        }

        const valDiff = geometries[0].highBnd - geometries[0].lowBnd
        const remap = function(x) {
            if (x != 0) {
                return (
                    valDiff * ((x - min) / (max - min)) + geometries[0].lowBnd
                )
            } else {
                return 0
            }
        }

        let remapOriginalSize = sizeArray.map(remap)
        let props = {
            size: remapOriginalSize,
            translation: translationArray,
        }

        let geometry = {
            minMax: this.newProps.layers[0].geojson.minMax,
            addressArray: this.newProps.map.geometries[
                Object.keys(this.newProps.map.geometries)[0]
            ].addresses,
            properties: props,
            cols: this.newProps.layers[0].rowsCols.cols,
            rows: this.newProps.layers[0].rowsCols.rows,
            bounds: this.newProps.layers[0].bounds,
            shaderText: this.newProps.layers[0].shaderText,
            n: this.newProps.layers.length + 1,
            name: node.name,
            type: node.type,
            layerName: node.nodeKey,
            // length: Math.max(geometry1.numElements, geometry2.numElements),
            length: Math.max(...geometries.map(g => g.numElements)),
            hashedData: hashedData,
            allIndices: allIndices,
            // propVals: names, // CHECK: is this necessary?
            color1: node.color,
            color2: node.color,
        }
        this.addVoxelGeometry(geometry)
    }

    decideNodeType(node) {
        // console.log(`decideNodeType()`, node)

        return this.nodeSVG(node)
    }

    nodeSVG = ({ color, name, type, nodeKey, options }) => {
        // console.log(`nodeSVG({${color}, ${name}, ${type}})`)

        //const p = {x: 0, y: 0}

        const inputs = NodeType[type].inputs
        const output = NodeType[type].output

        const typeOptions = NodeType[type].options

        // const nodeName = layerName
        const nodeName = name || NodeType[type].fullName
        const Style = style.node

        // const nodeWidth = nodeName.length > 10 ? Style.minWidth + (nodeName.length - 10) * Style.fontSize.nodeName * 0.6 : Style.minWidth // 0.6 is the font width/height ratio
        const nodeWidth = Style.minWidth
        const nodeHeight = Style.minHeight

        return (
            <g data-node-name={nodeName}>
                <rect
                    key={nodeKey}
                    className="background"
                    width={nodeWidth}
                    height={nodeHeight}
                    x="0"
                    y="0"
                    style={{ fill: '#ecf0f1', stroke: '#ccc', rx: '2px' }}
                />

                {/* input Plugs */}
                {Object.entries(inputs).map(([input, abbr], index) => (
                    <g
                        key={`${nodeKey}_plug_input_${input}`}
                        ref={ref =>
                            (this[`${nodeKey}_plug_input_${input}`] = ref)}
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

                <text
                    x={nodeWidth / 2}
                    y="25"
                    fontSize={Style.fontSize.nodeName + 'px'}
                    style={{
                        textAnchor: 'middle',
                        fontFamily: 'Monospace',
                        fill: '#536469',
                    }}
                >
                    {nodeName}
                </text>

                <g className="control">
                    {/* TODO: modify slider width */}
                    <Slider index={nodeKey} />
                    <Panel
                        color={color}
                        index={nodeKey}
                        deleteNode={() => {
                            this.deleteNode(nodeKey)
                        }}
                    />

                    {/* NODE OPTIONS */
                    Object.entries(typeOptions).map(([attr, def], index) => {
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
        const nodes = this.state.Nodes
        const nodeHashKey =
            (+new Date()).toString(32) +
            Math.floor(Math.random() * 36).toString(36)
        nodes[nodeHashKey] = this.newNodeObj(type)

        this.setState({ Nodes: nodes })
    }

    linkMarker() {
        return (
            <defs>
                <marker
                    id="Triangle"
                    viewBox="0 0 10 10"
                    refX="10"
                    refY="5"
                    markerWidth="3"
                    markerHeight="3"
                    orient="auto"
                >
                    <path d="M 0 0 L 0 10 L 10 10 L 10 0 z" />
                </marker>
            </defs>
        )
    }

    addVoxelGeometry = geometry => {
        const map = this.newProps.map.instance
        const circle = new THREE.CircleBufferGeometry(1, 20)
        const otherArray = []

        const color1 = geometry.color1
        const color2 = geometry.color2

        // let shaderContent = document.getElementById( 'fragmentShader' ).textContent;
        // shaderContent = shaderContent.replace(/1.5/g, parseFloat(1/ptDistance));

        const P = new PaintGraph.Pixels(
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
        Action.mapAddGeometry(geometry.layerName, P)
    }

    render() {
        const nodes = this.state.Nodes

        return (
            <div className="pull-right col-md-10 vplContainer">
                <div
                    style={{ position: 'absolute', right: '80px', top: '20px' }}
                    className="map-menu"
                >
                    <ButtonGroup>
                        <DropdownButton
                            title={'Add Node'}
                            id={`add-node-dropdown`}
                        >
                            {Object.entries(NodeType).map(
                                ([key, node]) =>
                                    key != 'DATASET' ? (
                                        <MenuItem
                                            key={key}
                                            onClick={() => {
                                                this.addNode(key)
                                            }}
                                        >
                                            {node.fullName + ' Node'}
                                        </MenuItem>
                                    ) : (
                                        ''
                                    )
                            )}
                        </DropdownButton>
                    </ButtonGroup>
                </div>

                <div className="row">
                    <svg
                        className="vpl"
                        ref={ref => (this.mainSvgElement = ref)}
                        width="100%"
                        height={'800px'}
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {this.linkMarker()}

                        {Object.entries(nodes).map(([key, node]) => {
                            node.name = node.name ? node.name : node.type
                            node.translate = node.position
                            node.nodeKey = key

                            return this.createNodeObject(node, key)
                        })}

                        {// do not display temp link when its `from` and `to` is the same
                        // (this.state.tempLink.from.x == this.tempLink.tempLink.to.x && this.state.tempLink.from.y == this.tempLink.tempLink.to.y)
                        JSON.stringify(this.state.tempLink.from) !=
                        JSON.stringify(this.state.tempLink.to)
                            ? this.createTempLink()
                            : ''}
                        {this.createLinks()}
                    </svg>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        nodes: state.vpl.nodes,
        links: state.vpl.links,
        map: state.map,
        layers: state.sidebar.layers,
    }
}

export default connect(mapStateToProps)(VPL)
