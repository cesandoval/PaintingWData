import * as c from '../consts';


const initialSidebarState = {
    layers: [],
    opacity: 0.50
}

export default (state=initialSidebarState, action) => {
    switch (action.type) {

        case c.SIDE_ADD_LAYER: {
            // Push new layer
            let newLayers = state.layers.slice();
            newLayers.push(action.layer);
            return Object.assign({}, state, {layers: newLayers});
        }
        case c.SIDE_ADD_LAYERS:
            // Push new layer
            //var newLayers = state.layers.slice();
            //newLayers = newLayers.concat(action.layers);
            return Object.assign({}, state, {layers: action.layers});

        case c.SIDE_UPDATE_LAYER: {
            if(window.renderSec)
                window.renderSec(1, 'reducer SIDE_UPDATE_LAYER')
            
            let newLayers = state.layers.slice();
            newLayers = newLayers.map(layer => {
                if (layer.name == action.name) {
                    const newLayer = Object.assign({}, layer);
                    newLayer[action.field] = action.value;
                    return newLayer;
                } else {
                    return layer;
                }
            });
            // console.log("Object: ", Object.assign({}, state, {layers: newLayers}));
            return Object.assign({}, state, {layers: newLayers});
        }
        case c.SIDE_REMOVE_LAYER: // just fall through for now.
            // var newLayers = state.layers.map(layer => (
            //     // Remove layers with the same name

            //     layer.name == action.layerName
            // ));
            
            return state;

        case c.SIDE_CHANGE_OPACITY:
            console.assert(Number.isFinite(action.opacity),
                'requires finite opacity');
            console.assert(action.opacity <= 1.00 && action.opacity >= 0.0,
                'requires 0 <= opacity <= 1.00');
            return Object.assign({}, state, {opacity: action.opacity})

        default:
            return state;

    }
}
