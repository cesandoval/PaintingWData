import * as t from '../types'

const initialOptionsState = {
    opacity: 50, // 0 ~ 100
    knnValue: 0, // 0 ~ 8
    bgStyle: 'mapbox.light',
}

export default (state = initialOptionsState, action) => {
    switch (action.type) {
        case t.IMPORT_USERFILE: {
            const { data } = action
            const { options } = data

            return Object.assign({}, state, options)
        }

        case t.MAP_SET_BGSTYLE: {
            const { value } = action
            const bgStyle = { bgStyle: value }
            return Object.assign({}, state, bgStyle)
        }

        case t.MAP_SET_OPACITY: {
            console.log(state)
            const { value } = action
            const opacity = { opacity: value }
            return Object.assign({}, state, opacity)
        }

        case t.MAP_SET_KNN: {
            const { value } = action
            const knnValue = { knnValue: value }
            return Object.assign({}, state, knnValue)
        }
        default:
            return state
    }
}
