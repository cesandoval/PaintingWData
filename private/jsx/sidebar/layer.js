import React from 'react';
import * as act from '../store/actions';
import { connect } from 'react-redux';

class Layer extends React.Component {
    constructor(props){
        super(props);
        this.changeVisibility = this.changeVisibility.bind(this);
        this.changeColor = this.changeColor.bind(this);
        this.handleCheckedEvent = this.handleCheckedEvent.bind(this);
    }
    changeVisibility(e) {
        act.sideUpdateLayer(this.props.name, 'visible', e.target.checked);
        act.sideRemoveLayer(this.props.name);
        // Get geometry
        let pixels = this.props.geometries[this.props.name]
        // Change Size
        if (!e.target.checked){
            pixels.material.uniforms.show.value = 0.0;
        } else {
            pixels.material.uniforms.show.value = 1.0;
        }
    }
    handleCheckedEvent(e) {
        this.changeVisibility(e);
        // var layerName = this.props.name;
        // act.sideRemoveLayer(layerName);
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
                <div className="row">
                    <div className="col-md-6">
                        <p className="sans small">{this.props.name}</p>
                    </div>
                    <div className="col-md-6">
                        <input type="checkbox" checked={this.props.visible} onChange={this.handleCheckedEvent} name={this.props.name}/>
                        <input type="color" name="color1" value={this.props.color1} onChange={this.changeColor} />
                        <input type="color" name="color2" value={this.props.color2} onChange={this.changeColor} />
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        geometries: state.map.geometries
    };
}
export default connect(mapStateToProps)(Layer);
