import React from 'react';

import OptionsButton from './optionsButton';
import OptionsForm  from './optionsForm';
import Button from 'react-bootstrap/lib/Button';

const openedStyle = {
    height:'20em',
    width:'20em',
    padding:'1em'
}

export default class extends React.Component {
    constructor(props){
        super(props);
        this.state = {style: openedStyle};
        this.resize = this.resize.bind(this);
    }
    resize() {
        this.setState({style: openedStyle});
    }
    render() {
        return(
            <div className="options--react">
                <OptionsForm style={this.state.style} />
                <OptionsButton onClick={this.resize} down={this.state.style.width=='20em'}/>
                <Button id="show" className="buttons dataText btn buttonsText"> Data </Button>
            </div>
        );
    }
}
