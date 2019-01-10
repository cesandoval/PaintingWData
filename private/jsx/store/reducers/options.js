import * as t from '../types'

const initialOptionsState = {
    opacity: 50, // 0 ~ 100
    knnValue: 0, // 0 ~ 8
    bgStyle: 'mapbox.light',
}

export default (state = initialOptionsState, action) => {
    switch (action.type) {
        /**
         * Imports a saved userfile (i.e. one with saved options)
         * @param {Object} options An Object containing bgStyle, opacity and knnValue properties
         * from the saved userfile.
         */
        case t.LOAD_MEMORY: {
            const { options } = action
            return Object.assign({}, state, options)
        }
        /**
         * Sets the bgStyle.
         * @param {Number} value The value to change the bgStyle to.
         */
        case t.MAP_SET_BGSTYLE: {
            const { value } = action
            const bgStyle = { bgStyle: value }
            return Object.assign({}, state, bgStyle)
        }
        /**
         * Sets the opacity.
         * @param {Number} value The value to change the opacity to.
         */
        case t.MAP_SET_OPACITY: {
            const { value } = action
            const opacity = { opacity: value }
            return Object.assign({}, state, opacity)
        }
        /**
         * Sets the knnValue.
         * @param {Number} value The value to change the knnValue to.
         */
        case t.MAP_SET_KNN: {
            const { value } = action
            const knnValue = { knnValue: value }
            return Object.assign({}, state, knnValue)
        }
        default:
            return state
    }
}
