import React from 'react';
import { connect } from 'react-redux';

class PCoords extends React.Component {
    constructor(props){
        super(props);
        this.state = {pc: null, started: false};
        this.build = this.build.bind(this);
        this.calcRanges = this.calcRanges.bind(this);
    }
    componentWillReceiveProps(nprops){
        if(nprops.mapStarted && !this.state.started && nprops.layers.length > 0){
            this.setState({started: true});
            // Assumes that all of the layers have the same length
            // and also that the data matches up
            // ie. indexes == same location
            let numElements = nprops.layers[0].geojson.length;
            let numLayers = nprops.layers.length;

            let build = [];
            for(let i = 0; i < numElements; i++ ){
                let inBuild = Array(numLayers);
                for (let j = 0; j < numLayers; j++){
                    inBuild[j] = nprops.layers[j].geojson.data[Math.floor(i / 200)][i % 200][3];
                }
                build.push(inBuild);
            }
            this.build(build)
        }
    }
    build(data) {
        const pc = d3.parcoords()('#parcoords')
            .mode("queue")
            .data(data)
            .render()
            .createAxes()
            .reorderable()
            .brushMode("1D-axes");
        pc.on("brush", this.calcRanges.bind(this));
        this.setState({pc: pc});
    }
    calcRanges(data){
        // Calculate range of data
        if (data == undefined || data[0] == undefined) {
            return null;
        }

        let l = data[0].length;
        let mins = Array(l);
        let maxs = Array(l);

        for(let j = 0; j < l; j++){
            mins[j] = Infinity;
            maxs[j] = 0.0;
        }

        // For every row in the table
        for(let i = 0; i < data.length; i++){
            // For every layer
            for(let j = 0; j < l; j++){
                mins[j] = Math.min(mins[j], parseFloat(data[i][j]));
                maxs[j] = Math.max(maxs[j], parseFloat(data[i][j]));
            }
        }

        // Update Layers
        for(let i = 0; i < l; i++){
            let name = this.props.layers[i].name;
            let pixels = this.props.geometries[name];
            pixels.material.uniforms.min.value = mins[i];
            pixels.material.uniforms.max.value = maxs[i];
        }
    }
    style() {
        return {
            backgroundColor: "red",
            width: "500px",
            height: "300px",
            position: "fixed",
            bottom: "0",
            right: "0",
            zIndex: "10"
        }
    }
    render() {
        return(
            <div id="parcoords" className="parcoords" style={this.style()}></div>
        );
    }
}

export default connect(s=>({
    mapStarted: s.map.started,
    layers:s.sidebar.layers,
    geometries: s.map.geometries
}))(PCoords)
