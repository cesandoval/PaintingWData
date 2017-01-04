import React from 'react';
import * as act from '../store/actions';
import { connect } from 'react-redux';

import PCoords from '../pcoords/pcoords';

class MapCanvas extends React.Component {
    constructor(props) {
        super(props);
        this.state = {layersAdded: false};
    }
    componentDidMount() {
        const gElement = document.getElementById('mapCanvas')
        const gHeight = window.innerHeight;
        const gWidth = gElement.clientWidth;
        const G = new PaintGraph.Graph(gElement, gHeight, gWidth);
        G.start();
        act.mapAddInstance(G);
    }
    componentWillReceiveProps(newProps){
        // Get layers once they appear
        // Map them to Pixels objects
        // Add the pixel geometries to the map
        if (newProps.layers.length > 0 && !this.state.layersAdded) {
            this.setState({layersAdded: true});

            newProps.layers.map((layer, n)=>{
                // Defined geometry
                const circle = new THREE.CircleBufferGeometry(1, 20);
                // Parses the layer
                const out = PaintGraph.Pixels.parseDataJSON(layer);
                // Creates the Pixels object
                const P = new PaintGraph.Pixels(this.props.map, circle, out.array, out.startColor, out.endColor, 200, 200, n);

                act.mapAddGeometry(layer.name, P);
            });
        }
    }
    render() {
        return(
            <div>
                <PCoords />
                <div className="map" id="mapCanvas"/>
            </div>
        );
    }
}

export default connect(s=> ({layers: s.sidebar.layers, map: s.map.instance}))(MapCanvas);