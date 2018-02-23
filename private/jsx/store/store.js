import { createStore, combineReducers } from 'redux'

import datasets from './reducers/datasets'
import map from './reducers/map'
import options from './reducers/options'
import vpl from './reducers/vpl'
import interactions from './reducers/interactions'

var reducers = combineReducers({
    datasets,
    map,
    options,
    vpl,
    interactions,
})

export default createStore(reducers)
