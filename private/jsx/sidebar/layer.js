import React from 'react';
import * as act from '../store/actions';
import { connect } from 'react-redux';

class Layer extends React.Component {
    constructor(props){
        super(props);
        this.changeVisibility = this.changeVisibility.bind(this);
        this.changeColor = this.changeColor.bind(this);
    }
    changeVisibility(e) {
        act.sideUpdateLayer(this.props.name, 'visible', e.target.checked);

        // Get geometry
        let pixels = this.props.geometries[this.props.name]
        // Change Size
        if (!e.target.checked){
            pixels.material.uniforms.show.value = 0.0;
        } else {
            pixels.material.uniforms.show.value = 1.0;
        }
    }
    changeColor(e){
        act.sideUpdateLayer(this.props.name, e.target.name, e.target.value);

        // Get geometry
        let pixels = this.props.geometries[this.props.name]
        if (e.target.name == 'color1'){
            pixels.material.uniforms.startColor.value.set(e.target.value)
        } else {
            pixels.material.uniforms.endColor.value.set(e.target.value)
        }
    }
    render() {
        return(
            <div className="layers__single">
                <h4>{this.props.name}</h4>
                <input type="checkbox" checked={this.props.visible} onChange={this.changeVisibility} name={this.props.name}/>
                <input type="color" name="color1" value={this.props.color1} onChange={this.changeColor} />
                <input type="color" name="color2" value={this.props.color2} onChange={this.changeColor} />
            </div>
        );
    }
}

export default connect(s=>({geometries: s.map.geometries}))(Layer);