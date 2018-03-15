/*
Saves the given map/options as a Datauserfile
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
            var sample_json = {
                //to be replaced with the necessary givens.
                foo: 'bar',
            }
            fetch('/saveuserfile/', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sample_json),
            })
            return state
        }
        default:
            return state
    }
}
