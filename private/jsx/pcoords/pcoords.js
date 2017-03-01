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
        if(true && nprops.layers.length > 0){
            this.setState({started: true});

            const bounds = nprops.layers[0].bounds;
            const indicesArray = nprops.layers[0].allIndices;
            this.lowBnd = bounds[0];
            this.highBnd = bounds[1];

            // Sets the mins and maxs values of every layer
            const mins = Array(nprops.layers.length);
            const maxs = Array(nprops.layers.length);
            const layerIndeces = {};
            const layersNameProperty = {}
            for (let i = 0; i<nprops.layers.length; i++) {
                layerIndeces[nprops.layers[i].propertyName] = i
                layersNameProperty[nprops.layers[i].propertyName] = nprops.layers[i].name;
                mins[i] = nprops.layers[i].geojson.minMax[0];
                maxs[i] = nprops.layers[i].geojson.minMax[1];
            }
            this.minVal = mins;
            this.maxVal = maxs;
            this.layersNameProperty = layersNameProperty;
            // this.brushed = false;

            // Assumes that all of the layers have the same length
            // and also that the data matches up
            // ie. indexes == same location

            //clean the container first
            let pcContainer = document.getElementById("parcoords");
            while (pcContainer.firstChild) {
                pcContainer.removeChild(pcContainer.firstChild);
            }
            // and recalculate parcoords
            const totalElements = nprops.layers[0].rowsCols['cols']*nprops.layers[0].rowsCols['rows']
            let visibleLayers = nprops.layers.filter(l => l.visible);
            let numLayers = visibleLayers.length;

            let maxVoxels = 0;
            for (let i=0; i<visibleLayers.length; i++) {
                let currVoxels = visibleLayers[i].geojson.length;
                if (currVoxels > maxVoxels) {
                    maxVoxels = currVoxels;
                }
            }

            let dictBuild = Array(maxVoxels);
            let dictBrush = [];
            // var brushedLayers;
            // if (typeof this.minObjs != 'undefined') {
            //     brushedLayers = Object.keys(this.minObjs);
            // }

            for(let j = 0; j < numLayers; j++ ){
                for (let i = 0; i < maxVoxels; i++){
                    if (dictBuild[i] == undefined){
                        dictBuild[i] = {};
                    }
                    if (indicesArray[i] in visibleLayers[j].geojson.hashedData) {
                        dictBuild[i][visibleLayers[j].propertyName] = visibleLayers[j].geojson.hashedData[indicesArray[i]][3];
                    } else {
                        dictBuild[i][visibleLayers[j].propertyName] = 0;
                    }
                }
            }

            this.build(dictBuild, dictBrush)
            this.layerIndeces = layerIndeces 
        }
    }

    build(data, dictBrush) {
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
        // if (this.brushed) {
        //     pc.state.brushed = dictBrush;
        // }
        
        pc.on("brushend", this.calcRanges.bind(this));
        this.pc = pc;
        this.setState({pc: pc});
    }

    calcRanges(data){
        this.pc.randoms = true;

        const brushSelection = this.pc.brushExtents();
        const layerNames = Object.keys(brushSelection);

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
        this.minObjs = minObjs;
        this.maxObjs = maxObjs;
        
        // Update Layers  
        const lowBnd = this.lowBnd;
        const highBnd = this.highBnd; 
         
        const remap = function(x, i, mins, maxs) {
            return (highBnd-lowBnd)*((x-mins[i])/(maxs[i]-mins[i]))+lowBnd;
        }

        for (let name in minObjs) {
            let pixels = this.props.geometries[this.layersNameProperty[name]];
            pixels.material.uniforms.min.value = remap(minObjs[name], this.layerIndeces[name], this.minVal, this.maxVal);
            pixels.material.uniforms.max.value = remap(maxObjs[name], this.layerIndeces[name], this.minVal, this.maxVal);
        }
    }
    style() {
        return {
            backgroundColor: "white",
            width: "79vw",
            height: "300px",
            position: "fixed",
            overflow: "hidden",
            bottom: "30px",
            right: "0",
            zIndex: "10",
            opacity: 0.5
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
