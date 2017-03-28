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
    showData() {
        

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

