import React from 'react';
import * as act from '../store/actions';
import { connect } from 'react-redux';

class OpacitySlider extends React.Component {
    constructor(props){
        super(props);
        
    }
    
    render() {
        return(
            <input
                type="range"
                min="0"                   
                max="1"                 
                step="0.01"                  
            />
        );
    }
}

export default OpacitySlider
