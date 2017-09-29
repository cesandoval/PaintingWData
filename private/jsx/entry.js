import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import store from './store/store';
import App from './app';

import Pixels from './pixels';
import Graph from './graph';
import PCoords from './pcoords/pcoords';
import Exporter from './exporter';

if (window.PaintGraph !== undefined) {
    console.error("window.PaintGraph object already exists");
} else {
    window.PaintGraph = {
        Pixels: Pixels,
        Graph: Graph,
        Exporter: Exporter
    };
}

if (module.hot) {
	module.hot.accept();
}


render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('react')
);

