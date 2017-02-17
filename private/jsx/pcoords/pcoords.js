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
            let numElements = nprops.layers[0].geojson.length;
            let visibleLayers = nprops.layers.filter(l => l.visible);
            let numLayers = visibleLayers.length;

            let dictBuild = Array(maxVoxels);
            let dictBrush = [];

            let maxVoxels = 0;
            for (let i=0; i<visibleLayers.length; i++) {
                let currVoxels = visibleLayers[i].geojson.length;
                if (currVoxels > maxVoxels) {
                    maxVoxels = currVoxels;
                }
            }

            // var brushedLayers;
            // if (typeof this.minObjs != 'undefined') {
            //     brushedLayers = Object.keys(this.minObjs);
            // }

            let bool = 0;
            for(let i = 0; i < maxVoxels; i++ ){
                let inDict = {};
                let inBrush = {};
                for (let j = 0; j < numLayers; j++){
                    // if (typeof this.minObjs != 'undefined') {
                    //     this.brushed = true;
                    //     var currVal = visibleLayers[j].geojson.otherdata[i][3];

                    //     if (currVal >= this.minObjs[visibleLayers[j].propertyName] && currVal <= this.maxObjs[visibleLayers[j].propertyName]) {
                    //         inBrush[visibleLayers[j].propertyName] = visibleLayers[j].geojson.otherdata[i][3];
                    //         bool++;
                    //     }
                    // } 
                    if (visibleLayers[j].geojson.otherdata[i] !== undefined ) {
                        inDict[visibleLayers[j].propertyName] = visibleLayers[j].geojson.otherdata[i][3];
                        var layerIndex = j;
                    } else {
                        inDict[visibleLayers[j].propertyName] = 0;
                    }
                }
                if (visibleLayers[layerIndex].geojson.otherdata[i] !== undefined ) {
                    dictBuild[i] = inDict;
                    // testVoxels[visibleLayers[layerIndex].geojson.otherdata[i][7]] = inDictTest;
                } 
                // dictBrush[bool] = inBrush;
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
