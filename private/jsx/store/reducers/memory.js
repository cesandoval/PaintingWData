/*
Saves the given map/options as a Datauserfile.
*/
import * as t from '../types'

const initialMapState = {
    modified: false,
}

export default (state = initialMapState, action) => {
    const modifiedRegExp = RegExp('(NODE_+)|(MAP_SET_*)|(LINK_+)')

    if (modifiedRegExp.test(action.type)) {
        console.log(action.type)
        action.type = 'modified'
    }

    switch (action.type) {
        case t.LOAD_MEMORY: {
            return Object.assign({}, state)
        }
        case t.SET_MODIFIED: {
            const { value } = action

            const modified = { modified: value }
            return Object.assign({}, state, modified)
        }
        case 'modified': {
            console.log('modified')
            const modified = { modified: true }
            return Object.assign({}, state, modified)
        }
        default:
            return state
    }
}
