import update from 'immutability-helper'

import * as t from '../types'

const initialMapState = {
    instance: {},
    geometries: {},
    started: false,
    loaded: false,
    bbox: {},
    getScreenshot: null,
}

// TODO: layers: don't use array, use key-value object

export default (state = initialMapState, action) => {
    switch (action.type) {
        // TODO: Fix the map parameters that are sent into this function from map.js
        case t.IMPORT_USERFILE: {
            const { saveMap } = action

            let newState = {}
            newState.bbox = saveMap
            return Object.assign({}, state)
        }

        case t.MAP_INIT: {
            const { instance, datasetsLayers } = action
            // Sets the camera to the voxels' bbox
            // const bbox = datasetsLayers[0].bbox
            const bbox = state.bbox

            // Add the map to the canvas
            PaintGraph.Pixels.buildMapbox(instance, bbox, state.getScreenshot)

            let geometries = Object.assign({}, state.geometries)

            Object.entries(datasetsLayers).map(([key, layer], index) => {
                // Defined geometry
                const circle = new THREE.CircleBufferGeometry(1, 20)
                // Parses the layer
                const out = PaintGraph.Pixels.parseDataJSON(layer)

                // Creates the Pixels object
                const P = new PaintGraph.Pixels(
                    layer.layerKey,
                    instance, // this.props.map,
                    circle,
                    out.otherArray,
                    out.startColor,
                    out.endColor,
                    layer.geojson.minMax,
                    out.addressArray,
                    layer.rowsCols.cols,
                    layer.rowsCols.rows,
                    index, // n
                    layer.bounds,
                    layer.shaderText
                )

                const geometry = P
                // act.mapAddGeometry(layer.name, P)
                geometries = Object.assign(
                    geometries,
                    mapGeometries(state).add({ key, geometry })
                )
            })

            const newState = {
                instance,
                geometries,
                started: true,
            }

            return Object.assign({}, state, newState)
        }

        case t.IMPORT_DATASETS: {
            const { datasets } = action // datasets is an Array
            const datasetLayerOne = datasets[0]
            const bbox = datasetLayerOne.Datavoxel.bbox.coordinates
            const getScreenshot = datasetLayerOne.screenshot

            return update(state, {
                bbox: { $set: bbox },
                getScreenshot: { $set: getScreenshot },
            })
        }

        /*
        case t.NODE_ADD: {
            // const { nodeKey, node } = action
            return state
        }
        */

        case t.NODE_REMOVE: {
            const { nodeKey } = action

            const geometries = mapGeometries(state).remove({ key: nodeKey })

            return update(state, { geometries: { $set: geometries } })
        }
        case t.NODE_UPDATE: {
            const { nodeKey, attr, value } = action

            const geometries = mapGeometries(state).update({
                key: nodeKey,
                attr,
                value,
            })

            return update(state, { geometries: { $set: geometries } })
        }

        case t.NODE_OUTPUT: {
            const { nodeKey, geometry } = action

            let geometries = {}

            if (geometry)
                geometries = mapGeometries(state).add({
                    key: nodeKey,
                    geometry,
                })
            else geometries = mapGeometries(state).remove({ key: nodeKey })

            return update(state, { geometries: { $set: geometries } })
        }

        case t.MAP_SET_OPACITY: {
            let { value } = action
            value = parseFloat(value) / 100.0

            let geometries = {}
            Object.keys(state.geometries).map(key => {
                const newGeometries = mapGeometries(state).update({
                    key,
                    attr: 'opacity',
                    value,
                })
                geometries = Object.assign(geometries, newGeometries)
            })

            return update(state, { geometries: { $set: geometries } })
        }

        /*
        case t.NODE_OPTION_UPDATE: {
            const { nodeKey, attr, value } = action

            return state
        }
        */

        /*
        case c.MAP_ADD_LAYER: {
            // Push new layer
            let newLayers = state.layers.slice()
            newLayers.push(action.layer)
            return Object.assign({}, state, { layers: newLayers })
        }
        */

        /*

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
            const geos = Object.assign({}, state.geometries)
            const geo = geos[action.name]

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
            switch (action.options) {
                case 'Color': {
                    if (geo) {
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

                    let newLayers = state.layers.slice()
                    newLayers = newLayers.map(layer => {
                        if (layer.name == action.name) {
                            const newLayer = Object.assign({}, layer)
                            // console.log(newLayer)
                            // console.log(action.field, action.value)
                            newLayer.visible = action.value
                            return newLayer
                        } else {
                            return layer
                        }
                    })

                    return Object.assign(
                        {},
                        state,
                        newGeos,
                        { layers: newLayers },
                        { opacity: action.value } // CHECK: set state.opacity ?
                    )
                }
                case 'Visibility': {
                    console.log(state.visible, action.name, state)
                    for (let index in state.layers) {
                        let currLayer = state.layers[index].name
                        // let currValue = state.layers[index].visible
                        if (currLayer == action.name) {
                            if (!action.value) {
                                geo.material.uniforms.show.value = 0.0
                            } else {
                                geo.material.uniforms.show.value = 1.0
                            }
                        }
                    }
                    return Object.assign({}, state, {
                        layers: newLayers,
                        visible: action.value,
                    })
                }
            }
            return Object.assign({}, state, { geometries: state.geometries })
        }
        */

        default: {
            return state
        }
    }
}

function mapGeometries(state) {
    const geometries = state.geometries

    return {
        add({ key, geometry }) {
            console.log('mapGeometry.add', state, geometry)
            return update(geometries, {
                [key]: { $set: geometry },
            })
        },
        update({ key, attr, value }) {
            console.log('mapGeometry.update', { key, attr, value })
            const geo = geometries[key]

            if (geo) {
                switch (attr) {
                    case 'color': {
                        geo.material.uniforms.startColor.value.set(value)
                        geo.material.uniforms.endColor.value.set(value)
                        break
                    }
                    case 'opacity': {
                        geo.material.uniforms.transparency.value = value
                        break
                    }
                    case 'visibility': {
                        if (!value) {
                            geo.material.uniforms.show.value = 0.0
                        } else {
                            geo.material.uniforms.show.value = 1.0
                        }
                        break
                    }
                    /* change data directly instead of updating uniforms
                    case 'filter': {
                        const { min, max } = value
                        geo.material.uniforms.min.value = min
                        geo.material.uniforms.max.value = max

                        break
                    }
                    */
                }
                return update(geometries, {
                    [key]: { $set: geo },
                })
            } else return geometries
        },
        remove({ key }) {
            console.log('mapGeometry.remove', state)
            const geo = geometries[key]

            if (geo) {
                let bufferGeo = state.instance.scene.getObjectByName(key)
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
                // delete geos[key]
            }

            return update(geometries, {
                $unset: [key],
            })
        },
    }
}
