import React from 'react';
import * as act from '../store/actions';
import { connect } from 'react-redux';

import PCoords from '../pcoords/pcoords';
import VPL from '../vprog/rVpl';

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
        // console.log(99999,G)
        if (newProps.layers.length > 0 && !this.state.layersAdded) {
            // Sets the camera to the voxels' bbox 
            const bbox = newProps.layers[0].bbox;
            const canvas = newProps.map;
            const setCamera = PaintGraph.Pixels.zoomExtent(canvas, bbox);

            const addMap = PaintGraph.Pixels.buildMapbox(this.props.map, canvas, bbox);

            this.setState({layersAdded: true});

            newProps.layers.map((layer, n)=>{
                // Defined geometry
                const circle = new THREE.CircleBufferGeometry(1, 20);
                // Parses the layer
                const out = PaintGraph.Pixels.parseDataJSON(layer);

                // Creates the Pixels object
                const P = new PaintGraph.Pixels(this.props.map, circle, out.otherArray, out.startColor, out.endColor, 
                                        layer.geojson.minMax, out.addressArray, layer.rowsCols.cols, layer.rowsCols.rows, n, layer.bounds, layer.shaderText);

                act.mapAddGeometry(layer.name, P);
            });
        }
    }
    render() {
        const mapOptionShow = this.props.mapOptionShow
        return(
            <div>
                <div style={{display: (mapOptionShow == 'VPL' ? '' : 'none')}}>
                    <VPL />
                </div>
                <div style={{display: (mapOptionShow == 'PCoords' ? '' : 'none')}}>
                    <PCoords />
                </div>
                <div className="map" id="mapCanvas"/>
                <div id="pivot"/>
                <div id="grid"/>
            </div>
        );
    }
}

export default connect(s=> ({layers: s.sidebar.layers, map: s.map.instance, mapOptionShow: s.map.optionShow}))(MapCanvas);
