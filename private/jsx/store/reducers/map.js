import * as c from '../consts';
// import * as act from '../actions';


const initialMapState = {
    instance: null,
    started: false,
    geometries: {},
    optionShow: 'PCoords'
}

export default (state=initialMapState, action) => {
    switch (action.type) {
        case c.MAP_ADD_INSTANCE: {
            const add = {instance: action.instance, started: true};
            return Object.assign({}, state, add);
        }
        case c.MAP_ADD_GEOMETRY: {
            const newGeos = {geometries: Object.assign({}, state.geometries, {[action.name]: action.geometry})};
            return Object.assign({}, state, newGeos);
        }
        case c.MAP_REMOVE_GEOMETRY: {
            const geos = Object.assign({}, state.geometries)
            const geo = geos[action.name]
            if(geo){
                geo.material.uniforms.show.value = 0.0
                delete geos[action.name]
            }
            return Object.assign({}, state, {geometries: geos});
        }
        case c.MAP_SET_OPTION_SHOW: {
            const optionShow = {optionShow: action.option}
            return Object.assign({}, state, optionShow); 
        }
        default: {
            return state;
        }
    }
}
