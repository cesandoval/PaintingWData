import React from 'react';
import { connect } from 'react-redux';

class OptionsForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {grid: true};

        this.gridControl = this.gridControl.bind(this);
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

    render() {
        return(
            <div style={this.props.style} className="optionsForm">
                <div>
                    <input type="checkbox"
                        onChange={this.gridControl}
                        checked={this.state.grid} />
                    Grid
                </div>
            </div>
        );
    }
}

export default connect(s=>({map: s.map, geometries: s.map.geometries}))(OptionsForm);
