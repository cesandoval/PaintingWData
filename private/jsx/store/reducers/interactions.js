import * as t from '../types'

const initialInteractionsState = {
    loading: true,
    panelShow: 'PCoords', // 'VPL' or 'PCoords' or Null or 'Chart:Density or 'Chart:Bar' or 'Chart:Scatter.
    activeNode: '',
    refreshVoxels: false,
}

export default (state = initialInteractionsState, action) => {
    switch (action.type) {
        case t.SET_LOADING: {
            const { value } = action
            if (typeof value == 'boolean') {
                const loading = { loading: value }
                return Object.assign({}, state, loading)
            }
            break
        }
        case t.SET_PANELSHOW: {
            const { value } = action
            if (typeof value == 'string') {
                const panelShow = { panelShow: value }
                return Object.assign({}, state, panelShow)
            }
            break
        }
        case t.SET_ACTIVENODE: {
            const { value } = action
            if (value != null) {
                const activeNode = { activeNode: value }
                return Object.assign({}, state, activeNode)
            }
            break
        }
        case t.SET_REFRESHVOXELS: {
            const { value } = action
            if (typeof value == 'boolean') {
                const refreshVoxels = { refreshVoxels: value }
                return Object.assign({}, state, refreshVoxels)
            }
            break
        }
        default:
            return state
    }
}
