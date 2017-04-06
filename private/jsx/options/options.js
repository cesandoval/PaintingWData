import React from 'react';

import OptionsButton from './optionsButton';
import OptionsForm  from './optionsForm';
import OptionsMapStytle  from './optionsMapStytle';
import Button from 'react-bootstrap/lib/Button';

export default class extends React.Component {
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

    showData() {
        // console.log(this.refs.email)
        console.log(58585858585)
        // console.log(this)
        // console.log(props)
    }

    componentWillReceiveProps(newProps){
        // Get layers once they appear
        // Map them to Pixels objects
        // Add the pixel geometries to the map
        console.log(99999)
        if (newProps.layers.length > 0 && !this.state.layersAdded) {
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
                <Button id="dataShow" className="buttons dataText btn buttonsText" onClick={this.showData}> Query Data </Button>
                <Button id="graphShow" className="buttons graphText btn buttonsText" onClick={this.showData}> Compute Data </Button>
            </div>
        );
    }
}

