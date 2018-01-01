import store from './store'
import * as c from './consts'

export const sideAddLayer = layer =>
    store.dispatch({
        type: c.SIDE_ADD_LAYER,
        layer,
    })

export const sideAddLayers = layers =>
    store.dispatch({
        type: c.SIDE_ADD_LAYERS,
        layers,
    })

export const sideUpdateLayer = (name, field, value) =>
    store.dispatch({
        type: c.SIDE_UPDATE_LAYER,
        name,
        field,
        value,
    })

export const sideRemoveLayer = layerName =>
    store.dispatch({
        type: c.SIDE_REMOVE_LAYER,
        layerName,
    })

export const sideChangeOpacity = (name, opacity) =>
    store.dispatch({
        type: c.SIDE_CHANGE_OPACITY,
        name,
        opacity,
    })

export const mapAddInstance = map =>
    store.dispatch({
        type: c.MAP_ADD_INSTANCE,
        instance: map,
    })

export const mapAddGeometry = (name, geometry) =>
    store.dispatch({
        type: c.MAP_ADD_GEOMETRY,
        name,
        geometry,
    })

export const mapRemoveGeometry = (name, geometry) =>
    store.dispatch({
        type: c.MAP_REMOVE_GEOMETRY,
        name,
        geometry,
    })

export const updateGeometry = (name, options, value, field) =>
    store.dispatch({
        type: c.MAP_UPDATE_GEOMETRY,
        name,
        options,
        value,
        field,
    })

export const mapAddLayer = layer =>
    store.dispatch({
        type: c.MAP_ADD_LAYER,
        layer,
    })

export const setOptionShow = option =>
    store.dispatch({
        type: c.MAP_SET_OPTION_SHOW,
        option,
    })

export const vlangAddLink = link =>
    store.dispatch({
        type: c.VLANG_ADD_LINK,
        link,
    })

export const vlangRemoveLink = ({ srcNode, toNode }) =>
    store.dispatch({
        type: c.VLANG_REMOVE_LINK,
        srcNode,
        toNode,
    })

export const vlangAddNode = node =>
    store.dispatch({
        type: c.VLANG_ADD_NODE,
        node,
    })

export const vlangRemoveNode = nodeKey =>
    store.dispatch({
        type: c.VLANG_REMOVE_NODE,
        nodeKey,
    })

export const vlangMoveNode = ({ nodeKey, newPosition }) =>
    store.dispatch({
        type: c.VLANG_UPDATE_NODE,
        nodeKey,
        attr: 'position',
        value: newPosition,
    })

export const vlangUpdateNodeOptions = ({ nodeKey, attr, value }) =>
    store.dispatch({
        type: c.VLANG_UPDATE_NODE_OPTIONS,
        nodeKey,
        attr,
        value,
    })

export const vlangAddLayers = layers =>
    store.dispatch({
        type: c.VLANG_ADD_LAYERS,
        layers,
    })
