import React from 'react';
import * as act from '../store/actions';
import { connect } from 'react-redux';

class KnnSlider extends React.Component {
    constructor(props){
        super(props);

        this.neighborsOf = this.neighborsOf.bind(this);
        this.randomPick = this.randomPick.bind(this);
    }

    componentWillReceiveProps(nprops){
        this.layers = nprops.layers;
        this.geometries = nprops.geometries; 
    }

    handleSlide(){
        // console.log(this.layers)
        // console.log(this.geometries)
        // console.log(this.props)
        let numberOfNeighbors = document.getElementById('knnSlider').value;

        for(var key in this.geometries) {
            if(this.geometries.hasOwnProperty(key)) {
                this.neighborsOf(this.geometries[key], key, numberOfNeighbors);
            }
        }

        // this.geometries.map((geometry, n)=>{
        //     this.neighborsOf(geometry, numberOfNeighbors);
        // });
    }

    neighborsOf(layer, layerName, numberOfNeighbors) {
        // TODO THIS NEEDS TO KEEP TRACK OF THE ORIGINAL VALUES SOMEHOW
        // PERHAPS THE ORIGINAL VALS CAN BE GRABBED FROM PROPS INSTEAD OF NPROPS
        // THIS MIGHT HAVE TO ALSO UPDATE THE COLOR RANGES.....
        // console.log(layerName)
        const addresses = layer.addresses;
        const currSizes = layer.geometry.attributes.size.array;

        const neighbors =  new Float32Array(layer.pxWidth * layer.pxHeight);
        const indices = [-1, 0, 1];
        const arrayM = Array.apply(null, Array(layer.pxWidth)).map(function (_, i) {return i;});
        const arrayN = Array.apply(null, Array(layer.pxHeight)).map(function (_, i) {return i;});

        let sizes = layer.geometry.attributes.size.array;
        for (let i = 0, j = 0; i < addresses.length; i = i + 3, j++) {
            let currIndex = addresses[i+2];
            
            if (numberOfNeighbors == 0) {
                neighbors[currIndex] = currSizes[currIndex];
            }
            else {
                if (numberOfNeighbors < 5) {
                    var currNeighbors = new Float32Array(5);
                } else {
                    var currNeighbors = new Float32Array(9);
                }
                let row = addresses[i];
                let col = addresses[i+1];

                let n = 0;
                let k = 0;
                for (let di = 0; di < indices.length; di++) {
                    for (let dj = 0; dj < indices.length; dj++) {
                        let wBoolean = arrayM.indexOf(col+indices[di]) >= 0;
                        let hBoolean = arrayN.indexOf(row+indices[dj]) >= 0;
                        if (numberOfNeighbors < 5) {
                            if (wBoolean == true && hBoolean == true && n%2==0) {
                                let new_index = ((col+indices[di])*layer.pxHeight)+(row+indices[dj]);
                                currNeighbors[k] = new_index;
                                k++
                            }
                        } else {
                            if (wBoolean == true && hBoolean == true) {
                                let new_index = ((col+indices[di])*layer.pxHeight)+(row+indices[dj]);
                                currNeighbors[n] = new_index;
                                n++
                            }
                        }
                        
                    }
                }

                if (numberOfNeighbors != 4 && numberOfNeighbors != 8) { 
                    var randomNeighbors = this.randomPick(currNeighbors, numberOfNeighbors);
                } else {
                    var randomNeighbors = currNeighbors; 
                }

                let totalSize = 0;
                for (let n=0; n<randomNeighbors.length; n++) {
                    totalSize += currSizes[randomNeighbors[n]];
                    
                }
                neighbors[currIndex] = totalSize/(numberOfNeighbors+1);
            }
        }
        // console.log(layer.geometry.attributes.size.array)
        let pixels = this.props.geometries[layerName];

        
        pixels.geometry.attributes.size.needsUpdate = true;
        // console.log(pixels.geometry.attributes.size.array)
        
        pixels.geometry.attributes.size.array = neighbors;
        // console.log(pixels.geometry.attributes.size.array)
        // pixels.material.uniforms.min.value = 0.006;
        // pixels.material.uniforms.max.value = .09;
    }

    randomPick(myArray,nb_picks){
        for (var i = myArray.length-1; i > 1  ; i--)
        {
            var r = Math.floor(Math.random()*i);
            var t = myArray[i];
            myArray[i] = myArray[r];
            myArray[r] = t;
        }
        return myArray.slice(0,nb_picks+1);
    }

    render() {
        return(
            <div className="knn-slider">
                <p className="layer-label"> # Nearest Neighbors </p>
                <input className="slider" 
                       id = "knnSlider"
                       type="range" 
                       onChange = {() => this.handleSlide()}
                       min="0" 
                       max="8" 
                       defaultValue="0"
                       step="1"/>
            </div>
        );
    }
}



const mapStateToProps = (state) => {
    return {
        layers:     state.sidebar.layers,
        geometries: state.map.geometries
    }
}

export default connect(mapStateToProps)(KnnSlider)
