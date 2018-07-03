import reducer from '../../private/jsx/store/reducers/interactions.js'
import * as t from '../../private/jsx/store/types'
import axios from 'axios'

describe('REDUCER \"interactions.js\"', () => {
    it('should ', () => {
        expect(
            axios.
        ).toEqual(
            reducer(undefined, {
                type: t.SET_LOADING,
                value: false,
            })
        )
    })
})

fetchDatajson(){
    axios
        .get('/datajson/all/' + datavoxelId, { options: {} })
        .then(({ data }) => {
            /*
            * "data" is an array of "datasets", which contain important voxel information.
            * For each "dataset" in "data", add the "layerKey" property if it doesn't exist.
            */
            let datasets = data.map(dataset => {
                // The hash function.
                const hashKey =
                    (+new Date()).toString(32) +
                    Math.floor(Math.random() * 36).toString(36)
                if (!dataset.layerKey) {
                    dataset.layerKey = hashKey
                }
                return dataset
            })
            // With "datasets", we'll add a transformed version of this to the Redux state.
            return datasets;
        })
}