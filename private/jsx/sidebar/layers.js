import React from 'react';
import { connect } from 'react-redux';
import * as act from '../store/actions';
import axios from 'axios';

import Layer from './layer';

const createLayer = (name, propertyName, visible, color1='#00ff00', color2='#0000ff', geojson=[], bbox, rowsCols, bounds) => ({
    name, propertyName, visible, color1, color2, geojson, bbox, rowsCols, bounds
})

class Layers extends React.Component {
    constructor(props){
        
        super(props);
        this.getLayers = this.getLayers.bind(this);
        this.getLayers();
    }
    // Assumes that geojson will be nonzero size
    getLayers() {
        // TODO Change this when migrate to actual code
        // GET RID OF DATA... THIS SHOULD BE DONE ON THE FLY WITH A TRANSFORM
        axios.get('/datajson/all/'+ datavoxelId, {options: {}})
            .then(({ data })=>{  
                act.sideAddLayers(data.map(l => {
                    const length = l.geojson.geojson.features.length;
                    const propertyName = l.geojson.geojson.features[0].properties.property;
                    
                    // Will hold a transoformed geojson
                    const transGeojson = {
                        name: l.geojson.layername,
                        type: l.geojson.geojson.features[0].geometry.type,
                        length: length,
                        // data: Array(Math.floor(Math.sqrt(length))),
                        otherdata: Array(length),
                        minMax: Array(2), 
                    }
                    // geojson -> Float32Array([x, y, z, w, id])
                    // Map Geojson data to matrix index

                    let xDiff = Math.abs(parseFloat(l.geojson.geojson.features[0].geometry.coordinates[0])-parseFloat(l.geojson.geojson.features[1].geometry.coordinates[0]));
                    let yDiff = Math.abs(parseFloat(l.geojson.geojson.features[0].geometry.coordinates[1])-parseFloat(l.geojson.geojson.features[1].geometry.coordinates[1]));

                    const lowBnd = Math.max(xDiff, yDiff)/10;
                    const highBnd = Math.max(xDiff, yDiff)*.8;
                    const bounds = [ lowBnd, highBnd ];

                    const mappedGeojson = l.geojson.geojson.features.map(g => {
                        // Shouldn't need to parse
                        //const coords = g.geometry.coodinates.map(a=>(parseFloat(a)))
                        const coords = g.geometry.coordinates;
                        const id = parseFloat(g.id);
                        const weight = parseFloat(g.properties[l.layername]);
                        const row = g.properties.neighborhood.row;
                        const column = g.properties.neighborhood.column; 
                        const pointIndex = g.properties.pointIndex;
                        return new Float32Array([coords[0], coords[1], 0, weight, 1, row, column, pointIndex]);
                    });
                    // mappedGeojson.sort();
                    // for (let i = 0; i < Math.floor(Math.sqrt(length)); i++){
                    //     let j = i * 200;
                    //     transGeojson.data[i] = mappedGeojson.slice(j, j+200);
                    // }

                    let minVal = Number.POSITIVE_INFINITY;
                    let maxVal = Number.NEGATIVE_INFINITY;

                    for (let i = 0, j=0; i < length; i++, j=j+3){
                        if (mappedGeojson[i][3]<minVal) { minVal=mappedGeojson[i][3] };
                        if (mappedGeojson[i][3]>maxVal) { maxVal=mappedGeojson[i][3]};
                        transGeojson.otherdata[i] = mappedGeojson[i];
                    }
                    transGeojson.minMax= [minVal, maxVal]
                    return createLayer(l.layername, propertyName, true, 
                                    l.color1, l.color2, transGeojson, l.Datavoxel.bbox.coordinates, l.Datavoxel.rowsCols, bounds);
                }));
            });
    }
    render() {
        return(
            <div className="layers">
                {this.props.layers.map((layer, i)=>( 
                    <Layer
                        key={i}
                        propName={layer.propertyName}
                        name={layer.name}
                        visible={layer.visible}
                        color1={layer.color1}
                        color2={layer.color2}
                    />
                ))}
            </div>
        );
    }
}

export default connect(s=>({layers: s.sidebar.layers}))(Layers);
