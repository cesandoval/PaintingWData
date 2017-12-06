import * as c from '../consts'
// import * as act from '../actions';

const initialMapState = {
    instance: null,
    started: false,
    geometries: {},
    layers: [],
    optionShow: 'PCoords',
    opacity: 0.5,
}

export default (state = initialMapState, action) => {
    switch (action.type) {
        case c.SIDE_ADD_LAYERS:
            // Push new layer
            //var newLayers = state.layers.slice();
            //newLayers = newLayers.concat(action.layers);
            return Object.assign({}, state, { layers: action.layers })

        case c.MAP_ADD_INSTANCE: {
            const add = { instance: action.instance, started: true }
            return Object.assign({}, state, add)
        }
        case c.MAP_ADD_GEOMETRY: {
            const newGeos = {
                geometries: Object.assign({}, state.geometries, {
                    [action.name]: action.geometry,
                }),
            }
            return Object.assign({}, state, newGeos)
        }
        case c.MAP_REMOVE_GEOMETRY: {
            const geos = Object.assign({}, state.geometries)
            const geo = geos[action.name]
            if (geo) {
                let bufferGeo = state.instance.scene.getObjectByName(
                    action.name
                )
                state.instance.scene.remove(bufferGeo)
                if (bufferGeo instanceof THREE.Mesh) {
                    if (bufferGeo.geometry) {
                        bufferGeo.geometry.dispose()
                        bufferGeo.geometry = undefined
                    }
                    if (bufferGeo.material) {
                        if (bufferGeo.material.map) {
                            bufferGeo.material.map.dispose()
                        }
                        if (bufferGeo.material.lightMap) {
                            bufferGeo.material.lightMap.dispose()
                        }
                        if (bufferGeo.material.bumpMap) {
                            bufferGeo.material.bumpMap.dispose()
                        }
                        if (bufferGeo.material.normalMap) {
                            bufferGeo.material.normalMap.dispose()
                        }
                        if (bufferGeo.material.specularMap) {
                            bufferGeo.material.specularMap.dispose()
                        }
                        if (bufferGeo.material.envMap) {
                            bufferGeo.material.envMap.dispose()
                        }
                        bufferGeo.material.dispose()
                        bufferGeo.material = undefined
                    }
                }
                bufferGeo = null
                // geo.material.uniforms.show.value = 0.7
                delete geos[action.name]
            }
            return Object.assign({}, state, { geometries: geos })
        }
        case c.MAP_UPDATE_GEOMETRY: {
            console.log('changing....')
            const geos = Object.assign({}, state.geometries)
            const geo = geos[action.name]
            switch (action.options) {
                case 'Color': {
                    if (geo) {
                        let newLayers = state.layers.slice()
                        newLayers = newLayers.map(layer => {
                            if (layer.name == action.name) {
                                const newLayer = Object.assign({}, layer)
                                // console.log(newLayer)
                                // console.log(action.field, action.value)
                                newLayer[action.field] = action.value
                                return newLayer
                            } else {
                                return layer
                            }
                        })
                        geo.material.uniforms.startColor.value.set(action.value)
                        geo.material.uniforms.endColor.value.set(action.value)
                        if (window.renderSec)
                            window.renderSec(0.5, 'layer color')
                        const newGeos = {
                            geometries: Object.assign({}, state.geometries, {
                                [action.name]: geo,
                            }),
                        }
                        return Object.assign({}, state, newGeos, {
                            layers: newLayers,
                        })
                    } else {
                        return Object.assign({}, state, {
                            geometries: state.geometries,
                        })
                    }
                }
                case 'Opacity': {
                    if (geo)
                        geo.material.uniforms.transparency.value = action.value
                    if (window.renderSec) window.renderSec(0.5, 'layer color')
                    const newGeos = {
                        geometries: Object.assign({}, state.geometries, {
                            [action.name]: geo,
                        }),
                    }
                    return Object.assign({}, state, newGeos, {
                        opacity: action.value,
                    })
                }
            }
            return Object.assign({}, state, { geometries: state.geometries })
        }
        case c.MAP_SET_OPTION_SHOW: {
            const optionShow = { optionShow: action.option }
            return Object.assign({}, state, optionShow)
        }
        default: {
            return state
        }
    }
}
