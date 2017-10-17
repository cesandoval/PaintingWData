import * as consts from '../consts';

const initialState = {
    nodes: [],
    links: []
    // nodes: [node1, node2, node3, node4],
    // links: [link1, link2, link3]
}


export default (state=initialState, action) => {
    if(window.renderSec)
        window.renderSec(1, 'vpl reducers') 

    switch (action.type) {
        case consts.VLANG_ADD_LINK:
            return {               
                nodes: [...state.nodes],
                links: [
                    ...state.links,
                    action.link
                ]    
            };
        case consts.VLANG_REMOVE_LINK:
            
            var newState = {               
                nodes: [...state.nodes],
                links: [
                    ...state.links.slice(0, action.index),
                    ...state.links.slice(action.index+1),
                ]    
            };
            return newState;
            
        case consts.VLANG_ADD_NODE:
            return {               
                    nodes: [
                        ...state.nodes,
                        action.node
                    ],
                    links: [
                        ...state.links,
                    ]    
                };
        case consts.VLANG_REMOVE_NODE: {
            let newLinks = [] 
            state.links.map((link) => {
                if(!(link.sourceNode.ref === state.nodes[action.index].ref || 
                   link.targetNode.ref === state.nodes[action.index].ref)){
                    newLinks.push(link);
                }
               
            })
            return {               
                    nodes: [
                        ...state.nodes.slice(0, action.index),
                        ...state.nodes.slice(action.index+1),
                    ],
                    links: newLinks
                };
            }
        case consts.VLANG_UPDATE_NODE_POSITION: {
            let newNode = state.nodes[action.index];

            newNode.translate = action.position
            newNode.name = action.props[action.index].name
            newNode.userLayerName = action.props[action.index].userLayerName
            newNode.property = action.props[action.index].property

            return  {
                 nodes: [
                       ...state.nodes.slice(0, action.index),
                       newNode,
                       ...state.nodes.slice(action.index+1),
                    ],
                    links: [
                        ...state.links,
                    ]    
            };
        }
        case consts.VLANG_ADD_LAYERS: {
            let allNodes = []
            action.layers.map((layer, index) => {
                let nodeIndex = "node_"+parseInt(parseInt(index)+1);
                let currNode = { ref: nodeIndex, type: consts.LAYER_NODE, position: {x:100, y:100+150*index}, translate: {x: 0, y: 0}, name:layer.name, userLayerName:layer.userLayerName, property:layer.property};
                allNodes[index] = currNode;
            })
            return {
                nodes: allNodes,
                links: []
            }
        }

        default: {
            return state;
        }
    }
}

