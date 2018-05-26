import _ from 'lodash'
import update from 'immutability-helper'

import * as t from '../types'

const initialState = {
    nodes: {},
    links: {
        inputs: {},
        outputs: {},
    },
}
/* data schema
    nodes: {
        [node$key]: {
        color: #112233,
        visibility: true,
        filter: [0.2, 0.9],
        options: {
            [optionAttr]: [optionValue],
        }
        outputs: { dataArray }
        }
    },
    links: {
        inputs: {
            [toNode]: {
                [toInput]: srcNode,
            },
        },
        outputs: {
            [srcNode]: {
                [toNode]: toInput,
            },
        },
    },
*/

export default (state = initialState, action) => {
    let nodes = _.cloneDeep(state.nodes)
    let links = _.cloneDeep(state.links)

    switch (action.type) {
        case t.NODE_ADD: {
            const { nodeKey, node } = action

            return update(state, {
                nodes: {
                    [nodeKey]: { $set: node },
                },
            })
        }
        case t.NODE_REMOVE: {
            const { nodeKey } = action

            // prevent to delete dataset node.
            if (state.nodes[nodeKey].type == 'DATASET') {
                console.warn('deleteNode(): can not delete dataset node.')
                return state
            }

            delete nodes[nodeKey]

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

            return update(state, {
                nodes: {
                    $set: nodes,
                },
                links: {
                    $set: links,
                },
            })
        }
        case t.NODE_UPDATE: {
            const { nodeKey, attr, value } = action
            return update(state, {
                nodes: {
                    [nodeKey]: {
                        [attr]: {
                            $set: value,
                        },
                    },
                },
            })
        }
        case t.NODE_OPTION_UPDATE: {
            const { nodeKey, attr, value } = action

            return update(state, {
                nodes: {
                    [nodeKey]: {
                        options: {
                            [attr]: {
                                $set: value,
                            },
                        },
                    },
                },
            })
        }
        case t.LINK_ADD: {
            const { srcNode, toNode, toInput } = action

            // limitation of link
            if (srcNode == toNode) {
                console.warn('linkNode(): link same node')
                return state
            }

            if (links.inputs[toNode] && links.inputs[toNode][toInput]) {
                console.warn('linkNode(): one input only allow one link')
                delete links.outputs[links.inputs[toNode][toInput]][toNode]
            }

            for (
                let checkNodes = new Set(
                    Object.keys(links.outputs[toNode] || [])
                );
                checkNodes.size != 0;

            ) {
                if ([...checkNodes].find(f => f === srcNode)) {
                    console.warn('linkNode(): checking link loop error.')
                    return state
                }

                ;[...checkNodes].map(node => {
                    Object.keys(links.outputs[node] || {}).map(toNode => {
                        checkNodes.add(toNode)
                    })
                    checkNodes.delete(node)
                })
            }

            // inputs
            if (links.inputs[toNode]) {
                // delete the others same srcNode
                Object.entries(links.inputs[toNode]).map(
                    ([_toInput, _srcNode]) => {
                        if (srcNode == _srcNode)
                            delete links.inputs[toNode][_toInput]
                    }
                )

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

            return update(state, {
                links: {
                    $set: links,
                },
            })
        }
        case t.LINK_REMOVE: {
            const { srcNode, toNode } = action

            const toPlug = links.outputs[srcNode][toNode]

            delete links.outputs[srcNode][toNode]
            delete links.inputs[toNode][toPlug]

            return update(state, {
                links: {
                    $set: links,
                },
            })
        }

        case t.MAP_SET_OPACITY: {
            let { value } = action
            value = parseFloat(value) / 100.0

            Object.keys(nodes).map(key => {
                nodes = update(nodes, { [key]: { opacity: { $set: value } } })
            })

            console.log('VPL t.MAP_SET_OPACITY', { nodes })
            return update(state, { nodes: { $set: nodes } })
        }

        default:
            return state
    }
}
