import store from './store';
import * as c from './consts';

export const sideAddLayer = layer => (
    store.dispatch({
        type: c.SIDE_ADD_LAYER,
        layer
    })
)

export const sideAddLayers = layers => (
    store.dispatch({
        type: c.SIDE_ADD_LAYERS,
        layers
    })
)

export const sideUpdateLayer = ( name, field, value ) => (
    store.dispatch({
        type: c.SIDE_UPDATE_LAYER,
        name,
        field,
        value
    })
)

export const sideRemoveLayer = layerName => (
    store.dispatch({
        type: c.SIDE_REMOVE_LAYER,
        layerName
    })
)

export const sideChangeOpacity = (name, opacity) => (
    store.dispatch({
        type: c.SIDE_CHANGE_OPACITY,
        name,
        opacity
    })
)


export const mapAddInstance = (map) => (
    store.dispatch({
        type: c.MAP_ADD_INSTANCE,
        instance: map
    })
)

export const mapAddGeometry = (name, geometry) => (
    store.dispatch({
        type: c.MAP_ADD_GEOMETRY,
        name,
        geometry
    })
)

export const setOptionShow = (option) => (
    store.dispatch({
        type: c.MAP_SET_OPTION_SHOW,
        option
    })
)

export const vlangAddLink = link => (
    store.dispatch({
        type: c.VLANG_ADD_LINK,
        link
    })
) 

export const vlangRemoveLink = index => (
    store.dispatch({
        type: c.VLANG_REMOVE_LINK,
        index
    })
)

export const vlangAddNode = node => (
    store.dispatch({
        type: c.VLANG_ADD_NODE,
        node
    })
)

export const vlangRemoveNode = index => (
    store.dispatch({
        type: c.VLANG_REMOVE_NODE,
        index
    })
)


export const vlangMoveNode = (index, newPosition, props)  => (
    store.dispatch({
        type: c.VLANG_UPDATE_NODE_POSITION,
        index: index,
        position: newPosition,
        props: props

    })
)

export const vlangAddLayers = layers  => (
    store.dispatch({
        type: c.VLANG_ADD_LAYERS,
        layers
    })
)


