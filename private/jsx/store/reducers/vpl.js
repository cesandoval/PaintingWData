import * as consts from '../consts'

const initialState = {
    nodes: {},
    links: {
        inputs: {},
        outputs: {},
    },
    // links: {
    //     inputs: {
    //         [toNode]: {
    //             [toInput]: srcNode,
    //         },
    //     },
    //     outputs: {
    //         [srcNode]: {
    //             [toNode]: toInput,
    //         },
    //     },
    // },
}

export default (state = initialState, action) => {
    let nodes = Object.assign({}, state.nodes)
    let links = Object.assign({}, state.links)

    switch (action.type) {
        case consts.VLANG_ADD_LINK: {
            const srcNode = action.srcNode
            const toNode = action.toNode
            const toInput = action.toInput

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
                Object.entries(
                    links.inputs[toNode]
                ).map(([_toInput, _srcNode]) => {
                    if (srcNode == _srcNode)
                        delete links.inputs[toNode][_toInput]
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

            return {
                links,
                nodes: state.nodes,
            }
        }
        case consts.VLANG_REMOVE_LINK: {
            const srcNode = action.srcNode
            const toNode = action.toNode

            const toPlug = links.outputs[srcNode][toNode]

            delete links.outputs[srcNode][toNode]
            delete links.inputs[toNode][toPlug]

            return {
                links,
                nodes: state.nodes,
            }
        }

        case consts.VLANG_ADD_NODE: {
            const nodeKey = action.nodeKey

            nodes[nodeKey] = action.node

            return {
                nodes,
                links: state.links,
            }
        }
        case consts.VLANG_REMOVE_NODE: {
            const nodeKey = action.nodeKey

            // prevent to delete dataset node.
            if (nodes[nodeKey].type == 'DATASET') {
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

            return { nodes, links }
        }
        case consts.VLANG_UPDATE_NODE: {
            const nodes = Object.assign({}, state.nodes)

            const nodeKey = action.nodeKey

            nodes[nodeKey][action.attr] = action.value

            return {
                nodes,
                links: state.links,
            }
        }
        case consts.VLANG_UPDATE_NODE_OPTIONS: {
            const nodes = Object.assign({}, state.nodes)

            const nodeKey = action.nodeKey

            nodes[nodeKey].options[action.attr] = action.value

            return {
                nodes,
                links: state.links,
            }
        }

        default: {
            return state
        }
    }
}
