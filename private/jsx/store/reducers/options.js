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
        case t.IMPORT_USERFILE: {
            const { options } = action
            // Merges the options' properties together. The later arguments' properties take precedence.
            return Object.assign({}, state, options)
        }
        /**
         * Sets the bgStyle.
         * @param {Number} value The value to change the bgStyle to.
         */
        case t.MAP_SET_BGSTYLE: {
            const { value } = action
            if (typeof value == 'string') {
                const bgStyle = { bgStyle: value }
                return Object.assign({}, state, bgStyle)
            }
        }
        /**
         * Sets the opacity.
         * @param {Number} value The value to change the opacity to.
         */
        case t.MAP_SET_OPACITY: {
            console.log(state)
            const { value } = action
            if (typeof value == 'number' && 0 <= value && value <= 100) {
                const opacity = { opacity: value }
                return Object.assign({}, state, opacity)
            }
        }
        /**
         * Sets the knnValue.
         * @param {Number} value The value to change the knnValue to.
         */
        case t.MAP_SET_KNN: {
            const { value } = action
            if (typeof value == 'number' && 0 <= value && value <= 8) {
                const knnValue = { knnValue: value }
                return Object.assign({}, state, knnValue)
            }
        }
        default:
            return state
    }
}
