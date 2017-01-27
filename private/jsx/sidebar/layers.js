import React from 'react';
import { connect } from 'react-redux';
import * as act from '../store/actions';
import axios from 'axios';

import Layer from './layer';
import OpacitySlider from './opacitySlider';
import KnnSlider from './knnSlider';

const createLayer = (name, visible, color1='#00ff00', color2='#0000ff', geojson=[]) => ({
    name, visible, color1, color2, geojson
})

class Layers extends React.Component {
    constructor(props){
        console.log("================= layers");
        super(props);
        this.getLayers = this.getLayers.bind(this);
        this.getLayers();
    }
    // Assumes that geojson will be nonzero size
    getLayers() {
        // TODO Change this when migrate to actual code
        axios.get('/datajson/all/'+ datavoxelId, {options: {}})
            .then(({ data })=>{  
                act.sideAddLayers(data.map(l => {
                    const length = l.geojson.geojson.features.length;
                    
                    // Will hold a transoformed geojson
                    const transGeojson = {
                        name: l.geojson.layername,
                        type: l.geojson.geojson.features[0].geometry.type,
                        length: length,
                        data: Array(Math.floor(Math.sqrt(length)))
                    }
                    // geojson -> Float32Array([x, y, z, w, id])
                    // Map Geojson data to matrix index
                    const mappedGeojson = l.geojson.geojson.features.map(g => {
                        // Shouldn't need to parse
                        //const coords = g.geometry.coodinates.map(a=>(parseFloat(a)))
                        const coords = g.geometry.coordinates;
                        const id = parseFloat(g.id);
                        const weight = parseFloat(g.properties[l.layername]);
                        return new Float32Array([coords[0], coords[1], 0, weight, 1]);
                    });
                    mappedGeojson.sort();
                    for (let i = 0; i < Math.floor(Math.sqrt(length)); i++){
                        let j = i * 200;
                        transGeojson.data[i] = mappedGeojson.slice(j, j+200);
                    }

                    return createLayer(l.layername, true, l.color1, l.color2, transGeojson);
                }));
            });
    }
    render() {
        return(
            <div className="layers">
                {this.props.layers.map((layer, i)=>( 
                    <Layer
                        key={i}
                        name={layer.name}
                        visible={layer.visible}
                        color1={layer.color1}
                        color2={layer.color2}
                    />
                ))}
                <OpacitySlider> </OpacitySlider>
                <KnnSlider></KnnSlider>
            </div>
        );
    }
}

export default connect(s=>({layers: s.sidebar.layers}))(Layers);
