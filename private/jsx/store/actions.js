import store from './store'
import * as t from './types'

// datasets
export const importDatasets = payload =>
    store.dispatch({
        type: t.IMPORT_DATASETS,
        ...payload,
    })

// map
export const mapInit = payload =>
    store.dispatch({
        type: t.MAP_INIT,
        ...payload,
    })

// options
export const mapSetBgStyle = payload =>
    store.dispatch({
        type: t.MAP_SET_BGSTYLE,
        ...payload,
    })

export const mapSetOpacity = payload =>
    store.dispatch({
        type: t.MAP_SET_OPACITY,
        ...payload,
    })

export const mapSetKNN = payload =>
    store.dispatch({
        type: t.MAP_SET_KNN,
        ...payload,
    })

// vpl
export const nodeAdd = payload =>
    store.dispatch({
        type: t.NODE_ADD,
        ...payload,
    })

export const nodeRemove = payload =>
    store.dispatch({
        type: t.NODE_REMOVE,
        ...payload,
    })

export const nodeUpdate = payload =>
    store.dispatch({
        type: t.NODE_UPDATE,
        ...payload,
    })

export const nodeOptionUpdate = payload =>
    store.dispatch({
        type: t.NODE_OPTION_UPDATE,
        ...payload,
    })

export const linkAdd = payload =>
    store.dispatch({
        type: t.LINK_ADD,
        ...payload,
    })

export const linkRemove = payload =>
    store.dispatch({
        type: t.LINK_REMOVE,
        ...payload,
    })

// interactions
export const setActiveNode = payload =>
    store.dispatch({
        type: t.SET_ACTIVENODE,
        ...payload,
    })

export const setLoading = payload =>
    store.dispatch({
        type: t.SET_LOADING,
        ...payload,
    })

export const setPanelShow = payload =>
    store.dispatch({
        type: t.SET_PANELSHOW,
        ...payload,
    })
