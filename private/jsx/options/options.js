import React from 'react';

import OptionsButton from './optionsButton';
import OptionsForm  from './optionsForm';

const openedStyle = {
    height:'20em',
    width:'20em',
    padding:'1em'
}

const closedStyle = {
    height:'2em',
    width:'2em',
    padding:'0em'
}

export default class extends React.Component {
    constructor(props){
        super(props);
        this.state = {style: closedStyle};
        this.resize = this.resize.bind(this);
    }
    resize() {
        if (this.state.style.width == '20em'){
            this.setState({style: closedStyle})
        } else {
            this.setState({style: openedStyle})
        }
    }
    render() {
        return(
            <div className="options--react">
                <OptionsForm style={this.state.style} />
                <OptionsButton onClick={this.resize} down={this.state.style.width=='20em'}/>
            </div>
        );
    }
}
