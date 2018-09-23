/*
Saves the given map/options as a Datauserfile.
*/
import * as t from '../types'

const initialMapState = {}

export default (state = initialMapState, action) => {
    switch (action.type) {
        case t.LOAD_MEMORY: {
            return Object.assign({}, state)
        }
        default:
            return state
    }
}
