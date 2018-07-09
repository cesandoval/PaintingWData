import React from 'react'
import { connect } from 'react-redux'

import * as Act from '../store/actions'

import { Slider } from 'antd'

// TODO: clean and rafctor knn algorithm
class Modifications extends React.Component {
    constructor(props) {
        super(props)
    }

    componentWillReceiveProps(nprops) {
        this.geometries = nprops.geometries

        const layersNeighbors = {}

        /* use `Object.entries` to replace `for in`
        for (var key in this.geometries) {
            if (this.geometries.hasOwnProperty(key)) {
                layersNeighbors[key] = this.neighborsOf(this.geometries[key])
            }
        }
        */
        Object.entries(this.geometries).map(([key, geometry]) => {
            layersNeighbors[key] = this.neighborsOf(geometry)
        })

        this.layersNeighbors = layersNeighbors
    }

    changeKnn = e => {
        // let numberOfNeighbors = document.getElementById('knnSlider').value
        const numberOfNeighbors = e.target ? e.target.value : e

        Act.mapSetKNN({ value: numberOfNeighbors })

        /* use `Object.entries` to replace `for in`
        for (var key in this.geometries) {
            if (this.geometries.hasOwnProperty(key)) {
                this.getKNN =>=(
                    this.geometries[key],
                    key,
                    this.layersNeighbors[key],
                    numberOfNeighbors
                )
            }
        }
        */

        Object.entries(this.props.geometries).map(([key, geometry]) => {
            this.getKNN(
                geometry,
                key,
                this.layersNeighbors[key],
                numberOfNeighbors
            )
        })

        if (window.renderSec) window.renderSec(0.2, 'Modifications')
    }

    neighborsOf = layer => {
        const addresses = layer.addresses

        const neighbors = new Array(layer.pxWidth * layer.pxHeight)
        const indices = [-1, 0, 1]
        const arrayM = Array.apply(null, Array(layer.pxWidth)).map(function(
            _,
            i
        ) {
            return i
        })
        const arrayN = Array.apply(null, Array(layer.pxHeight)).map(function(
            _,
            i
        ) {
            return i
        })

        for (let i = 0, j = 0; i < addresses.length; i = i + 3, j++) {
            let currIndex = addresses[i + 2]

            var currNeighbors = new Float32Array(9)

            let row = addresses[i]
            let col = addresses[i + 1]

            let n = 0
            for (let di = 0; di < indices.length; di++) {
                for (let dj = 0; dj < indices.length; dj++) {
                    let wBoolean = arrayM.indexOf(col + indices[di]) >= 0
                    let hBoolean = arrayN.indexOf(row + indices[dj]) >= 0

                    if (wBoolean == true && hBoolean == true) {
                        let new_index =
                            (col + indices[di]) * layer.pxHeight +
                            (row + indices[dj])
                        currNeighbors[n] = new_index
                        n++
                    }
                }
            }
            neighbors[currIndex] = currNeighbors
        }
        return neighbors
    }

    randomPick = (myArray, nb_picks) => {
        for (var i = myArray.length - 1; i > 1; i--) {
            var r = Math.floor(Math.random() * i)
            var t = myArray[i]
            myArray[i] = myArray[r]
            myArray[r] = t
        }
        return myArray.slice(0, nb_picks + 1)
    }

    getKNN = (layer, layerName, neighbors, numberOfNeighbors) => {
        numberOfNeighbors = parseInt(numberOfNeighbors)
        const addresses = layer.addresses
        const currSizes = layer.geometry.attributes.originalsize.array

        const newSizes = new Float32Array(layer.pxWidth * layer.pxHeight)

        for (let i = 0, j = 0; i < addresses.length; i = i + 3, j++) {
            let currIndex = addresses[i + 2]
            if (numberOfNeighbors == 0) {
                newSizes[currIndex] = currSizes[currIndex]
            } else {
                if (numberOfNeighbors < 5) {
                    var currNeighbors = new Float32Array(5)
                } else {
                    currNeighbors = new Float32Array(9)
                }

                let allNeighbors = neighbors[currIndex]
                let n = 0
                let k = 0
                for (let di = 0; di < allNeighbors.length; di++) {
                    if (numberOfNeighbors < 5) {
                        if (di % 2 == 0) {
                            currNeighbors[k] = allNeighbors[di]
                            k++
                        }
                    } else {
                        currNeighbors[n] = allNeighbors[di]
                        n++
                    }
                }

                if (numberOfNeighbors != 4 && numberOfNeighbors != 8) {
                    var randomNeighbors = this.randomPick(
                        currNeighbors,
                        numberOfNeighbors
                    )
                } else {
                    randomNeighbors = currNeighbors
                }

                let totalSize = 0
                for (let n = 0; n < randomNeighbors.length; n++) {
                    totalSize += currSizes[randomNeighbors[n]]
                }
                newSizes[currIndex] = totalSize / (numberOfNeighbors + 1)
            }
        }
        let pixels = this.props.geometries[layerName]

        pixels.geometry.attributes.size.needsUpdate = true
        pixels.geometry.attributes.size.array = newSizes
    }

    /*
    changeKNN(e) {
        // TODO: is this function useless?

        this.setState({ knn: e.target.value })
        // for (var geo in this.props.geometries) {
        //     let geometry = this.props.geometries[geo];
        //     geometry.material.uniforms.transparency.value = parseFloat(e.target.value) / 100.0;
        // }
    }
    */

    changeOpacity(e) {
        const value = e.target ? e.target.value : e
        Act.mapSetOpacity({ value })

        if (window.renderSec) window.renderSec(0.2, 'OpacitySlider')
    }

    render() {
        const opacityMarks = {
            0: '0',
            50: '50',
            100: {
                style: {
                    color: '#000',
                },
                label: <b>100</b>,
            },
        }

        const knnMarks = {
            0: '0',
            8: {
                style: {
                    color: '#000',
                },
                label: <b>8</b>,
            },
        }

        return (
            <div id="sidebar-modifications">
                <p className="modifications-name"> OPACITY </p>
                <div className="modification-slider">
                    <Slider
                        marks={opacityMarks}
                        min={0}
                        max={100}
                        step={1}
                        onChange={this.changeOpacity}
                        value={this.props.opacity}
                    />
                </div>
                <p className="modifications-name"> INTERPOLATED </p>
                <div className="modification-slider">
                    <Slider
                        marks={knnMarks}
                        min={0}
                        max={8}
                        step={1}
                        onChange={this.changeKnn}
                        value={this.props.knn}
                    />
                </div>

                <style jsx>{`
                    .modifications-name {
                        text-align: center;
                        margin-top: 10px;
                        margin-bottom: 5px;
                        font-size: 16px;
                    }

                    .modification-slider {
                        margin: 15px;

                        :global(.ant-slider) {
                            &,
                            &:hover {
                                :global(.ant-slider-track) {
                                    background-color: #b5b5b5;
                                    transition-property: background-color, width;
                                }
                                :global(.ant-slider-handle) {
                                    border-color: #757575;
                                    transition-property: left, border-color;
                                }
                                :global(.ant-slider-dot-active) {
                                    border-color: #757575;
                                }
                            }
                        }
                    }
                `}</style>
            </div>
        )
    }
}

const mapStateToProps = s => {
    return {
        opacity: s.options.opacity,
        knn: s.options.knnValue,
        geometries: s.map.geometries,
    }
}

export default connect(mapStateToProps)(Modifications)
