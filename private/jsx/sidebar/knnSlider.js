import React from 'react';
import * as act from '../store/actions';
import { connect } from 'react-redux';

class KnnSlider extends React.Component {
    constructor(props){
        super(props);
        
    }
    
    render() {
        return(
            <div className="knn-slider">
                <p className="layer-label"> # Nearest Neighbors </p>
                <input type="range" min="0" max="0" step="1"/>
            </div>
        );
    }
}

export default KnnSlider;