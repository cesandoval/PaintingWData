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
        default:
            return state
    }
}
