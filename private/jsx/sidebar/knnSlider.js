import React from 'react';
import * as act from '../store/actions';
import { connect } from 'react-redux';

class KnnSlider extends React.Component {
    constructor(props){
        super(props);
        
    }
    
    render() {
        return(
            <input
                type="range"
                min="0"                   
                max="9"                 
                step="1"                  
            />
        );
    }
}

export default KnnSlider;
