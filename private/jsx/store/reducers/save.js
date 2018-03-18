/*
Saves the given map/options as a Datauserfile.
*/
import * as t from '../types'

const initialMapState = {
    instance: {},
    geometries: {},
    started: false,
    loaded: false,
    bbox: {},
}

export default (state = initialMapState, action) => {
    switch (action.type) {
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
                body: JSON.stringify({
                    state: action.info,
                    userId: action.userId,
                    voxelId: action.voxelId,
                }),
            })
            return state
        }
        default:
            return state
    }
}
