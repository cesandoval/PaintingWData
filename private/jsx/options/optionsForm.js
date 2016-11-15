import React from 'react';
import { connect } from 'react-redux';

class OptionsForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {grid: true, opacity: 50};

        this.gridControl = this.gridControl.bind(this);
        this.changeOpacity = this.changeOpacity.bind(this);
    }

    gridControl(e) {
        if(e.target.checked){
            this.gridOn();
            this.setState({grid: true});
        } else {
            this.gridOff();
            this.setState({grid: false});
        }
    }

    gridOn() {
        if (this.props.map.started) {
            let G = this.props.map.instance;
            G.showGrid(G.scene);
        }
    }

    gridOff() {
        if (this.props.map.started) {
            let G = this.props.map.instance;
            G.hideGrid(G.scene, G.gridHelperId);
        }
    }

    changeOpacity(e){
        this.setState({opacity: e.target.value});
        for (var geo in this.props.geometries){
            let geometry = this.props.geometries[geo];
            geometry.material.uniforms.transparency.value = parseFloat(e.target.value) / 100.0;
        }

    }

    render() {
        return(
            <div style={this.props.style} className="optionsForm">
                <div>
                    <input type="checkbox"
                        onChange={this.gridControl}
                        checked={this.state.grid} />
                    Grid
                </div>
                <div>
                    <input type="range" name="points" id="points" onChange={this.changeOpacity} value={this.state.opacity} min="0" max="100" />
                    Opacity
                </div>
            </div>
        );
    }
}

export default connect(s=>({map: s.map, geometries: s.map.geometries}))(OptionsForm);
