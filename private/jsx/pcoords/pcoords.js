import React from 'react';
import { connect } from 'react-redux';
import * as act from '../store/actions';

class PCoords extends React.Component {
    // TODO.... ADD THE NAME OF THE LAYERS TO THE DICTIONARY INSTEAD OF PASSING AN ARRAYY
    // THIS WAY, WE CAN DISPLAY THE NAME INSTEAD OF THE INDEX....

    // TODO EVERYTIME THE COLOR GETS UPDATED, THE PCOORDS GET RESTARTED, BUT THE MIN/MAX VALS DONT
    constructor(props){
        super(props);

        this.state = {
            pc: null, 
        };

        this.build = this.build.bind(this);
        this.calcRanges = this.calcRanges.bind(this);

    }
    componentWillReceiveProps(nprops){
        //nprops.mapStarted
        if(true && nprops.layers.length > 0){
            this.setState({started: true});
            console.log(9999999999999999)
            console.log(nprops.layers)

            // Sets the mins and maxs values of every layer
            const mins = Array(nprops.layers.length);
            const maxs = Array(nprops.layers.length);
            const layerIndeces = {};
            for (let i = 0; i<nprops.layers.length; i++) {
                layerIndeces[nprops.layers[i].propertyName] = i
                mins[i] = nprops.layers[i].geojson.minMax[0];
                maxs[i] = nprops.layers[i].geojson.minMax[1];
            }
            this.minVal = mins;
            this.maxVal = maxs;
            
            // Assumes that all of the layers have the same length
            // and also that the data matches up
            // ie. indexes == same location

            //clean the container first
            let pcContainer = document.getElementById("parcoords");
            while (pcContainer.firstChild) {
                pcContainer.removeChild(pcContainer.firstChild);
            }
            // and recalculate parcoords
            let numElements = nprops.layers[0].geojson.length;
            let visibleLayers = nprops.layers.filter(l => l.visible);
            let numLayers = visibleLayers.length;

            console.log(visibleLayers)

            // let build = [];
            let dictBuild = Array(numElements);
            for(let i = 0; i < numElements; i++ ){
                // let inBuild = Array(numLayers);
                let inDict = {}
                for (let j = 0; j < numLayers; j++){
                    inDict[nprops.layers[j].propertyName] = nprops.layers[j].geojson.otherdata[i][3];
                    // inBuild[j] = nprops.layers[j].geojson.otherdata[i][3];
                }
                dictBuild[i] = inDict;
                // build.push(inBuild);
            }
            // console.log(dictBuild);
            this.build(dictBuild)
            this.layerIndeces = layerIndeces           
        }
    }

    build(data) {
        let minVal = this.minVal[0];
        let maxVal = this.maxVal[0];

        // linear color scale
        const blue_to_brown = d3.scale.linear()
            .domain([minVal, maxVal])
            .range([d3.rgb(245,165,3), d3.rgb(74,217,217)])
            .interpolate(d3.interpolateLab);
        const pc = d3.parcoords()('#parcoords')
            .mode("queue")
            .data(data)
            .composite("darken" )
            .color(function(d) { 
                var keys = Object.keys( d );
                return blue_to_brown(d[keys[0]]); 
            }) 
            .alpha(0.05)
            .render()
            .createAxes()
            .reorderable()
            .brushMode("1D-axes");
        pc.on("brushend", this.calcRanges.bind(this));
        this.pc = pc;
        this.setState({pc: pc});
    }

    calcRanges(data){
        const brushSelection = this.pc.brushExtents();
        const layerNames = Object.keys(brushSelection);
        console.log(layerNames)

        // Calculate range of data
        let maxObjs = {}
        let minObjs = {}
        if (layerNames.length > 0) {
            for (let i = 0; i < layerNames.length; i++){
                let selection = brushSelection[layerNames[i]];
                minObjs[layerNames[i]] = selection[0];
                maxObjs[layerNames[i]] = selection[1];
            }
        }

        // Update Layers
        const lowBnd = .0015;
        const highBnd = .012;        
        const remap = function(x, i, mins, maxs) {
            return (highBnd-lowBnd)*((x-mins[i])/(maxs[i]-mins[i]))+lowBnd;
        }

        for (let name in minObjs) {
            console.log(name)
            console.log(this.props.geometries, this.props.geometries[name])
            console.log(name, this.layerIndeces[name])
            console.log(this.minVal, this.maxVal)
            let pixels = this.props.geometries[name];
            pixels.material.uniforms.min.value = remap(minObjs[name], this.layerIndeces[name], this.minVal, this.maxVal);
            pixels.material.uniforms.max.value = remap(maxObjs[name], this.layerIndeces[name], this.minVal, this.maxVal);
        }
    }
    style() {
        return {
            backgroundColor: "white",
            width: "500px",
            height: "300px",
            position: "fixed",
            overflow: "auto",
            bottom: "0",
            right: "0",
            zIndex: "10",
            opacity: .5
        }
    }
    render() {
        return(
            <div id="parcoords" className="parcoords" style={this.style()}></div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        mapStarted: state.map.started,
        layers:     state.sidebar.layers,
        geometries: state.map.geometries
    }
}

export default connect(mapStateToProps)(PCoords)
