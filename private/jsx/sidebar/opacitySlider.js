import React from 'react';
import * as act from '../store/actions';
import { connect } from 'react-redux';

class OpacitySlider extends React.Component {
    constructor(props){
        super(props);
        
    }
    
    render() {
        return(
            <div className="opacity-slider">
                <p className="layer-label"> Opacity </p>
                <input className="slider" type="range" min="0" max="1" step="0.01"/>
            </div>
        );
    }
}

export default OpacitySlider
