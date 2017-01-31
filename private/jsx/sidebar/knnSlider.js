import React from 'react';
import * as act from '../store/actions';
import { connect } from 'react-redux';

class KnnSlider extends React.Component {
    constructor(props){
        super(props);
        
        this.state = {knn: 3};
        this.changeKNN = this.changeKNN.bind(this);   
    }
    componentWillReceiveProps(nprops){
        //nprops.mapStarted
        // console.log(nprops);
    }

    changeKNN(e){
        this.setState({knn: e.target.value});
        // for (var geo in this.props.geometries) {
        //     let geometry = this.props.geometries[geo];
        //     geometry.material.uniforms.transparency.value = parseFloat(e.target.value) / 100.0;
        // }
    }
    
    
    render() {
        return(
            <div className="knn-slider">
                <div className="row">
                    <p className="layer-label"># Nearest Neighbors</p>
                </div>
                <div className="row">
                    <div className="col-md-1">
                        <p className="slider-label"> 0 </p>
                    </div>
                    <div className="col-md-9">
                        <input type="range" onChange={this.changeKNN} value={this.state.knn} min="0" max="10" step="1" /> 
                    </div>
                    <div className="col-md-1">
                        <p className="slider-label"> 1 </p>
                    </div>
                </div>
            </div>
        );
    }
}

export default KnnSlider;
