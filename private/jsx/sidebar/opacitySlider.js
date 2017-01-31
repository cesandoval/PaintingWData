import React from 'react';
import * as act from '../store/actions';
import { connect } from 'react-redux';

class OpacitySlider extends React.Component {
    constructor(props){
        super(props);
        this.state = {opacity: 40};

        this.changeOpacity = this.changeOpacity.bind(this);
    }

    changeOpacity(e){
        this.setState({opacity: e.target.value});
        for (var geo in this.props.geometries) {
            let geometry = this.props.geometries[geo];
            geometry.material.uniforms.transparency.value = parseFloat(e.target.value) / 100.0;
        }
    }
    
    render() {
        return(
            <div className="opacity-slider">
                <div className="row">
                    <p className="layer-label"> Opacity </p>
                </div>
                <div className="row">
                    <div className="col-md-1">
                        <p className="slider-label"> 0 </p>
                    </div>
                    <div className="col-md-9">
                        <input type="range" name="points" id="points" onChange={this.changeOpacity} value={this.state.opacity} min="0" max="100" /> 
                    </div>
                    <div className="col-md-1">
                        <p className="slider-label"> 100 </p>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(s=>({map: s.map, geometries: s.map.geometries}))(OpacitySlider);
