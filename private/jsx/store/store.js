import { createStore, combineReducers } from 'redux';

import sidebarReducer from './reducers/sidebar';
import mapReducer from './reducers/map';
import overlayReducer from './reducers/overlay';
import optionsReducer from './reducers/options';
import vpl from './reducers/vpl.js'


var reducers = combineReducers({
    vpl: vpl,
    sidebar: sidebarReducer,
    map: mapReducer,
    overlay: overlayReducer,
    options: optionsReducer
});

export default createStore(reducers);

