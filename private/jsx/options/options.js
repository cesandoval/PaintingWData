import React from 'react';
import { connect } from 'react-redux';

import * as act from '../store/actions';

import OptionsButton from './optionsButton';
import OptionsForm  from './optionsForm';
import OptionsMapStytle  from './optionsMapStytle';
import Button from 'react-bootstrap/lib/Button';

class Options extends React.Component {
    constructor(props){
        super(props);
        this.state = {};
        this.state.optionsMapStyleShow = false

        this.toggleOptionsMapStyleShow = this.toggleOptionsMapStyleShow.bind(this);

    }
    componentDidMount() {
        const gElement = document.getElementById('parcoords')
        // console.log(gElement);
    }
    toggleOptionShow(option) {
        console.log(`toggleOptionShow(${option})`)
        if(this.props.map.optionShow == option)
            act.setOptionShow("");
        else
            act.setOptionShow(option);
    }
    componentWillReceiveProps(newProps){
        // Get layers once they appear
        // Map them to Pixels objects
        // Add the pixel geometries to the map
        console.log(99999)
        // TODO: check this function
        if (newProps.layers && newProps.layers.length > 0 && !this.state.layersAdded) {
            // Sets the camera to the voxels' bbox 
            console.log(7474747474, newProps)
        }
    }
    toggleOptionsMapStyleShow(){
        this.setState({ optionsMapStyleShow: !this.state.optionsMapStyleShow });
        console.log('toggleOptionsMapStyleShow', this.state.optionsMapStyleShow)

    }
    render() {
        return(
            <div className="options--react">
                <OptionsForm/>
                <div id="mapStyleOptions" style={{display: (this.state.optionsMapStyleShow ? '' : 'none')}}>
                    <OptionsMapStytle/>
                </div>
                <Button id="mapStyleOptionsButton" className="buttons graphText btn buttonsText" onClick={this.toggleOptionsMapStyleShow}> Map Style </Button>
                <Button id="dataShow" className="buttons dataText btn buttonsText" onClick={()=>this.toggleOptionShow('PCoords')}> Query Data </Button>
                <Button id="graphShow" className="buttons graphText btn buttonsText" onClick={()=>this.toggleOptionShow('VPL')}> Compute Data </Button>
            </div>
        );
    }
}

export default connect(s=>({map: s.map}))(Options);
