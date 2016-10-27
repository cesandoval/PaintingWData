/* global $ */
//$(document).ready(function(){
// Functions for Options Accordion //
var tabHeights = $('#accordion').find('h3').outerHeight(true)+($('.bottom').outerHeight()*2);
console.log(tabHeights)
var screenHeight = $(window).height()-tabHeights+10;//259;

$("#graphLayers").css("height", screenHeight);
$("#graphControls").css("height", screenHeight);
$(function() {
    $( "#accordion" ).accordion({
        // collapsible: true,
        autoHeight: false,
        navigation: true,
        heightStyle: "content",
        active: 0
    });
});


// Functions for Adding Layers to the UI Accordion
// Slugify strings
function slugify(text){
    return text.toString()//.toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

// Function for Color Boxes
function colorWidget(pickerId) {
    pickerId = typeof pickerId !== 'undefined' ? pickerId : null;
    if (pickerId == null) {
        $(".showPaletteOnly").spectrum({
            color: "rgb(0, 0, 255)", 
            showPalette: true,
            palette: ["rgb(255, 0, 0)", "rgb(0, 255, 0)", "rgb(0, 0, 255)",
                        "rgb(242, 56, 90)", "rgb(245,165, 3)", "rgb(233, 241, 233)",
                        "rgb(74, 217, 217)", "rgb(54,177, 191)"],
            hideAfterPaletteSelect:true,
        });
        $(".showPaletteOnlyB").spectrum({
            color: "rgb(0, 0, 0)", 
            showPalette: true,
            palette: ["rgb(255, 0, 0)", "rgb(0, 255, 0)", "rgb(0, 0, 255)",
                        "rgb(242, 56, 90)", "rgb(245,165, 3)", "rgb(233, 241, 233)",
                        "rgb(74, 217, 217)", "rgb(54,177, 191)"],
            hideAfterPaletteSelect:true,
        });
    }
    else {
        $("#"+pickerId+"Picker").spectrum({
            color: "rgb(0, 0, 255)", 
            showPalette: true,
            palette: ["rgb(255, 0, 0)", "rgb(0, 255, 0)", "rgb(0, 0, 255)",
                        "rgb(242, 56, 90)", "rgb(245,165, 3)", "rgb(233, 241, 233)",
                        "rgb(74, 217, 217)", "rgb(54,177, 191)"],
            hideAfterPaletteSelect:true,
        });
        $("#"+pickerId+"B_Picker").spectrum({
            color: "rgb(0, 0, 0)", 
            showPalette: true,
            palette: ["rgb(255, 0, 0)", "rgb(0, 255, 0)", "rgb(0, 0, 255)",
                        "rgb(242, 56, 90)", "rgb(245,165, 3)", "rgb(233, 241, 233)",
                        "rgb(74, 217, 217)", "rgb(54,177, 191)"],
            hideAfterPaletteSelect:true,
        });
    }
}

// // Function to populate the Layers UI
// function populateLayers(layers) {
//     for (i = 0; i < layers.length; i++) {
//         var layerName = slugify(layers[i]);
//         $("#graphLayers").append('<div class="layerBoxes" id='+layerName+'></div>');
//         var colorInput = '<input type="text" class="showPaletteOnly" id='+layerName+'Picker />';
//         var colorInputB = '<input type="text" class="showPaletteOnlyB" id='+layerName+'B_Picker />';
//         var resetLayer = '<button class="resetLayer" id="'+layerName+'Reset">Reset</button>';
//         var radioBtn = $('<label>'+layers[i].toUpperCase()+'<input type="checkbox" class="layerBoxes" name='
//                          + layerName + ' checked/>'+colorInput+colorInputB+resetLayer+'</label>');
        
//         radioBtn.appendTo('#'+layerName);
//         colorWidget()
//     }
// }

// Function to populate the Layers UI
function populateLayers(layers) {
    for (i = 0; i < layers.length; i++) {
        var layerName = slugify(layers[i]);
        $("#graphLayers").append('<div class="layerBoxes" id='+layerName+'></div>');
        var colorInput = '<input type="text" class="showPaletteOnly rightAlign mydiv" id='+layerName+'Picker />';
        var colorInputB = '<input type="text" class="showPaletteOnlyB rightAlign mydiv" id='+layerName+'B_Picker />';
        var resetLayer = '<button class="resetLayer btn" id="'+layerName+'Reset">Reset</button>';
        var radioBtn = $('<label><p class = "mydiv layerName" title = '+layers[i].toUpperCase()+'>'+layers[i]+'</p><input type="checkbox" class="layerBoxes mydiv checkboxStyle" name='
                         + layerName + ' checked/>'+colorInput+colorInputB+resetLayer+'</label>');
        
        radioBtn.appendTo('#'+layerName);
        colorWidget();
    }
}

//});

// Function to slugify a list of layerNames
function slugifyList(namesList) {
    var newNames = [];
    for (var i=0; i<namesList.length; i++) {
        newNames[i] = slugify(namesList[i]);
    }
    return newNames;
}

// Function to turn on and off layers
function checkToggle(allParticles, layerNames) {
    var newNames = slugifyList(layerNames);
    $(function() {
        $(".layerBoxes").change(function(){
            var layerIndex = newNames.indexOf(this.name);
            if (this.checked && layerIndex != -1) {
                allParticles[layerIndex].visible = true;
            }
            else if (layerIndex != -1) {
                allParticles[layerIndex].visible = false;
            }
        });    
    });
}

// Function to Change the Layer Colors thorugh the Color Widget
// HAS SOME BUG, AND IT IS COLORING SOME PIXELS AS BLACK
function colorLayer(layerNames, allParticles, scale, colorScale, pixelLayers, valueLists) {
    var newNames = slugifyList(layerNames);
    $("#graphLayers").on('change.spectrum', function(e, color) {
        if (typeof color !== 'undefined') {
            
            var layerName = e.target.id.slice(0, -6);
            if (layerName.charAt(layerName.length-1) == '_'){
                var layerName = e.target.id.slice(0, -8);    
            }
            var newColorScale = getColorToggles(layerName);

            var layerIndex = newNames.indexOf(layerName);
            var newClr = color.toRgb();
            
            var pixels = pixelLayers[layerIndex];
            var attributes = allParticles[layerIndex].geometry.attributes;
            
            pixels.setProperties(scale, newColorScale, valueLists[layerIndex], [], newClr);
            attributes.customColor.array = pixels.getColors();
            attributes.customColor.needsUpdate = true;
        }
    });
}

function getColorToggles(layerName){
    var colorA = $('#'+layerName+'Picker')
                .next().find('.sp-preview-inner').css('background-color');
    var colorB = $('#'+layerName+'B_Picker')
                .next().find('.sp-preview-inner').css('background-color');

    scale = d3.scale.linear()
        .domain([0,1])
        .interpolate(d3.interpolateRgb)
        .range([colorA, colorB]);

    return scale;
    
}

// Function to populate the Layers UI
function populateGraphBasic() {
    // Add New Divs to the UI Graph
    $("#allOpacity").append('<div class="basicSliders" id="sliderOpacity" ></div>');
    $("#allNeighbors").append('<div class="slidersBottom" id="sliderNeighbors" ></div>');
    
    $('#allOpacity').append('<div class="slidersText" id="textOpacity" ></div>');
    $('#textOpacity').append('<span class="sliderName" id="opacityName" >Opacity:</span>');
    $('#textOpacity').append('<span id="opacityVal" class="sliderValue" >0.60</span>');
    
    $('#allNeighbors').append('<div class="slidersText" id="textNeighbors" ></div>');
    $('#textNeighbors').append('<span class="sliderName" id="neighborName" >Neighbors: </span>');
    $('#textNeighbors').append('<span id="neighborVal" class="sliderValue" >6</span>');
    
    // Add the Sliders
    $( "#sliderOpacity" ).slider({
        range: false,
        min: 0.400,
        max: 1.00,
        value: .600,
        animate: true,
        step: .01,
        slide: function( event, ui ) {
            $( "#opacityVal" ).text( ui.value );
        }
    });
    
    $( "#sliderNeighbors" ).slider({
        range: false,
        min: 0,
        max: 9.00,
        value: 6,
        animate: true,
        step: 1,
        slide: function( event, ui ) {
            $( "#neighborVal" ).text( ui.value );
        }
    });  
}

// Function to populate the Temporary Rel Graph UI
function populateRelGraph(layerNames) {
    // Add New Divs to the UI Graph
    for (var i=0; i<layerNames.length; i++) {
        var slugName = slugify(layerNames[i]);
        $("#graphControls").append('<div class="sliderCell" id='+slugName+'Layer ></div>');
        $("#"+slugName+"Layer").append('<div class="rangeSliders" id="slider'+slugName+'" ></div>');
        $("#"+slugName+"Layer").append('<div class="slidersText" id="text'+slugName+'" ></div>');
        $("#text"+slugName).css("color", 'rgb(0,0,255)');
        
        $("#slider"+slugName).slider({
            range: true,
            min: 0.00,
            max: 1.00,
            values: [0.00, 1.00],
            animate: true,
            step: .01,
        });
        $('#text'+slugName).append('<span class="layerName" id="'+slugName+'Name" >'+slugName+':</span>');
        
        $("#"+slugName+"Layer").append('<div class="slidersOpacity" id="'+slugName+'Opacity" ></div>');
        $("#"+slugName+"Layer").append('<div class="slidersText" id="textOpacity'+slugName+'" ></div>');
        $('#textOpacity'+slugName).append('<span class="opacityText" id="'+slugName+'NameOpacity" >Opacity:</span>');
        $('#textOpacity'+slugName).append('<span id="opacityVal'+slugName+'" class="sliderValue" >0.60</span>');
        $("#"+slugName+"Opacity").slider({
            range: false,
            min: 0.40,
            max: 1.00,
            value: 0.60,
            animate: true,
            step: .01,
        });
    }
}

// Changes the opacity on change of the jquery slider
function changeOpacityIndividual(layerNames, pixelLayers, allParticles) {
    var newNames = slugifyList(layerNames);
    $( ".slidersOpacity" ).slider({
        change: function( event, ui ) {
            var buttonId = this.id;
            var layerId = buttonId.slice(0, -7);
            $( "#opacityVal"+layerId).text( ui.value );
            
            // Reset the Props
            var layerIndex = newNames.indexOf(layerId);
            pixelLayers[layerIndex].setOpacity(ui.value);
            var attributes = allParticles[layerIndex].geometry.attributes;
            attributes.customOpacity.array = pixelLayers[layerIndex].getOpacities();
            attributes.customOpacity.needsUpdate = true;
        }
    });
}

// Changes the opacity on change of the graph slider
function changeOpacityIndividual2(layerNames, layerId, value, pixelLayers, allParticles) {
    var newNames = slugifyList(layerNames);

    // Reset the Props
    var layerIndex = newNames.indexOf(layerId);
    console.log(layerIndex)
    console.log(newNames)
    pixelLayers[layerIndex].setOpacity(value);
    var attributes = allParticles[layerIndex].geometry.attributes;
    attributes.customOpacity.array = pixelLayers[layerIndex].getOpacities();
    attributes.customOpacity.needsUpdate = true;
}

// Changes the opacity on change of the jquery slider
function changeOpacity(pixelLayers, allParticles) {
    $( "#sliderOpacity" ).slider({
        change: function( event, ui ) {
            for (var i=0; i<pixelLayers.length; i++) {
                pixelLayers[i].setOpacity(ui.value);
                var attributes = allParticles[i].geometry.attributes;
                attributes.customOpacity.array = pixelLayers[i].getOpacities();
                attributes.customOpacity.needsUpdate = true;
            }
        }
    });
}

// Changes the number of neighbors used to calculate the properties
function changeNeighbors(allParticles, pixelLayers, scale, valueLists, layerNames) {
    $( "#sliderNeighbors" ).slider({
        change: function( event, ui ) {
            for (var i=0; i<pixelLayers.length; i++) {
                var pixels = pixelLayers[i];
                var attributes = allParticles[i].geometry.attributes;
                
                var allRandomIndices = pixels.nNeighbors(ui.value)
                var colorScale = getColorToggles(slugify(layerNames[i]))
                pixels.setProperties(scale, colorScale, valueLists[i], allRandomIndices);
                
                attributes.size.array = pixels.getScales();
                attributes.size.needsUpdate = true;
                
                attributes.customColor.array = pixels.getColors();
                attributes.customColor.needsUpdate = true;
            }
        }
    });
}

// Changes the mapping ranges used to calculate the properties
function changeProperties(layerNames, allParticles, pixelLayers, scale, colorScale, valueLists) {
    var newNames = slugifyList(layerNames);
    for (n in layerNames) {
        $("#slider"+layerNames[n]).slider({
            change: function( event, ui ) {
                
                var currentLayer = event.target.id.slice(6,event.target.id.length);
                // $( "#text"+currentLayer ).text( ui.value );
                var layerIndex = newNames.indexOf(currentLayer),
                    minVal = ui.values[0],
                    maxVal = ui.values[1];
                
                var pixels = pixelLayers[layerIndex];
                var attributes = allParticles[layerIndex].geometry.attributes;
                
                var values = valueLists[layerIndex];
                var scaleVals, colorVals;
                
                var newMinVal = sizeScale(minVal),
                    newMaxVal = sizeScale(maxVal);
                
                scaleVals = [newMinVal, newMaxVal];
                scale.range(scaleVals);
                
                colorVals = [minVal, maxVal];
                colorScale.range(colorVals);
                
                var allRandomIndices = pixels.getNNeighbors()
                
                pixels.setProperties(scale, colorScale, values, allRandomIndices);
                
                attributes.size.array = pixels.getScales();
                attributes.size.needsUpdate = true;
                
                attributes.customColor.array = pixels.getColors();
                attributes.customColor.needsUpdate = true;
            }
        });
    }
}

// Changes the mapping ranges used to calculate the properties
function changeProperties2(brushVals, layerId, layerNames, allParticles, pixelLayers, scale, colorScale, valueLists) {
    // console.log(scale)
    // console.log(scale.range())
    
    var newNames = slugifyList(layerNames);
    var layerName = slugify(layerId);
    var layerIndex = newNames.indexOf(layerName),
        minVal = brushVals[0],
        maxVal = brushVals[1];
    var colorScale = getColorToggles(layerName);

    var pixels = pixelLayers[layerIndex];
    var attributes = allParticles[layerIndex].geometry.attributes;
    
    var values = valueLists[layerIndex];
    var scaleVals, colorVals;

    var newMinVal = sizeScale(minVal),
        newMaxVal = sizeScale(maxVal);
    
    scaleVals = [newMinVal, newMaxVal];
    scale.range(scaleVals);
    
    colorVals = [colorScale(minVal), colorScale(maxVal)];

    colorScale.range(colorVals);
    
    var allRandomIndices = pixels.getNNeighbors()
    
    pixels.setProperties(scale, colorScale, values, allRandomIndices);
    
    attributes.size.array = pixels.getScales();
    attributes.size.needsUpdate = true;
    
    attributes.customColor.array = pixels.getColors();
    attributes.customColor.needsUpdate = true;
}

function changeOpacityIndividual2(layerNames, layerId, value, pixelLayers, allParticles) {
    var newNames = slugifyList(layerNames);

    // Reset the Props
    var layerIndex = newNames.indexOf(slugify(layerId));

    pixelLayers[layerIndex].setOpacity(value);
    var attributes = allParticles[layerIndex].geometry.attributes;
    attributes.customOpacity.array = pixelLayers[layerIndex].getOpacities();
    attributes.customOpacity.needsUpdate = true;
}



// Function to Query the Pixels Based on Parallel Coordinates
function queryBrush(pc, layerNames, allParticles, pixelLayers, scale, colorScale, valueLists) {
    var newNames = slugifyList(layerNames);
    pc.on('brushend', function(){
        
        var brushSelection = this.brushExtents();
        for (var layer in brushSelection){
            var layerIndex = newNames.indexOf(slugify(layer));
            var brushRange = brushSelection[layer];
            if (layerIndex !== -1) {
                
                var pixels = pixelLayers[layerIndex];
                var attributes = allParticles[layerIndex].geometry.attributes;
                
                var values = valueLists[layerIndex];
            
                var allRandomIndices = pixels.getNNeighbors()
                
                var colorScale = getColorToggles(slugify(layer));
                pixels.setProperties(scale, colorScale, values, allRandomIndices, pixels.color, brushRange);
                
                attributes.size.array = pixels.getScales();
                attributes.size.needsUpdate = true;
                
                attributes.customColor.array = pixels.getColors();
                attributes.customColor.needsUpdate = true;
            }
        }
    });
}

function resetLayer(layerNames, allParticles, scale, colorScale, pixelLayers, valueLists) {
    var newNames = slugifyList(layerNames);
    
    $(".resetLayer").click( function(){
        var buttonId = this.id;
        var layerId = buttonId.slice(0, -5);
        
        // Restore the original color of the color picker
        colorWidget(layerId)
        
        // Reset the slider's original values
        $("#slider"+layerId).slider('values',[0,1]); 
        
        // Reset the Props
        var layerIndex = newNames.indexOf(layerId);
        var newClr = {"r":0,"g":0,"b":255};
        $("#text"+layerId).css("color", "rgb(0, 0, 255)");
        
        var pixels = pixelLayers[layerIndex];
        var attributes = allParticles[layerIndex].geometry.attributes;
        
        // FIX ME
        // THIS IS MAKING THE PIXELS RANDOMLY CHANGE SIZE... MAYBE COMPUTE ACTUAL MANHATTAN DIST
        var allRandomIndices = pixels.nNeighbors(6)
        pixels.setProperties(scale, colorScale, valueLists[layerIndex], allRandomIndices, newClr);
        attributes.customColor.array = pixels.getColors();
        attributes.customColor.needsUpdate = true;
    });
}


// Function to turn on and off the grid
function toggleGrid(grid) {
    $(function() {
        $("#gridBox").change(function(){
            if (this.checked ) {
                grid.visible = true;
            }
            else {
                grid.visible = false;
            }
        });    
    });
}

// Function to turn on and off the grid
// BUG..... I NEED TO REVERT TO THE ORIGINAL VIEW VEC....
function toggleThreeD(controls) {
    $(function() {
        $("#threeDBox").change(function(){
            if (this.checked ) {
                controls.noRotate = false;
            }
            else {
                controls.noRotate = true;
            }
        });    
    });
}

// Hide and Show the Parallel Coords Widget
function toggleCoordinates() {
    $('#parallelData').hide();
    $('#show').click(function(){
        if ($('#graphMaker').css('display')!='none'){
            var speed = 550;
            $('#graphMaker').slideToggle(speed);
            $('#graphMakerControls').slideToggle(speed);
        }
        $('#parallelData').slideToggle('slow');
    });
}

// Hide and Show the Graph Tools
function toggleGraphMaker() {
    $('#graphMaker').hide();
    $('#graphMakerControls').hide();
    $('#graphShow').click(function(){
        if ($('#parallelData').css('display')!='none'){
            $('#parallelData').slideToggle(450);
        }
        $('#graphMaker').slideToggle('slow');
        $('#graphMakerControls').slideToggle('slow');
    });
}

// var tabHeights = $('#accordion').find('h3').outerHeight(true)+($('.bottom').outerHeight()*2);
// var screenHeight = $(window).height()-tabHeights;//259;

// Function to populate the Layers UI
function populateNodes(nodeTypes) {
    var slugNodes = slugifyList(nodeTypes);
    for (var i=0; i<nodeTypes.length;i++){
        // Add New Ps to the UI Graph
        $("#nodeTypes").append('<ul> <p class="nodeNames" id="'+slugNodes[i]+'" >'+nodeTypes[i]+'</p></ul>');
    }
    highlightNodes()
}

function highlightNodes() {
	$(".nodes ul p").on('mousedown', function() {
		if ($(this).attr("class") === 'nodeNames') { 
            //add layer
			var type = $(this).attr("class");

			if (type == "nodeNames")
				$(this).addClass("nodeNamesSelected");
		} 
	});
    $(".nodes ul p").on('mouseup', function() {
        $(this).removeClass("nodeNamesSelected")
    })
}

