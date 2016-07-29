// document.onload = (function(d3, saveAs, Blob, undefined){
//   "use strict";

function graphMaker(d3, saveAs, Blob, layerNames, layerVals, pixelLayers, allParticles, scale, colorScale){
    "use strict";

    // define graphcreator object
    var GraphCreator = function(svg, nodes, edges){
        
        
        var thisGraph = this;
            thisGraph.idct = 0;

        thisGraph.nodes = nodes || [];
        thisGraph.edges = edges || [];

        thisGraph.state = {
            selectedNode: null,
            selectedEdge: null,
            mouseDownNode: null,
            mouseDownLink: null,
            justDragged: false,
            justScaleTransGraph: false,
            lastKeyDown: -1,
            shiftNodeDrag: false,
            selectedText: null
        };

        thisGraph.svg = svg;
        thisGraph.svgG = svg.append("g")
                .classed(thisGraph.consts.graphClass, true);
        var svgG = thisGraph.svgG;
        
        thisGraph.nodeTypes = ['Multiplication', 'Division', 'Addition',  
                'Subtraction', 'And', 'Or', 'XAnd', 'XOr', 'Logarithm'];
        // Populate the menu with nodetypes
        populateNodes(thisGraph.nodeTypes)   
                
        // displayed when dragging between nodes
        thisGraph.dragLine = svgG.append('svg:path')
                .attr('class', 'link hidden');

        // svg nodes and edges 
        thisGraph.paths = svgG.append("g").selectAll("g");
        thisGraph.rects = svgG.append("g").selectAll("g");
        thisGraph.layerRects = svgG.append("g").selectAll("g");


        thisGraph.drag = d3.behavior.drag()
                .origin(function(d){
                    return {x: d.x, y: d.y};
                })
                .on("drag", function(args){
                    // var nodeName = d3.event.sourceEvent.target.nodeName;
                    // var className = d3.event.sourceEvent.target.className.animVal;
                    // if (nodeName != 'svg' && className != 'myTest'){
                        
                    // }
                    // var className = d3.event.target.className.animVal
                    // if (className != 'extent' && className != 'domain' && className != 'background' && className != 'sliderHandle') {
                    //     console.log(65656656565)
                    //     thisGraph.circleMouseUp.call(thisGraph, d3.select(this), d, this);
                    // }
                    thisGraph.state.justDragged = true;
                    thisGraph.dragmove.call(thisGraph, args);
                })
                .on("dragend", function() {
                // todo check if edge-mode is selected
                });

        // listen for key events
        d3.select(window).on("keydown", function(){
            thisGraph.svgKeyDown.call(thisGraph);
        })
            .on("keyup", function(){thisGraph.svgKeyUp.call(thisGraph);});
        svg.on("mousedown", function(d){thisGraph.svgMouseDown.call(thisGraph, d);});
        svg.on("mouseup", function(d){thisGraph.svgMouseUp.call(thisGraph, d);});
        
        $(".nodes ul p").click(function() {
            thisGraph.addNodes.call(thisGraph, this);
        });

        // listen for dragging
        var dragSvg = d3.behavior.zoom()
                .on("zoom", function(){
                if (d3.event.sourceEvent.shiftKey){
                    // TODO  the internal d3 state is still changing
                    return false;
                }
                else{
                    var className = d3.event.sourceEvent.target.className.animVal;
                    // if (className == 'myTest'){
                    thisGraph.zoomed.call(thisGraph);
                    // }
                }
                return true;
                })
                .on("zoomstart", function(){
                    var ael = d3.select("#" + thisGraph.consts.activeEditId).node();
                    if (ael){
                        ael.blur();
                    }
                    if (!d3.event.sourceEvent.shiftKey) {
                        // var className = d3.event.sourceEvent.target.className.animVal;
                        // if (className == 'myTest'){
                        d3.select('body').style("cursor", "move");
                        // }
                    }
                })
                .on("zoomend", function(){
                    d3.select('body').style("cursor", "auto");
                });

        svg.call(dragSvg).on("dblclick.zoom", null);

        // listen for resize
        window.onresize = function(){thisGraph.updateWindow(svg);};
        };


        GraphCreator.prototype.setIdCt = function(idct){
            this.idct = idct;
        };
        
        var nWidth = 110,
            nHeight = 80;
            
        GraphCreator.prototype.consts =  {
            selectedClass: "selected",
            connectClass: "connect-node",
            rectGClass: "basicNode",
            graphClass: "graph",
            activeEditId: "active-editing",
            BACKSPACE_KEY: 8,
            DELETE_KEY: 46,
            ENTER_KEY: 13,
            nodeRadius: 50,
            nodeWidth: nWidth,
            nodeHeight: nHeight,
            individualHeight: 30,
            sliderHeight: 25,
            edgeOffset: [nWidth/2, nHeight/2],
            nodeOffset: 14.4,
            nodeBox: 15,
            sliderHandle: 5,
            rightMargin: 33
        };
        
        GraphCreator.prototype.nodeTypes =  { };
        
        GraphCreator.prototype.nodeTypes.basicNode =  {
            numberOfInputs: 1,
            inputNames: ['A'],
            numberOfOutputs: 1,
            nodeWidth: 100,
            nodeHeight: 30,
            edgeOffset: [100/2, 30/2],
            name: 'basicNode',
            textName: 'basicNode',
            evaluate: function() {
                return Math.random();;
            }
        };
        
        
        /* PROTOTYPE FUNCTIONS */
        GraphCreator.prototype.dragmove = function(d) {
            var thisGraph = this;
            
            if (thisGraph.state.shiftNodeDrag){
                // add new paths
                ////////////////////////////////
                // THIS ONE JUST DRAW THE PATHS WHEN YOU ARE DRAGGING... SO NO NEED TO CHANGE A THING
                var diagonal = d3.svg.diagonal()
                    .source({"x":d.y+thisGraph.consts.nodeOffset, "y":d.x+thisGraph.consts.nodeWidth})            
                    .target({"x":d3.mouse(thisGraph.svgG.node())[1], "y":d3.mouse(this.svgG.node())[0]})
                    .projection(function(d) {return [d.y, d.x];});
                thisGraph.dragLine.attr('d', diagonal);
            } 
            else{
                d.x += d3.event.dx;
                d.y +=  d3.event.dy;
                thisGraph.updateGraph();
            }
        };

        // I SHOULD ADD A DRAW LASSO EVENT TO SELECT AND DELETE THE WHOLE THING....
        GraphCreator.prototype.deleteGraph = function(skipPrompt){
            var thisGraph = this,
                doDelete = true;
            if (!skipPrompt){
                doDelete = window.confirm("Press OK to delete this graph");
            }
            if(doDelete){
                thisGraph.nodes = [];
                thisGraph.edges = [];
                thisGraph.updateGraph();
            }
        };

        /* insert svg line breaks: taken from http://stackoverflow.com/questions/13241475/how-do-i-include-newlines-in-labels-in-d3-charts */
        GraphCreator.prototype.insertTitleLinebreaks = function (gEl, title) {
            // selection.selectAll('.update').remove();
            var words = title.split(/\s+/g),
                nwords = words.length;
            var el = gEl.append("text")
                    .attr('class', 'update')
                    .attr("text-anchor","middle")
                    .attr("dy", "-" + (nwords-1)*7.5)
                    .attr("x", this.consts.nodeWidth/2)
                    .attr("y", 18.5);

            for (var i = 0; i < words.length; i++) {
                var tspan = el.append('tspan').text(words[i]);
                if (i > 0) {
                    tspan.attr('x', 0).attr('dy', '15');
                }
            }
        };


        // remove edges associated with a node
        GraphCreator.prototype.spliceLinksForNode = function(node) {
            var thisGraph = this,
                toSplice = thisGraph.edges.filter(function(l) {
                    return (l.source === node || l.target === node);
            });
            toSplice.map(function(l) {
                thisGraph.edges.splice(thisGraph.edges.indexOf(l), 1);
            });
        };

        // Highlights the Selected Edge
        GraphCreator.prototype.replaceSelectEdge = function(d3Path, edgeData){
            var thisGraph = this;
            d3Path.classed(thisGraph.consts.selectedClass, true);
            if (thisGraph.state.selectedEdge){
                thisGraph.removeSelectFromEdge();
            }
            thisGraph.state.selectedEdge = edgeData;
        };

        // Highlights the Selected Node
        GraphCreator.prototype.replaceSelectNode = function(d3Node, nodeData){
            var thisGraph = this;
            d3Node.classed(this.consts.selectedClass, true);
            if (thisGraph.state.selectedNode){
                thisGraph.removeSelectFromNode();
            }
            thisGraph.state.selectedNode = nodeData;
        };

        // Unselects the node when clicked again
        GraphCreator.prototype.removeSelectFromNode = function(){
            var thisGraph = this;
            thisGraph.layerRects.filter(function(cd){
                return cd.id === thisGraph.state.selectedNode.id;
            }).classed(thisGraph.consts.selectedClass, false);
            thisGraph.state.selectedNode = null;
        };

        GraphCreator.prototype.removeSelectFromEdge = function(){
            var thisGraph = this;
            thisGraph.paths.filter(function(cd){
                return cd === thisGraph.state.selectedEdge;
            }).classed(thisGraph.consts.selectedClass, false);
            thisGraph.state.selectedEdge = null;
        };

        // Selects and deselects nodes
        GraphCreator.prototype.pathMouseDown = function(d3path, d){
            var thisGraph = this,
                state = thisGraph.state;
            d3.event.stopPropagation();
            state.mouseDownLink = d;

            if (state.selectedNode){
                thisGraph.removeSelectFromNode();
            }

            var prevEdge = state.selectedEdge;  
            if (!prevEdge || prevEdge !== d){
                thisGraph.replaceSelectEdge(d3path, d);
            } 
            else{
                thisGraph.removeSelectFromEdge();
            }
        };

        // mousedown on node
        GraphCreator.prototype.circleMouseDown = function(d3node, d, svgOn){
            var thisGraph = this,
                state = thisGraph.state;
            
            d3.event.stopPropagation();
            state.mouseDownNode = d;

            // // Here we draw a new edge
            // if (d3.event.shiftKey){
            //     state.shiftNodeDrag = d3.event.shiftKey;
            //     d3.select(svgOn).selectAll('.outputBox').on('mouseleave', function(d){
            //         // add new paths
            //         var diagonal = d3.svg.diagonal()
            //             .source({"x":d.y+thisGraph.consts.nodeOffset, "y":d.x+thisGraph.consts.nodeWidth})
            //             .target({"x":d.y+thisGraph.consts.nodeOffset, "y":d.x})    
            //             .projection(function(d) {return [d.y, d.x];});

            //         state.shiftNodeDrag = d3.event.shiftKey;
            //         d3.event.stopPropagation();

            //         // reposition dragged directed edge
            //         thisGraph.dragLine.classed('hidden', false)
            //             .attr('d', diagonal);
            //         return;
            //     });
            // }
            
            // Here we draw a new edge
            if (d3.event.shiftKey){
                // var absPosition = d3.mouse(this.svgG.node());
                // var outBBox = thisGraph.consts.outBBox;

                // console.log(d3.event)
                // if (absPosition[0] >= d.x + outBBox[0] && 
                //     absPosition[0] <= d.x + outBBox[1] &&
                //     absPosition[1] >= d.y + outBBox[2] && 
                //     absPosition[1] <= d.y + outBBox[3]) {
                    
                // add new paths
                var diagonal = d3.svg.diagonal()
                    .source({"x":d.y+thisGraph.consts.nodeOffset, "y":d.x+thisGraph.consts.nodeWidth})
                    .target({"x":d.y+thisGraph.consts.nodeOffset, "y":d.x})    
                    .projection(function(d) {return [d.y, d.x];});

                state.shiftNodeDrag = d3.event.shiftKey;

                // reposition dragged directed edge
                thisGraph.dragLine.classed('hidden', false)
                    .attr('d', diagonal);
                return;
                // }
            }
        };

        // mouseup on nodes
        GraphCreator.prototype.circleMouseUp = function(d3node, d, svgOn){
            var thisGraph = this,
                state = thisGraph.state,
                consts = thisGraph.consts;
            // reset the states
            state.shiftNodeDrag = false;    
            d3node.classed(consts.connectClass, false);

            var mouseDownNode = state.mouseDownNode;

            if (!mouseDownNode) return;

            thisGraph.dragLine.classed("hidden", true);

            // HERE I HAVE TO ADD THE LOGIC OF THE INPUT NODES... MAKE SURE IT IS A DIFFERENT NODE AND IT ALSO
            // CONNECTS TO A GIVEN AREA, THEN EVALUATE THE CONNECTION
            ////////////////
            var svgClass = d3.event.toElement.className.animVal
            if (mouseDownNode !== d && svgClass == 'inputBox update'){
                var inputId = d3.event.toElement.id;
                // we're in a different node: create new edge for mousedown edge and add to graph
                var newEdge = {source: mouseDownNode, target: d, inputNode: inputId};
                var filtRes = thisGraph.paths.filter(function(d){
                    // this actually avoids recurssive connections //////
                    if (d.source === newEdge.target && d.target === newEdge.source){
                        thisGraph.edges.splice(thisGraph.edges.indexOf(d), 1);
                    }
                    // If node and edge sources/targets match, it returns false
                    return d.source === newEdge.source && d.target === newEdge.target;
                });
                // CREATE SOME LOGIC SO IT ALSO CHECKS FOR INPUT NODE NUMBER
                // If there is no edge already existing, draw a new one
                console.log(newEdge);
                if (!filtRes[0].length){
                    console.log(newEdge);
                    thisGraph.edges.push(newEdge);
                    thisGraph.updateGraph();
                }
            } 
            else{
                // we're in the same node
                // Dragging a node
                if (state.justDragged) {
                    // dragged, not clicked
                    state.justDragged = false;
                } 
                else{
                    if (state.selectedEdge){
                        thisGraph.removeSelectFromEdge();
                    }
                    var prevNode = state.selectedNode;            
                    
                    // We are Selecting a node
                    if (!prevNode || prevNode.id !== d.id){
                        thisGraph.replaceSelectNode(d3node, d);
                    } 
                    // We are deselecting a node
                    else{
                        thisGraph.removeSelectFromNode();
                    }
                }
            }
            state.mouseDownNode = null;
            return;

        }; // end of rects mouseup

        // mousedown on main svg
        GraphCreator.prototype.svgMouseDown = function(){
            this.state.graphMouseDown = true;
        };

        // mouseup on main svg
        GraphCreator.prototype.svgMouseUp = function(){
            var thisGraph = this,
                state = thisGraph.state;

            if (state.justScaleTransGraph) {
                // dragged not clicked
                state.justScaleTransGraph = false;
            } 
            // // Create a new Node
            // else if (state.graphMouseDown && d3.event.shiftKey){
            //     // clicked not dragged from svg
            //     // This should just change the type of node depending on what we do
            //     var xycoords = d3.mouse(thisGraph.svgG.node()),
            //         d = {id: thisGraph.idct++, title: "basicNode", x: xycoords[0], y: xycoords[1], nodeType: 'layerNode'};
            //     // ADDS A NODE TO THE GRAPH BY PUSHING TO THE ARRAY
            //     thisGraph.nodes.push(d);
            //     thisGraph.updateGraph();
            // } 
            // Dragging an edge from the node
            else if (state.shiftNodeDrag){
                // dragged from node
                state.shiftNodeDrag = false;
                thisGraph.dragLine.classed("hidden", true);
            }
            state.graphMouseDown = false;
        };
        
        GraphCreator.prototype.addNodes = function(nodeDiv) {
            var nodeType = nodeDiv.id;
            var xLoc = Math.random()*width; //width/2-200,
                yLoc = Math.random()*height;
            
            var thisGraph = this
            var xycoords = [xLoc, yLoc],
                d = {id: thisGraph.idct++, title: nodeType, x: xycoords[0], y: xycoords[1], nodeType: nodeType+'Node'};
            // ADDS A NODE TO THE GRAPH BY PUSHING TO THE ARRAY
            thisGraph.nodes.push(d);
            thisGraph.updateGraph();
        }

        // keydown on main svg
        GraphCreator.prototype.svgKeyDown = function() {
            var thisGraph = this,
                state = thisGraph.state,
                consts = thisGraph.consts;
            // make sure repeated key presses don't register for each keydown
            if(state.lastKeyDown !== -1) return;

            state.lastKeyDown = d3.event.keyCode;
            var selectedNode = state.selectedNode,
                selectedEdge = state.selectedEdge;

            switch(d3.event.keyCode) {
                case consts.BACKSPACE_KEY:
                case consts.DELETE_KEY:
                    d3.event.preventDefault();
                    if (selectedNode){
                        thisGraph.nodes.splice(thisGraph.nodes.indexOf(selectedNode), 1);
                        thisGraph.spliceLinksForNode(selectedNode);
                        state.selectedNode = null;
                        thisGraph.updateGraph();
                    } 
                    else if (selectedEdge){
                        thisGraph.edges.splice(thisGraph.edges.indexOf(selectedEdge), 1);
                        state.selectedEdge = null;
                        thisGraph.updateGraph();
                    }
                    break;
            }
        };

        GraphCreator.prototype.svgKeyUp = function() {
            this.state.lastKeyDown = -1;
        };
        
        GraphCreator.prototype.zoomed = function(){
            // console.log(9999999)
            this.state.justScaleTransGraph = true;
            // var nodeName = d3.event.sourceEvent.target.nodeName;
            // var className = d3.event.sourceEvent.target.className.animVal;
            // console.log(d3.event.sourceEvent)
            d3.select("." + this.consts.graphClass)
                .attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")"); 
        };

        GraphCreator.prototype.updateWindow = function(svg){
            var docEl = document.documentElement,
                bodyEl = document.getElementsByTagName('body')[0];
            var x = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth;
            var y = window.innerHeight|| docEl.clientHeight|| bodyEl.clientHeight;
            svg.attr("width", x).attr("height", y);
        };

        // call to propagate changes to graph
        GraphCreator.prototype.updateGraph = function(){
            var thisGraph = this,
                consts = thisGraph.consts,
                state = thisGraph.state;

            thisGraph.consts['outBBox'] = [consts.nodeWidth-consts.nodeBox, consts.nodeWidth,
                                            consts.nodeOffset/2,consts.nodeOffset/2+consts.nodeBox]
                                            
            // Paths are svg objects, edges are JS objects
            // Updates paths from JS objects to DOM elements... 
            // I can add a parent node to this
            thisGraph.paths = thisGraph.paths.data(thisGraph.edges, function(d){
                return String(d.source.id) + "+" + String(d.target.id);
            });
            var paths = thisGraph.paths;

            // This returns the information of the current path
            // add new paths
            var diagonal = d3.svg.diagonal()
                .source(function(d) {return {"x":d.source.y+consts.nodeOffset, "y":d.source.x+consts.nodeWidth};})            
                .target(function(d) {                    
                    var start = d.inputNode.indexOf(',');
                    var nodeOffset = Number(d.inputNode.slice(start+1));
                    return {"x":d.target.y+nodeOffset, "y":d.target.x};})
                .projection(function(d) {return [d.y, d.x];});
                
            // update existing paths
            paths.attr("d", diagonal);

            paths.enter()
                .append("path")
                .classed("link", true)
                .attr("d", diagonal)
                .on("mousedown", function(d){
                    thisGraph.pathMouseDown.call(thisGraph, d3.select(this), d);
                })
                .on("mouseup", function(d){
                    state.mouseDownLink = null;
                });

            // remove old links with no new data
            paths.exit().remove();
            
            
            var layerData = thisGraph.nodes.filter(function(d) {return d.nodeType == 'layerNode'});
            thisGraph.layerRects = thisGraph.layerRects
                        .data(layerData, function(d){return d.id;});
            thisGraph.layerRects
                        .attr("transform", function(d){return "translate(" + d.x + "," + d.y + ")";});
                        
            // add new nodes
            var newLayerGs= thisGraph.layerRects
                    .enter().append("g");
            newLayerGs.call(classSelection);
            
            thisGraph.layerRects.exit().remove();
            
            // console.log(this.nodes)
            // console.log(testing);
            // update existing nodes
            // Binds data to the svgs
            var otherData = thisGraph.nodes.filter(function(d) {return d.nodeType != 'layerNode'});
            thisGraph.rects = thisGraph.rects
                        .data(otherData, function(d){return d.id;});
            thisGraph.rects
                        .attr("transform", function(d){return "translate(" + d.x + "," + d.y + ")";});

            // add new nodes
            var newGs= thisGraph.rects
                    .enter().append("g");
            newGs.call(classSelection);
            thisGraph.rects.exit().remove();
                    
            
            // Append rectangles to the group
            // THIS MIGHT BE A GOOD PLACE TO INSERT A SUBGROUP FOR OTHER NODE TYPES
            // newGs.attr("class", function(d) {return consts.rectGClass})
            function classSelection() {
                this.classed(consts.rectGClass, true)
                    // This moves the node to the position of the mouse
                    .attr('id', function(d) {return d.nodeType})
                    .attr("transform", function(d){
                        return "translate(" + d.x + "," + d.y + ")";})
                    .on("mouseover", function(d){  
                        if (state.shiftNodeDrag){
                            d3.select(this).classed(consts.connectClass, true);
                        }
                    })
                    .on("mouseout", function(d){
                        var className = d3.event.target.className.animVal
                        if (className != 'extent' && className != 'domain' && className != 'background' && className != 'sliderHandle') {
                            // console.log(className)
                        }
                        d3.select(this).classed(consts.connectClass, false);
                    })
                    // THIS THINGS SHOULD TRIGGER FOR EVERY INPUT/OUTPUT NODE
                    .on("mousedown", function(d){
                        var className = d3.event.target.className.animVal
                        if (className != 'extent' && className != 'domain' && className != 'background' && className != 'sliderHandle') {
                            // thisGraph.circleMouseDown.call(thisGraph, d3.select(this), d, this);
                        }
                        thisGraph.circleMouseDown.call(thisGraph, d3.select(this), d, this);
                    })
                    // The data bounded to every selection is the node object.
                    // I should bound the node instead....
                    .on("mouseup", function(d){
                        // d3.select(this).selectAll('.inputBox').on('mouseup', function(d){
                        var className = d3.event.target.className.animVal
                        if (className != 'extent' && className != 'domain' && className != 'background' && className != 'sliderHandle') {
                            // thisGraph.circleMouseUp.call(thisGraph, d3.select(this), d, this);
                        }
                        thisGraph.circleMouseUp.call(thisGraph, d3.select(this), d, this);
                        // })
                    })
                    .call(thisGraph.drag);
            }
                

            // ALL OF THIS SHOULDNT BE HARD-CODED
            ///////////////////////////
            // ADD A DIFF CLASS FOR HIGHLIGHT ORIGIN AND OUTPUT
            function basicNodeConstructor(selection, nodeHeight) {
                /////////////
                // In the future it would be better to not have to redraw everything everytime....
                // Only remove if it is not a layerNode
                var remove = false;
                selection.each(function(d) {
                    if (d.nodeType != 'layerNode') {
                        remove = true;
                    }
                });
                if (remove == true) {
                    selection.selectAll('.update').remove();
                }
                
                selection.append("circle")
                    .attr("r", String(3.5))
                    .attr("cy", String(consts.nodeOffset))
                    .attr('class', 'input node update');
                    
                selection.append("circle")
                    .attr("r", String(3.5))
                    .attr("cy", String(consts.nodeOffset))
                    .attr("cx", String(consts.nodeWidth))
                    .attr('class', 'output node update');

                selection.append("rect")
                    .attr("width", String(consts.nodeWidth))
                    .attr("height", String(nodeHeight))
                    .attr("class","update");
                    
                selection.append("rect")
                    .attr("width", String(consts.nodeBox))
                    .attr("height", String(consts.nodeBox))
                    .attr("y", String(consts.nodeOffset/2))
                    .attr('class', 'inputBox update')
                    .attr('id', 'input1,'+String(consts.nodeOffset))
                    .style("opacity", "0.7")
                    .style("fill", "white");
                    
                selection.append("rect")
                    .attr("width", String(consts.nodeBox))
                    .attr("height", String(consts.nodeBox))
                    .attr("y", String(consts.nodeOffset/2))
                    .attr("x", String(consts.nodeWidth-consts.nodeBox))
                    .attr('class', 'outputBox update')
                    .style("opacity", "0.7")
                    .style("fill", "white");
                    
                selection.append("text")
                    .attr("x", 4)
                    .attr("y", 18.5)
                    .text('A')
                    .attr("class","update");
                    
                selection.append("text")
                    .attr("x", consts.nodeWidth-11)
                    .attr("y", 18.5)
                    .text('O')
                    .attr("class","update");
                    
                selection.each(function(d){
                    thisGraph.insertTitleLinebreaks(d3.select(this), d.title);
                });
            }

            function layerNodeConstructor(selection, nodeHeight) {
                // Create the Basic Node
                basicNodeConstructor(selection, nodeHeight);
                
                selection.each(function(d) {
                    d.brushVal = typeof a !== 'undefined' ? d.brushVal : [0,1];
                })
                var extent = [0,1];
                var rightMarginSlider = 48;
                var x = d3.scale.linear()
                    .domain([0, 1])
                    .range([0, consts.nodeWidth-rightMarginSlider])
                    .clamp(true);
                   
                var brush = d3.svg.brush()
                    .x(x)
                    .extent(extent)
                    .on("brushstart", brushmove)
                    .on("brush", brushmove)
                    .on("brushend", brushmove);
                    
                var arc = d3.svg.arc()
                    .outerRadius(consts.sliderHandle)
                    .startAngle(0)
                    .endAngle(function(d, i) { return i ? -Math.PI : Math.PI; });
                
                selection.append("g")
                    .attr("class", "x axis update")
                    .attr("transform", "translate("+consts.rightMargin+","+(consts.individualHeight+(consts.sliderHandle*2))+")")
                    .call(d3.svg.axis()
                    .scale(x)
                    .orient("bottom")
                    .tickValues([0, x.domain()[1]])
                    .tickSize(0)
                    .tickPadding(2))
                    
                var brushg = selection.append("g")
                    .attr("class", "brush update")
                    .attr('id', function(d) {return d.title})
                    .call(brush);
                    
                brushg.selectAll(".resize").append("path")
                    .attr("transform", "translate("+consts.rightMargin+","+(consts.individualHeight+consts.sliderHandle)+")")
                    .attr("d", arc)
                    .attr('class', 'sliderHandle update');
                    
                brushg.selectAll("rect")
                    .attr("transform", "translate("+consts.rightMargin+","+consts.individualHeight+")")
                    .attr("height", consts.sliderHandle*2);
                    
                brushg.append('text')
                    .text(extent[0]+','+extent[1])
                    .attr('class', 'update')
                    .attr("transform", "translate(4,"+
                    (consts.individualHeight+(consts.sliderHandle*2))+")")
                
                function brushmove() {
                    if (d3.event !== null){
                        d3.event.sourceEvent.stopPropagation();
                    }
                    var vals = brush.extent();
                    d3.select(this).select('text').text(vals[0].toFixed(2)+','+vals[1].toFixed(2));
                    brush.on('brushend', function(d) {
                        var brushVals = brush.extent();
                        var layerId = d3.select(this).attr('id');
                        changeProperties2(brushVals, layerId, layerNames, allParticles, pixelLayers, scale, colorScale, layerVals);
                    })
                }

                var startingValue = 0.60;
                var lowLimit = 0.4;
                var xd = d3.scale.linear()
                    .domain([lowLimit, 1.0])
                    .range([0, consts.nodeWidth-rightMarginSlider])
                    .clamp(true);

                var brush_1d = d3.svg.brush()
                    .x(xd)
                    .extent([startingValue, startingValue])
                    .on("brush", brushed);

                selection.append("g")
                    .attr("class", "one axis update")
                    .attr("transform", "translate("+consts.rightMargin+","+
                    (consts.individualHeight+consts.sliderHeight+(consts.sliderHandle*2))+")")
                    .call(d3.svg.axis()
                    .scale(xd)
                    .orient("bottom")
                    .tickValues([xd.domain()[0], xd.domain()[1]])
                    .tickSize(0)
                    .tickPadding(2))
                // .select(".domain")
                // .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                //     .attr("class", "halo");

                var slider = selection.append("g")
                    .attr("class", "onedSlider update")
                    .attr('id', function(d) {return d.title})
                    .call(brush_1d);

                slider.selectAll(".extent,.resize")
                    .remove();

                slider.select(".background")
                    .attr("transform", "translate("+consts.rightMargin+","+(consts.individualHeight*2)+")")
                    .attr("height", 10);

                var handle = slider.append("circle")
                    .attr("class", "sliderHandle update")
                    .attr("transform", "translate("+consts.rightMargin+","+
                    (consts.individualHeight+consts.sliderHeight+(consts.sliderHandle*2)-consts.sliderHandle)+")")
                    .attr("r", consts.sliderHandle);

                slider
                    .call(brush_1d.extent([startingValue, startingValue]))
                    .call(brush_1d.event);
                    
                slider.append('text')
                    .text(startingValue)
                    .attr('class', 'update')
                    .attr("transform", "translate(4,"+
                    (consts.individualHeight+consts.sliderHeight+(consts.sliderHandle*2))+")")

                function brushed() {
                    var value = brush_1d.extent()[0];

                    if (d3.event.sourceEvent && d3.event.sourceEvent.type != 'drag') { // not a programmatic event
                        d3.event.sourceEvent.stopPropagation();
                        // value = x.invert(d3.mouse(this)[0]);
                        brush_1d.extent([value, value]);
                        
                        var layerId = d3.select(this).attr('id');
                        changeOpacityIndividual2(layerNames, layerId, value, pixelLayers, allParticles)
                    }
                    d3.select(this).select('circle').attr("cx", xd(value));
                    d3.select(this).select('text').text(value.toFixed(2));
                }
            }
            
            function multiInputNodeConstructor(selection, nodeHeight, nodeNumber) {
                
                    
                // Create the Basic Node
                basicNodeConstructor(selection, nodeHeight);
                    
                // Add Additional Input Boxes and Text
                var allChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
                for (var i=1; i<nodeNumber; i++) {
                    // consts.nodeBox+consts.nodeOffset
                    var inputId = i+1;
                    
                    // Add input Nodes
                    var arc = d3.svg.arc()
                        .outerRadius(3.5)
                        .startAngle(0)
                        .endAngle(function(d, i) { return i+1 ? -Math.PI : Math.PI; });
                    
                    selection.append("path")
                        .attr("transform", "translate(0,"+String(consts.individualHeight*i+(consts.nodeOffset*.5))+")")
                        .attr("d", arc)
                        .attr('class', 'input node update');

                    selection.append("rect")
                        .attr("width", String(consts.nodeBox))
                        .attr("height", String(consts.nodeBox))
                        .attr("y", String(i*consts.individualHeight))
                        .attr('class', 'inputBox update')
                        .attr('id', 'input'+inputId+','+String(i*consts.individualHeight+(consts.nodeOffset*.5)))
                        .style("opacity", "0.7")
                        .style("fill", "white");
                        
                    selection.append("text")
                        .attr("x", 4)
                        .attr("y", i*consts.individualHeight+11.5)
                        .text(allChars.charAt(i))
                        .attr("class","update");
                }
            }
            
            function multiplicationNodeConstructor(selection, nodeHeight) {
                // Create the Basic Node
                multiInputNodeConstructor(selection, nodeHeight, 2);
                
                function evalNode() {
                    console.log('evaluating!');
                }
            }
            
            function divisionNodeConstructor(selection, nodeHeight) {
                // Create the Basic Node
                multiInputNodeConstructor(selection, nodeHeight, 2);
                
                function evalNode() {
                    console.log('evaluating!');
                }
            }
            
            function additionNodeConstructor(selection, nodeHeight) {
                // Create the Basic Node
                multiInputNodeConstructor(selection, nodeHeight, 2);
                
                function evalNode() {
                    console.log('evaluating!');
                }
            }
            
            function subtractionNodeConstructor(selection, nodeHeight) {
                // Create the Basic Node
                multiInputNodeConstructor(selection, nodeHeight, 2);
                
                function evalNode() {
                    console.log('evaluating!');
                }
            }
            
            function andNodeConstructor(selection, nodeHeight) {
                // Create the Basic Node
                multiInputNodeConstructor(selection, nodeHeight, 2);
                
                function evalNode() {
                    console.log('evaluating!');
                }
            }
            
            function orNodeConstructor(selection, nodeHeight) {
                // Create the Basic Node
                multiInputNodeConstructor(selection, nodeHeight, 2);
                
                function evalNode() {
                    console.log('evaluating!');
                }
            }
            
            function xAndNodeConstructor(selection, nodeHeight) {
                // Create the Basic Node
                multiInputNodeConstructor(selection, nodeHeight, 2);
                
                function evalNode() {
                    console.log('evaluating!');
                }
            }
            
            function xOrNodesConstructor(selection, nodeHeight) {
                // Create the Basic Node
                multiInputNodeConstructor(selection, nodeHeight, 2);
                
                function evalNode() {
                    console.log('evaluating!');
                }
            }
            
            function logarithmNodesConstructor(thisGraph, selection, nodeHeight) {
                // Create the Basic Node
                basicNodeConstructor(selection, nodeHeight);                
                
                // Evaluation function specific to the Node      
                function evalNode(values) {
                    /////////////////////////////
                    // Super Hacky.....
                    // FIX ME: figure a better way for this... also, the node should output something.....
                    // MAYBE I CAN ADD AN ATTRIB TO THE NODE WITH THE NEW VALS????//////
                    var minVal = minArray(values);
                    var newVals = [];
                    for (var i=0; i<values.length; i++){
                        var val = values[i];
                        if (val == 0){val = minVal}
                        newVals.push(Math.log(val));
                    }
                    var scale = d3.scale.linear()
                            .domain([realMinArray(newVals), maxArray(newVals)])
                            .range([0, 1]);
                    var updatedVals = []
                    for (var i = 0; i<newVals.length; i++) {
                        updatedVals.push(scale(newVals[i]));
                    }
                    return updatedVals;
                }
                
                // Evaluate the node if it gets a new connections
                /////////////////////////////
                // Add some logic to only evaluate THIS... ie whatever changes
                // FIX ME: If the edge gets deleted, it should not evaluate //////
                if (d3.event) {
                    if (d3.event.type != 'drag') {
                        var evalResult = edgeConnection(selection, thisGraph, evalNode, layerVals);
                    }
                }                
            }
            
            // Checks if there is an edge comming to the node
            // FIX ME: this should probably be a function that should be 
            // reused by all the node constructors....
            function edgeConnection(selection, thisGraph, evalNode, layerVals) {
                if (selection[0].length > 0) {
                    var thisId = selection.attr('id');

                    var inputEdge = thisGraph.paths.each(function (d){
                        // var newVals = [];
                        if (d.target.nodeType == thisId){
                            var thisLayerVals = d.source.layerVals;
                            var layerId = d.source.title;
                            
                            var newVals = evalNode(thisLayerVals);
                            var brushVals = [0, 1]
                            var newNames = slugifyList(layerNames);

                            // Reset the Props
                            var layerIndex = newNames.indexOf(layerId);
                            layerVals[layerIndex] = newVals;
                            //////////////////////
                            // FIX ME..........
                            // I need to figure out a way to keep the original values if needed, or if the node is deleted
                            changeProperties2(brushVals, layerId, layerNames, allParticles, pixelLayers, scale, colorScale, layerVals);
                            return newVals;
                        }
                    })
                }
            }
            
            function minArray(a) {
                var min=a[0]; 
                for(var i=0,j=a.length;i<j;i++){
                    if (a[i] > 0){
                        min=a[i]<min?a[i]:min;
                    }
                }
                return min;
            }
            
            function realMinArray(b) {
                return Math.min.apply(null, b);
            }

            function maxArray(b) {
                return Math.max.apply(null, b);
            }

            
            // Select all the different node types created
            newLayerGs.call(layerNodeConstructor, [80]);
            // var layerNodes = d3.selectAll('#layerNode').call(layerNodeConstructor, [80]);
            var multiplicationNodes = d3.selectAll('#MultiplicationNode');
            var divisionNodes = d3.selectAll('#DivisionNode');
            var additionNodes = d3.selectAll('#AdditionNode');
            var subtractionNodes = d3.selectAll('#SubtractionNode');
            var andNodes = d3.selectAll('#AndNode');
            var orNodes = d3.selectAll('#OrNode');
            var xAndNodes = d3.selectAll('#XAndNode');
            var xOrNodes = d3.selectAll('#XOrNode')
            var logNodes = d3.selectAll('#LogarithmNode');
            
            // Construct all the nodes with different functions
            // Layer Nodes
            // layerNodeConstructor(layerNodes, 80);
            
            var doubleInputHeight = 52;
            // Multiplication Nodes
            multiplicationNodeConstructor(multiplicationNodes, doubleInputHeight);
            // Division Nodes
            divisionNodeConstructor(divisionNodes, doubleInputHeight); 
            // Addition Nodes
            additionNodeConstructor(additionNodes, doubleInputHeight); 
            // Subtraction Nodes
            subtractionNodeConstructor(subtractionNodes, doubleInputHeight);
            // And Nodes
            andNodeConstructor(andNodes, doubleInputHeight); 
            // Or Nodes
            orNodeConstructor(orNodes, doubleInputHeight);
            // XAnd Nodes
            xAndNodeConstructor(xAndNodes, doubleInputHeight);
            // XOr Nodes
            xOrNodesConstructor(xOrNodes, doubleInputHeight);
            // Logarithm Nodes
            logarithmNodesConstructor(thisGraph, logNodes, consts.individualHeight);
 
            // remove old nodes
            thisGraph.rects.exit().remove();
        };


        /**** MAIN ****/    
        var docEl = document.documentElement,
            bodyEl = document.getElementsByTagName('body')[0];

        var width = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth,
            height =  window.innerHeight|| docEl.clientHeight|| bodyEl.clientHeight;

        var xLoc = width/2 - 25,
            yLoc = 100;

        // initial layer data
        var nodes = [];
        for (var i=0; i<layerNames.length; i++) {
            nodes[i] = {title: layerNames[i], id: i, x: 50+i*150, y: 50+i*50, 
                        nodeType: 'layerNode', layerVals: layerVals[i]}
        }

        var edges = [];
        for (var n=0; n<nodes.length-1; n++) {
            edges[n] = {source: nodes[n], target: nodes[n+1], inputNode:'input1,'+String(14.4)}
        }

        /** MAIN SVG **/
        var svg = d3.select("#graphMakerControls").append("svg")
            .attr("width", width)
            .attr("height", height)
            .classed("myTest", true);

        var graph = new GraphCreator(svg, nodes, edges);
            graph.setIdCt(10);
        graph.updateGraph();
};

function randomArray(length, max) {
    return Array.apply(null, Array(length)).map(function(_, i) {
        return Math.random() * max;
    });
}

// var layers = ['Asthma', 'Cancer', 'Population', 'Income'];
// var randomVals = [];
// for (var i=0; i<layers.length; i++) {
//     randomVals[i] = randomArray(4000, 1.0);
// }

// graphMaker(window.d3, window.saveAs, window.Blob, layers, randomVals);


