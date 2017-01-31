import React from 'react';
import * as act from '../store/actions';
import { connect } from 'react-redux';

class KnnSlider extends React.Component {
    constructor(props){
        super(props);
        
    }

    componentWillReceiveProps(nprops){
      // you will get the layers by doing nprops.layers
      console.log("this is a layer: ", nprops.layers)
    }

    handleSlide(){
          console.log(document.getElementById('knnSlider').value)
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
                       max="10" 
                       step="1"/>
            </div>
        );
    }
}



const mapStateToProps = (state) => {
    return {
        layers:     state.sidebar.layers,
    }
}

export default connect(mapStateToProps)(KnnSlider)
