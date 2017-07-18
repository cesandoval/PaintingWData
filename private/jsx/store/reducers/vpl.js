import * as consts from '../consts';
import * as Action from '../actions';

let node1 = { ref: "node_1", type: consts.LAYER_NODE, position: {x:100, y:100}, translate: {x: 0, y: 0}};
let node2 = { ref: "node_2", type: consts.MULTIPLICATION_NODE, position: {x:400, y:50}, translate: {x: 0, y: 0}};

let node3 = { ref: "node_3", type: consts.OR_NODE, position: {x:400, y:200},translate: {x: 0, y: 0}};
let node4 = { ref: "node_4", type: consts.NOT_NODE, position: {x:400, y:350}, translate: {x: 0, y: 0}};

// get adjusted position
const pos = (node) => (
        { 
            x : node.position.x  + node.translate.x,
            y : node.position.y  + node.translate.y
        }
);




let link1  = { ref: "link_1", sourceNode: node1, targetNode: node2, source: pos(node1), target: pos(node2), type: "TOP"}; 
let link2  = { ref: "link_2", sourceNode: node1, targetNode: node3, source: pos(node1), target: pos(node3), type: "TOP"}; 
let link3  = { ref: "link_3", sourceNode: node1, targetNode: node4, source: pos(node1), target: pos(node4), type: "TOP"}; 

const initialState = {
    nodes: [],
    links: []
    // nodes: [node1, node2, node3, node4],
    // links: [link1, link2, link3]
}


export default (state=initialState, action) => {
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
        case consts.VLANG_REMOVE_NODE:
            let newLinks = [] 
            state.links.map((link, index) => {
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
        case consts.VLANG_UPDATE_NODE_POSITION:
            let oldNode = state.nodes[action.index];
            let newNode = { ref: oldNode.ref, type: oldNode.type, position: oldNode.position, translate: action.position,  name: action.props[action.index].name, userLayerName:action.props[action.index].userLayerName, property:action.props[action.index].property };

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
        case consts.VLANG_ADD_LAYERS:
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

        default:
            return state;

    }
}

