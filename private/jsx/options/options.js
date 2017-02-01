import React from 'react';

import OptionsButton from './optionsButton';
import OptionsForm  from './optionsForm';
import Button from 'react-bootstrap/lib/Button';

export default class extends React.Component {
    constructor(props){
        super(props);
        this.state = {};
    }
    showData() {

    }
    render() {
        return(
            <div className="options--react">
                <OptionsForm/>
                <Button id="show" className="buttons dataText btn buttonsText" onClick={this.showData}> Query Data </Button>
                <Button id="show" className="buttons dataText btn buttonsText" onClick={this.showData}> Compute Data </Button>
            </div>
        );
    }
}
