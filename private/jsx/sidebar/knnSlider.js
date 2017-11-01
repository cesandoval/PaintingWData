import React from 'react'
import { connect } from 'react-redux'

class KnnSlider extends React.Component {
    constructor(props) {
        super(props)

        this.neighborsOf = this.neighborsOf.bind(this)
        this.getKNN = this.getKNN.bind(this)
        this.randomPick = this.randomPick.bind(this)

        // this.state = {knn: 0};
        // this.changeKNN = this.changeKNN.bind(this);
    }

    componentWillReceiveProps(nprops) {
        this.layers = nprops.layers
        this.geometries = nprops.geometries

        const layersNeighbors = {}
        for (var key in this.geometries) {
            if (this.geometries.hasOwnProperty(key)) {
                layersNeighbors[key] = this.neighborsOf(this.geometries[key])
            }
        }
        this.layersNeighbors = layersNeighbors
    }

    handleSlide() {
        let numberOfNeighbors = document.getElementById('knnSlider').value
        for (var key in this.geometries) {
            if (this.geometries.hasOwnProperty(key)) {
                this.getKNN(
                    this.geometries[key],
                    key,
                    this.layersNeighbors[key],
                    numberOfNeighbors
                )
            }
        }

        if (window.renderSec) window.renderSec(0.2, 'KnnSlider')
    }

    neighborsOf(layer) {
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

    randomPick(myArray, nb_picks) {
        for (var i = myArray.length - 1; i > 1; i--) {
            var r = Math.floor(Math.random() * i)
            var t = myArray[i]
            myArray[i] = myArray[r]
            myArray[r] = t
        }
        return myArray.slice(0, nb_picks + 1)
    }

    getKNN(layer, layerName, neighbors, numberOfNeighbors) {
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

    changeKNN(e) {
        // TODO: is this function useless?

        this.setState({ knn: e.target.value })
        // for (var geo in this.props.geometries) {
        //     let geometry = this.props.geometries[geo];
        //     geometry.material.uniforms.transparency.value = parseFloat(e.target.value) / 100.0;
        // }
    }

    render() {
        return (
            <div className="knn-slider">
                <div className="row">
                    <p className="slider-name"> SMOOTHING </p>
                </div>
                <div className="row">
                    <div className="col-md-1">
                        <p className="slider-label"> 0 </p>
                    </div>
                    <div className="col-md-9">
                        <input
                            className="slider"
                            id="knnSlider"
                            type="range"
                            onChange={() => this.handleSlide()}
                            min="0"
                            max="8"
                            defaultValue="0"
                            step="1"
                        />
                    </div>
                    <div className="col-md-1">
                        <p className="slider-label"> 8 </p>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        layers: state.sidebar.layers,
        geometries: state.map.geometries,
    }
}

export default connect(mapStateToProps)(KnnSlider)
