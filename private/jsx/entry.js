import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import store from './store/store'
import App from './app'

import Pixels from './pixels'
import Graph from './graph'
import Exporter from './exporter'

/**
 * The main entry point for the mapping service.
 *
 * Contains the App component, which contains the (1) map service
 * and (2) options. The map visualizes geo-spatial data by breaking areas down
 * into "voxels", which are concentric circles of different colors representing
 * various data, such as median income, asthma rates, home values, and so on.
 * The options can be configured to change the map theme, to change the opacity,
 * and even create logic gates to do as is needed for manipulating the data.
 *
 * @author PaintingWithData
 */

// Defines the PaintGraph namespace.
if (window.PaintGraph !== undefined) {
    console.error('window.PaintGraph object already exists')
} else {
    /**
     * The PaintGraph namespace contains various helper methods for
     * map rendering, from three classes: Pixels, Graph and Exporter.
     *
     * @namespace PaintGraph
     *
     * @property class Pixels TODO.
     * @property class Graph TODO.
     * @property class Exporter TODO
     */
    window.PaintGraph = {
        Pixels: Pixels,
        Graph: Graph,
        Exporter: Exporter,
    }
}
/*
 * Under the Hot Module Replacement (HMR) protocol, we accept any updated webpack
 * modules.
 */
if (module.hot) {
    module.hot.accept()
}
/*
 * Renders the App component, which has the main meat of the mapping service. Also
 * sets up the Redux stores, which contain "global" state variables for the whole
 * ecosystem.
 */
render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('react')
)
