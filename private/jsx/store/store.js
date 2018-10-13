import { createStore, combineReducers } from 'redux'

import datasets from './reducers/datasets'
import map from './reducers/map'
import options from './reducers/options'
import vpl from './reducers/vpl'
import interactions from './reducers/interactions'
import memory from './reducers/memory'
/**
 * Combines all of the Redux reducers for use in React.
 *
 * The method "createStore" is imported in "entry.js", which creates a Provider
 * component that wraps the main App component. This allows us to have access to
 * global redux variables.
 */
// Combines all of the reducers.
var reducers = combineReducers({
    datasets,
    map,
    options,
    vpl,
    interactions,
    memory,
})

// For use in entry.js.
export default createStore(reducers)
