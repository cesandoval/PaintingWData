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
        case t.SAVE_USERFILE: {
            //const { instance, info } = action

            fetch('/saveuserfile/', {
                //Important: I don't know why this isn't authenticating, but I'll ask Carlos...
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(action),
            })
            return Object.assign({}, state)
        }
        default:
            return state
    }
}
