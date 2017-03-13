import React from 'react';
import { connect } from 'react-redux';

import Layers from './layers';
import NodeTypes from './nodetypes'
import * as act from '../store/actions';
import OpacitySlider from './opacitySlider';
import KnnSlider from './knnSlider';

const initFields = [
    {
        field: <Layers />,
        name: "Layers",
        show: true
    },
    // {
    //     field: <NodeTypes />,
    //     name: "Node Types",
    //     show: false
    // },
]

// Binding onClick makes it easy to figure out which
// field name was clicked
const SurroundBox = ({ child, name, show, onClick }) => (
    <div className="sidebar__box">
        <div className="sidebar__box--name" onClick={onClick.bind(null, name)} name={name}>
            {name}
        </div>
        {show && child}
    </div>
)

export default class Sidebar extends React.Component {
    constructor(props){
        super(props);
        this.state = {showing: 'Layers', fields: initFields};
        this.changeView = this.changeView.bind(this);
        this.onClick=this.onClick.bind(this);
        
    }
    changeView(layer) {
        this.setState({showing: layer})
    }
    onClick(name) {
        // Create new fields object
        // setting only field which was clicked
        // as true
        const newFields = this.state.fields.map(f=>(
            Object.assign({}, f, {show: name==f.name})
        ));
        this.setState({fields: newFields});
    }
    render() {
        return(
            <div className="sidebar">
                {this.state.fields.map(({field, name, show}) => (
                    <SurroundBox
                        key={name}
                        child={field}
                        name={name}
                        show={show}
                        onClick={this.onClick}
                    />
                ))}
                <div className="sliders">
                    <OpacitySlider> </OpacitySlider>
                    <KnnSlider> </KnnSlider>
                </div>
            </div>
        );
    }
}
