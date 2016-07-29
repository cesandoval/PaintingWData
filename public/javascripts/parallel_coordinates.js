

function loadCoordinates(json, layers) {
    
    var stepSize;
    var maxPts = 3000;
    if (json.length > maxPts) {
        stepSize = Math.floor(json.length/maxPts);
    }
    else {
        stepSize = 1;
    }
    var jsonData = []
    
    var minVal = 0,
        maxVal = 0;
    for ( var i = 0; i < json.length; i+= stepSize) {
        var vert = json[i]
        var props = vert.properties;
        var sum = 0;
        var size = 0;

        var newProps = {}
        for (var n = 0; n < layers.length; n++) {
            var key = layers[n];
            if (props.hasOwnProperty(key)) {
                var val = props[key];
                newProps[key] = val;
                sum += parseFloat(val);
                size ++
                if (val <= minVal) {
                    minVal = val;
                }
                if (val >= maxVal) {
                    maxVal = val;
                }
            }
        }

        var average = sum/size;
        if (!(average == 1)) {
            jsonData.push(newProps);
        }
    }
    // linear color scale
    var blue_to_brown = d3.scale.linear()
        .domain([minVal, maxVal])
        .range([d3.rgb(245,165,3), d3.rgb(74,217,217)])
        .interpolate(d3.interpolateLab);
    
    // Create the chart
    var pc = d3.parcoords()("#parallelData")
        .data(jsonData)
        //.hideAxis(["name"])
        .composite("darken" )
        // quantitative color scale
        .color(function(d) { 
            var keys = Object.keys( d );
            return blue_to_brown(d[keys[0]]); 
        })  
        .alpha(0.35)
        .render()
        .brushMode("1D-axes")  // enable brushing
        .interactive()  // command line mode
        .reorderable()
        .axisDots(size = 2)
        .mode("queue")

    return pc;
}



