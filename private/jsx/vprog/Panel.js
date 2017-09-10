import React from 'react';
import * as act from '../store/actions';
import { connect } from 'react-redux';
import $ from 'jquery';

class Panel extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            visible: true,
            color1: '#000000',
            color2: '#000000',
        }
        this.props = props

        this.changeColor = this.changeColor.bind(this);
    }

    componentWillReceiveProps(props){
        this.props = props
        console.log('[Panel] componentWillReceiveProps()', props)

        // Get geometry
        let pixels = this.props.geometries[this.props.index]

        if (pixels.material) {
            this.setState({
                color1: '#' + pixels.material.uniforms.startColor.value.getHexString(),
                color2: '#' + pixels.material.uniforms.endColor.value.getHexString(),
            })
        }

    }

    changeColor(e){
        console.log('changeColor(e)', e.target.value)

        act.sideUpdateLayer(this.props.index, e.target.name, e.target.value)

        // Get geometry
        let pixels = this.props.geometries[this.props.index]
        if (e.target.name == 'color1'){
            pixels.material.uniforms.startColor.value.set(e.target.value)
        } else {
            pixels.material.uniforms.endColor.value.set(e.target.value)
        }
    }

    render() {
        const margin0px = { margin: '0px' }
            
        return(
            <g>
                <foreignObject x={this.props.position.x + 20} y={this.props.position.y + 95} style={{cursor: 'pointer'}}>
                    <div style={{position: 'fixed', display: 'flex', width: '157px', justifyContent: 'space-around', alignItems: 'center'}}>
                        <input type="color" name="color1" value={this.state.color1} onChange={this.changeColor} />
                        <input type="color" name="color2" value={this.state.color2} onChange={this.changeColor} />
                    </div>
                </foreignObject>
            </g>
        );
    }
}

const mapStateToProps = (state) =>{
    return {nodes: state.vpl.nodes, links: state.vpl.links, map: state.map, layers: state.sidebar.layers, geometries: state.map.geometries};
};

export default connect(mapStateToProps)(Panel);