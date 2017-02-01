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

            let dictBuild = Array(numElements);

            var brushedLayers;
            if (typeof this.minObjs != 'undefined') {
                brushedLayers = Object.keys(this.minObjs);
                console.log(brushedLayers)
            }
            for(let i = 0; i < numElements; i++ ){
                let inDict = {}
                for (let j = 0; j < numLayers; j++){
                    if (typeof this.minObjs != 'undefined' && i<3) {
                        var currVal = visibleLayers[j].geojson.otherdata[i][3];
                        // console.log(visibleLayers[j].propertyName, this.minObjs[visibleLayers[j].propertyName])
                        // console.log(visibleLayers[j].propertyName, this.minObjs)
                        // console.log(visibleLayers);
                        if (currVal >= this.minObjs[visibleLayers[j].propertyName] &&  currVal >= this.maxObjs[visibleLayers[j].propertyName]) {
                            // console.log(visibleLayers[j].propertyName)
                            // inDict[visibleLayers[j].propertyName] = currVal;
                        }
                    } 
                    inDict[visibleLayers[j].propertyName] = visibleLayers[j].geojson.otherdata[i][3];
                }
                dictBuild[i] = inDict;
            }
            this.build(dictBuild, 1)
            this.layerIndeces = layerIndeces 
        }
    }

    build(data, test) {
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
        // console.log(555555555)
        this.pc = pc;
        this.setState({pc: pc});
    }

    calcRanges(data){
        this.pc.randoms = true;
        // console.log(this.pc.brushed())
        // console.log(this.pc.state)

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
        const lowBnd = .0015;
        const highBnd = .012;        
        const remap = function(x, i, mins, maxs) {
            return (highBnd-lowBnd)*((x-mins[i])/(maxs[i]-mins[i]))+lowBnd;
        }

        for (let name in minObjs) {
            let pixels = this.props.geometries[name];
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
            zIndex: "4",
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
