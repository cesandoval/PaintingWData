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
