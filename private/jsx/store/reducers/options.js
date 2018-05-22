import * as t from '../types'

const initialOptionsState = {
    opacity: 50, // 0 ~ 100
    knnValue: 0, // 0 ~ 8
    bgStyle: 'mapbox.light',
}

export default (state = initialOptionsState, action) => {
    switch (action.type) {
        case t.MAP_SET_BGSTYLE: {
            const { value } = action
            const bgStyle = { bgStyle: value }
            return Object.assign({}, state, bgStyle)
        }

        case t.MAP_SET_OPACITY: {
            const { value } = action
            const opacity = { opacity: value }
            return Object.assign({}, state, opacity)
        }

        case t.MAP_SET_KNN: {
            const { value } = action
            const knnValue = { knnValue: value }
            return Object.assign({}, state, knnValue)
        }

        case t.MAP_SET_PCOORDS: {
            const { value } = action
            const pcoordsValue = { pcoordsValue: value }
            return Object.assign({}, state, pcoordsValue)
        }
        default:
            return state
    }
}
