import store from './store'
import * as t from './types'

// datasets
export const importDatasets = payload =>
    store.dispatch({
        type: t.IMPORT_DATASETS,
        ...payload,
    })

export const loadTableData = payload =>
    store.dispatch({
        type: t.LOAD_TABLE_DATA,
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

export const nodeOutput = payload =>
    store.dispatch({
        type: t.NODE_OUTPUT,
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

export const setRefreshVoxels = payload =>
    store.dispatch({
        type: t.SET_REFRESHVOXELS,
        ...payload,
    })

// memory
export const setModified = payload =>
    store.dispatch({
        type: t.SET_MODIFIED,
        ...payload,
    })

export const loadMemory = payload =>
    store.dispatch({
        type: t.LOAD_MEMORY,
        ...payload,
    })
