import React from 'react';
import { connect } from 'react-redux';
import $ from 'jquery';

import * as Action from '../store/actions.js';
import * as consts  from '../store/consts.js';

import Slider from './Slider.js';
import { DropdownButton, MenuItem } from 'react-bootstrap';


class VPL extends React.Component{
  constructor(props){
    super(props);
    this.width = 200;
    this.height = 100;
    this.style = {
      rx: '2px',
      ry: '2px',
      niw: 20, // node input width
      nih: 20, // node input height
      nito: 5, // node input top offset
      nibo: 30, // node input top offset
      tltlo:  5, // top left text left offset
      tltto:  20, // top left text top offset
      niClassName: "nodeInput",
      

    }
    
    this.linksMap = this.refToElement(this.props.links);
    this.nodesMap = this.refToElement(this.props.nodes);
    this.nodeToLink = this.populateNodeToLink(this.props);
    this.linkToNode = this.populateLinkToNode(this.props);
    this.linksList = this.populateLinksList(this.props);

    this.dp = {
      mouseInNode: false,
      nodeUnderMouse: null,
      nodeUnderMouseRef: null,
      mouseHeld: false,
      offsetX : 0,
      offsetY : 0,
      currentX: 0,
      currentY: 0,
      dx : 0,
      dy : 0,
      shiftPressed : false,
      tempLink: false,
      nodeForConst : null,
    }


    this.logicalNode     = this.props.node;
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp   = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseLeave= this.handleMouseLeave.bind(this);
    this.handleKeyDown   = this.handleKeyDown.bind(this);
    this.handleKeyUp     = this.handleKeyUp.bind(this);
    
    this.moveLinkStartTo = this.moveLinkStartTo.bind(this);
    this.moveLinkEndTo   = this.moveLinkEndTo.bind(this);
    this.getLinkIndex    = this.getLinkIndex.bind(this);
    this.windowMouseDown = this.windowMouseDown.bind(this);
    this.windowMouseUp   = this.windowMouseUp.bind(this);
    this.getCloseNode    = this.getCloseNode.bind(this);
    this.isValidLink      = this.isValidLink.bind(this);


    this.createNodeObject= this.createNodeObject.bind(this);
    this.AdditionNode     = this.AdditionNode.bind(this);
    this.MultiplicationNode     = this.MultiplicationNode.bind(this);
    this.AndNode     = this.AndNode.bind(this);
    this.OrNode     = this.OrNode.bind(this);
    this.NotNode     = this.NotNode.bind(this);

    // this is just for debugging ...
    this.addNode         = this.addNode.bind(this);
    this.removeLink      = this.removeLink.bind(this);
    this.printMaps       = this.printMaps.bind(this);
    this.displayMouseInfo= this.displayMouseInfo.bind(this);
    this.addAdditionNode = this.addAdditionNode.bind(this);
    this.addMultiplicationNode = this.addMultiplicationNode.bind(this);
    this.addNotNode      = this.addNotNode.bind(this);
    this.addOrNode       = this.addOrNode.bind(this);
    this.addAndNode      = this.addAndNode.bind(this);
    this.addLayerNode    = this.addLayerNode.bind(this);


    $(window).on('keydown', this.handleKeyDown);
    $(window).on('keyup', this.handleKeyUp);
    $(window).on('mousemove', this.displayMouseInfo);

     

  }

  displayMouseInfo(event){
      $("#clientX").html(event.clientX);
      $("#clientY").html(event.clientY);
      $("#pageX").html(event.pageX);
      $("#pageY").html(event.pageY);
      $("#screenX").html(event.screenX);
      $("#screenY").html(event.screenY);
      let mouse = this.currentMousePosition(event);
      $("#currentX").html(mouse.x);
      $("#currentY").html(mouse.y);
      
  }

   printMaps(){
    console.log("=====================================");
    console.log("Nodes Map: ", this.nodesMap);
    console.log("Links Map: ", this.linksMap);
    console.log("Node To Link: ", this.nodeToLink);
    console.log("Link To Node: ", this.linkToNode);
    console.log("Links List: ", this.linksList);
  }

  componentDidMount(){
    $('svg').on('mousemove', this.handleMouseMove);
    $('svg').on('mousedown', this.windowMouseDown);// TODO: revisit this, do you have to listen to the event 
    $('svg').on('mouseup', this.windowMouseUp);//       on the entire window or just the svg
  } 

  componentDidUpdate(nextProps){
    console.log('props changed ...')
    this.linksMap = this.refToElement(this.props.links);
    this.nodesMap = this.refToElement(this.props.nodes);
    this.nodeToLink = this.populateNodeToLink(this.props);
    this.linkToNode = this.populateLinkToNode(this.props);
    this.linksList  = this.populateLinksList(this.props);
    
  }

  refToElement(elements){
      let nodesMap = {};
      elements.map((node) =>{
          nodesMap[node.ref] = node; 
      })
      return nodesMap;
  }

  populateLinkToNode(props){
    let linkToNode = {};
    props.links.map((link) => {
        linkToNode[link.ref] = {
            source: (link.sourceNode)? link.sourceNode.ref: null,
            target: (link.targetNode)? link.targetNode.ref : null ,
        }
    });
    return linkToNode
  }

  populateNodeToLink(props){
    let nodeToLink = {};
    props.nodes.map((node) => {
        nodeToLink[node.ref] = {
            incoming: [],
            outgoing: []
        }
    });
    props.links.map((link) => {
        if(link.sourceNode) nodeToLink[link.sourceNode.ref].outgoing.push(link.ref);
        if(link.targetNode) nodeToLink[link.targetNode.ref].incoming.push(link.ref);
    });
    
    return nodeToLink;
  }

  populateLinksList(props){
    let links = {};
    props.links.map((link) => {
        if(link.ref !== "tempLink")
            links[link.sourceNode.ref +"_"+ link.targetNode.ref +"_"+link.type] = true;
    });
    return links;
  }

  isValidLink(link){
      let source = link.sourceNode;
      let target = link.targetNode;
      let type   = link.type; 
      let linksListRep = source.ref + "_" + target.ref + "_" + type;
      if(target.type === consts.LAYER_NODE){
          return false;
      }
      if(this.linksList[linksListRep]){
          return false;
      }
      if(type === "BOTTOM" && (target.type === consts.NOT_NODE)){
          return false;
      }
      return true;
  }
  windowMouseDown(event){
      this.dp.mouseHeld = true;
      let mouse = this.currentMousePosition(event);
      this.dp.currentX = mouse.x;
      this.dp.currentY = mouse.y;
  }

  windowMouseUp(event){
      let pos = (node) => (
            { 
                x : node.position.x  + node.translate.x,
                y : node.position.y  + node.translate.y
            }
      );
      this.dp.mouseHeld = false;
      this.dp.currentX = 0;
      this.dp.currentY = 0;
      if(this.dp.shiftPressed){
        if(this.dp.tempLink){
            let mouse = this.currentMousePosition(event);
            let closeEnoughNode = this.getCloseNode(mouse)[0];
            
            if(!(closeEnoughNode == null)){
                    let newLink = {
                        ref : "link_" + this.props.links.length,
                        sourceNode: this.nodesMap[this.dp.nodeForConst],
                        targetNode: closeEnoughNode.node,
                        source : pos(this.nodesMap[this.dp.nodeForConst]),
                        target : pos(closeEnoughNode.node),
                        type : closeEnoughNode.type,

                    }
                if(this.isValidLink(newLink)){
                    console.log("created new Link");
                    Action.vlangAddLink(newLink);
                }
                else{
                    console.log("link found ... didnt create");
                }
            }
            

            Action.vlangRemoveLink(this.getLinkIndex(this.props.links, "tempLink"));
            this.dp.tempLink = false;
        }
      }
    this.dp.nodeForConst = null;
  }

  handleMouseDown(event){
    let mouse = this.currentMousePosition(event);    
    let node = event.currentTarget;
    if(this.dp.shiftPressed){
        this.dp.nodeForConst = $(node).attr('id');
        let sourceNode = this.nodesMap[$(node).attr('id')];
        let newLinkSource = {
            x : sourceNode.position.x + sourceNode.translate.x,
            y : sourceNode.position.y + sourceNode.translate.y,
         };      
        
        let newLink = {ref: "tempLink", sourceNode: sourceNode,  source: newLinkSource, target: mouse};  // needs sourceNode
        Action.vlangAddLink(newLink);
        this.dp.tempLink = true;
        
    }
    else{
        
        
        this.mouseInNode = true;
        this.dp.nodeUnderMouse = node;
        this.dp.nodeUnderMouseRef = $(node).attr('id');
        this.dp.nodeForConst = $(node).attr('id');
        let nodeR = this.nodesMap[this.dp.nodeUnderMouseRef];

        this.dp.dx = mouse.x - ( nodeR.position.x + nodeR.translate.x);
        this.dp.dy = mouse.y - ( nodeR.position.y + nodeR.translate.y);

        this.dp.offsetX =  mouse.x ;
        this.dp.offsetY =  mouse.y ;//- $(event.target).attr('y');
        
    }
  }

  handleMouseUp(event){
    if(this.dp.shiftPressed){
        if(this.dp.tempLink){
            Action.vlangRemoveLink(this.getLinkIndex(this.props.links, "tempLink"));        
        }
    }
    else{
       
        let translation = this.dp.nodeUnderMouse.getAttributeNS(null, "transform").slice(10,-1).split(',');
        let sx = parseInt(translation[0].replace(/ /g,''));
        let sy = parseInt(translation[1].replace(/ /g,''));
        Action.vlangMoveNode(this.getLinkIndex(this.props.nodes, this.dp.nodeUnderMouseRef), {x: sx, y: sy});
      
    }
     
    this.dp.nodeUnderMouseRef = null;
    this.dp.mouseHeld = false;
    this.dp.nodeUnderMouse = null; 
  }

  handleMouseMove(event){
        if(this.dp.mouseHeld){
            let mouse = this.currentMousePosition(event);
            
            let dx = - this.dp.currentX + mouse.x;
            let dy = - this.dp.currentY + mouse.y;

            if(this.dp.shiftPressed && this.dp.tempLink){
                let e = {
                    x: mouse.x,
                    y: mouse.y - 15
                } 
                this.moveLinkEndTo("tempLink", e);
            }
        
            else{
                
                let node = this.nodesMap[this.dp.nodeUnderMouseRef];
                
                if(this.dp.nodeUnderMouse){  
                    let s  = {
                                x: (mouse.x - this.dp.dx) ,
                                y: (mouse.y - this.dp.dy) 
                            };
                    let t = this.nodesMap[this.dp.nodeUnderMouseRef].translate;
                    $(this.dp.nodeUnderMouse).attr('transform', 'translate('+(t.x + dx)+','+ (t.y + dy)+')');
                    
                    this.nodeToLink[this.dp.nodeUnderMouseRef].outgoing.map((link) => {
                        
                        this.moveLinkStartTo(link, s);
                    });
                    this.nodeToLink[this.dp.nodeUnderMouseRef].incoming.map((link) => {
                        
                        this.moveLinkEndTo(link, s);
                        
                    }); 
                    
                }
                
            }
            
        }
    }

  handleMouseOver(event){
    this.dp.mouseInNode = true;
    if(this.dp.shiftPressed){
         $(event.target).addClass('activeNode');
    }  
  }

  handleMouseLeave(event){
    $(event.target).removeClass('activeNode');
  }

  handleKeyDown(event){
    if(event.keyCode === 16)//shift key pressed
    {
        this.dp.shiftPressed = true;
    }
  }

  handleKeyUp(event){
    if(event.keyCode === 16){
        if(this.dp.shiftPressed){
         if(this.dp.tempLink){
            this.dp.tempLink = false;
         }
        this.dp.shiftPressed = false;
        }
    }
  }
  diagonal(source, target) {
        return "M" + source.x + "," + source.y
            + "C" + (source.x + target.x) / 2 + "," + source.y
            + " " + (source.x + target.x) / 2 + "," + target.y
            + " " + target.x + "," + target.y;
    }

  createTempLink(startPosition, endPosition){
      return (
          <path className={"tempLink"} d={this.diagonal(startPosition, endPosition)} />
      );
  }

  currentMousePosition(event){
    return {
        x : event.pageX - $('svg').offset().left,
        y : event.pageY - $('svg').offset().top
    }
  }

  getLinkIndex(links, linkRef){
        let wantedIndex = null;
        links.map((link, index) => {
            if(link.ref === linkRef){
                wantedIndex = index;
            }
        });
        if(wantedIndex == null)
            throw this.NoLinkFoundException();
        return wantedIndex
           
  }

  createRangeSlider(){
      return(
        <g id="rangeSlider">
            <rect id="rangeSliderInner" />

            <g id="rangeSliderTrack">
                <rect id="rangeSliderTrackInner" />
                <rect id="track-fill" />
            </g>

            <g id="rangeSliderHandle">
                <circle id="rangeSliderHandleInner" />        
            
            </g>      
        </g>    
      );
  }

  getCloseNode(position){
      let p = position;
      let closeEnoughNodes = [];
      let nodes = Object.keys(this.nodesMap);
      nodes.forEach((key, index) => {  
          
          let cNode = this.nodesMap[key];
          let cX = cNode.position.x + cNode.translate.x;
          let cY = cNode.position.y + cNode.translate.y;
          if(Math.abs(p.x - cX) < 50 && Math.abs(p.y - (cY + 15) < 20)){
              closeEnoughNodes.push({type: 'TOP', node: cNode});
             
          }
          else if(Math.abs(p.x - cX) < 50 && Math.abs(p.y - (cY + 40) < 20)){
              closeEnoughNodes.push({type: 'BOTTOM', node: cNode});
             
          }
          
      })
      return closeEnoughNodes;
      
  }



  createNodeObject(node, key){
      let p = node.position;
      return(
        <g className = {"node"}
           id = {node.ref}
           key = {key}
           onMouseOver  = {this.handleMouseOver}
           onMouseLeave = {this.handleMouseLeave}
           onMouseUp    = {this.handleMouseUp}
           onMouseDown  = {this.handleMouseDown}
           transform = {`translate(${node.translate.x},${node.translate.y})`}
        >
        {
           this.decideNodeType(node.type, p)
        }
        </g>
      );
  }

  decideNodeType(type, p){
    switch(type){
        case consts.LAYER_NODE:
            return  this.LayerNode(p);
        case consts.MULTIPLICATION_NODE:
            return  this.MultiplicationNode(p);
        case consts.AND_NODE:
            return  this.AndNode(p);
        case consts.OR_NODE:
            return  this.OrNode(p);
        case consts.NOT_NODE:
            return  this.NotNode(p);
        default:
            return  this.AdditionNode(p);
    }
  };


  AdditionNode(p){
      return(
       <g>
            <rect className = {"nodeMain"} width= {this.width} height ={this.height} 
            x = {p.x} y = {p.y} ></rect>
            <rect className = {this.style.niClassName} width= {this.style.niw} height = {this.style.nih} x ={p.x} y ={p.y + this.style.nito}></rect>
            <rect className = {this.style.niClassName} width= {this.style.niw} height = {this.style.nih} x ={p.x} y ={p.y + this.style.nibo}></rect>
            <rect className = {this.style.niClassName} width= {this.style.niw} height = {this.style.nih} x = {p.x + this.width - 20} y ={p.y + this.style.nito}></rect>
            <text className = {"nodeInputLabel"} x = {p.x + this.style.tltlo} y = {p.y + this.style.tltto} fontSize={"15"}>A</text>
            <text className = {"nodeInputLabel"} x = {p.x + this.style.tltlo} y = {p.y + this.style.tltto + 25} fontSize={"15"}>B</text>
            <text className = {"nodeInputLabel"} x = {p.x + this.style.tltlo + this.width - 20} y = {p.y + this.style.tltto} fontSize={"15"}>O</text>
            <text className = {"nodeText"} x = {p.x + 80} y = {p.y + 25} fontSize={"20"}>              
                    ADD
            </text>
             <text className = {"nodeText"} x = {p.x + 30} y = {p.y + 30} fontSize={"10"}>                
                    
            </text>
            <Slider position={p}/>
        </g>
        );
  }

  MultiplicationNode(p){
      return(
       <g>
            <rect className = {"nodeMain"} width= {this.width} height ={this.height} 
            x = {p.x} y = {p.y} ></rect>
            <rect className = {this.style.niClassName} width= {this.style.niw} height = {this.style.nih} x ={p.x} y ={p.y + this.style.nito}></rect>
            <rect className = {this.style.niClassName} width= {this.style.niw} height = {this.style.nih} x ={p.x} y ={p.y + this.style.nibo}></rect>
            <rect className = {this.style.niClassName} width= {this.style.niw} height = {this.style.nih} x = {p.x + this.width - 20} y ={p.y + this.style.nito}></rect>
            <text className = {"nodeInputLabel"} x = {p.x + this.style.tltlo} y = {p.y + this.style.tltto} fontSize={"15"}>A</text>
            <text className = {"nodeInputLabel"} x = {p.x + this.style.tltlo} y = {p.y + this.style.tltto + 25} fontSize={"15"}>B</text>
            <text className = {"nodeInputLabel"} x = {p.x + this.style.tltlo + this.width - 20} y = {p.y + this.style.tltto} fontSize={"15"}>O</text>
            <text className = {"nodeText"} x = {p.x + 50} y = {p.y + 25} fontSize={"20"}>              
                    MULTIPLY
            </text>
             <text className = {"nodeText"} x = {p.x + 30} y = {p.y + 30} fontSize={"10"}>                
                    
            </text>
            <Slider position={p}/>
        </g>
        );
  }
  AndNode(p){
      return(
       <g>
            <rect className = {"nodeMain"} width= {this.width} height ={this.height} 
            x = {p.x} y = {p.y} ></rect>
            <rect className = {this.style.niClassName} width= {this.style.niw} height = {this.style.nih} x ={p.x} y ={p.y + this.style.nito}></rect>
            <rect className = {this.style.niClassName} width= {this.style.niw} height = {this.style.nih} x ={p.x} y ={p.y + this.style.nibo}></rect>
            <rect className = {this.style.niClassName} width= {this.style.niw} height = {this.style.nih} x = {p.x + this.width - 20} y ={p.y + this.style.nito}></rect>
            <text className = {"nodeInputLabel"} x = {p.x + this.style.tltlo} y = {p.y + this.style.tltto} fontSize={"15"}>A</text>
            <text className = {"nodeInputLabel"} x = {p.x + this.style.tltlo} y = {p.y + this.style.tltto + 25} fontSize={"15"}>B</text>
            <text className = {"nodeInputLabel"} x = {p.x + this.style.tltlo + this.width - 20} y = {p.y + this.style.tltto} fontSize={"15"}>O</text>
            <text className = {"nodeText"} x = {p.x + 80} y = {p.y + 25} fontSize={"20"}>              
                    AND
            </text>
             <text className = {"nodeText"} x = {p.x + 30} y = {p.y + 30} fontSize={"10"}>                
                    
            </text>
            <Slider position={p}/>
        </g>
        );
  }

  OrNode(p){
     return(
       <g>
            <rect className = {"nodeMain"} width= {this.width} height ={this.height} 
            x = {p.x} y = {p.y} ></rect>
            <rect className = {this.style.niClassName} width= {this.style.niw} height = {this.style.nih} x ={p.x} y ={p.y + this.style.nito}></rect>
            <rect className = {this.style.niClassName} width= {this.style.niw} height = {this.style.nih} x ={p.x} y ={p.y + this.style.nibo}></rect>
            <rect className = {this.style.niClassName} width= {this.style.niw} height = {this.style.nih} x = {p.x + this.width - 20} y ={p.y + this.style.nito}></rect>
            <text className = {"nodeInputLabel"} x = {p.x + this.style.tltlo} y = {p.y + this.style.tltto} fontSize={"15"}>A</text>
            <text className = {"nodeInputLabel"} x = {p.x + this.style.tltlo} y = {p.y + this.style.tltto + 25} fontSize={"15"}>B</text>
            <text className = {"nodeInputLabel"} x = {p.x + this.style.tltlo + this.width - 20} y = {p.y + this.style.tltto} fontSize={"15"}>O</text>
            <text className = {"nodeText"} x = {p.x + 85} y = {p.y + 25} fontSize={"20"}>              
                    OR
            </text>
            <Slider position={p}/>
        </g>
    ); 
  }

  NotNode(p){
     return(
       <g>
            <rect className = {"nodeMain"} width= {this.width} height ={this.height} 
            x = {p.x} y = {p.y} ></rect>
            <rect className = {this.style.niClassName} width= {this.style.niw} height = {this.style.nih} x ={p.x} y ={p.y + this.style.nito}></rect>
            
            <rect className = {this.style.niClassName} width= {this.style.niw} height = {this.style.nih} x = {p.x + this.width - 20} y ={p.y + this.style.nito}></rect>
            <text className = {"nodeInputLabel"} x = {p.x + this.style.tltlo} y = {p.y + this.style.tltto} fontSize={"15"}>i</text>
           
            <text className = {"nodeInputLabel"} x = {p.x + this.style.tltlo + this.width - 20} y = {p.y + this.style.tltto} fontSize={"15"}>O</text>
            <text className = {"nodeText"} x = {p.x + 80} y = {p.y + 25} fontSize={"20"}>              
                    NOT
            </text>
             <text className = {"nodeText"} x = {p.x + 30} y = {p.y + 30} fontSize={"10"}>                
                    
            </text>
            <Slider position={p}/>
        </g>
    ); 
  }

 LayerNode(p){
     return(
       <g>
            <rect className = {"nodeMain"} width= {this.width} height ={this.height} 
            x = {p.x} y = {p.y} ></rect>        
            <rect className = {this.style.niClassName} width= {this.style.niw} height = {this.style.nih} x = {p.x + this.width - 20} y ={p.y + this.style.nito}></rect>         
            <text className = {"nodeInputLabel"} x = {p.x + this.style.tltlo + this.width - 20} y = {p.y + this.style.tltto} fontSize={"15"}>O</text>
            <text className = {"nodeText"} x = {p.x + 30} y = {p.y + 15} fontSize={"10"}>              
                    Lorem ipsum dolor sit
            </text>
             <text className = {"nodeText"} x = {p.x + 30} y = {p.y + 30} fontSize={"10"}>                
                    consectetur adipiscing
            </text>
            <Slider position={p}/>
        </g>
    ); 
  }
  
  
  


  createLinkObject(link, key){
    if(link.type === 'BOTTOM'){
        return (
            <path markerEnd="url(#Triangle)" ref={link.ref} key = {key} className={"link"} d={this.diagonal(this.getOutgoingLinkPosition(link.source), this.bottomIncomingLinkPosition(link.target))}></path>
        );
    }
    else{
         return (
            <path markerEnd="url(#Triangle)" ref={link.ref} key = {key} className={"link"} d={this.diagonal(this.getOutgoingLinkPosition(link.source), this.topIncomingLinkPosition(link.target))}></path>
        );
    }
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }

  NoLinkFoundException()
  { 
      return "No link found";
  }

  getRandomPosition(){
      return {
          x: this.getRandomInt(0, 700),
          y: this.getRandomInt(0, 500)
        
      }
  }
  topIncomingLinkPosition(position){
      return {
          x: position.x, 
          y: position.y + 15,
      }
  }

  bottomIncomingLinkPosition(position){
      return {
          x: position.x, 
          y: position.y + 40,
      }
  }

  getOutgoingLinkPosition(position){
      return {
          x: position.x + this.width,
          y: position.y + 15
      }
  }

  addNode(nodeType){
    Action.vlangAddNode({ ref: "node_" + this.props.nodes.length + 1, type: nodeType,  position: this.getRandomPosition(), translate: {x: 0, y: 0}});
  }

  addAdditionNode(){
    this.addNode(consts.ADDITION_NODE);
  }
  addMultiplicationNode(){
    this.addNode(consts.MULTIPLICATION_NODE);
  }
  addOrNode(){
    this.addNode(consts.OR_NODE);
  }
  addAndNode(){
    this.addNode(consts.AND_NODE);
  }
  addNotNode(){
    this.addNode(consts.NOT_NODE);
  }
  addLayerNode(){
    this.addNode(consts.LAYER_NODE);
  }

  removeNode(){
      let x = parseInt($('#moveX').val());
      let y = parseInt($('#moveY').val());
      let position = {x: x, y: y};
      Action.vlangMoveNode(0, position);
  }
  removeLink(){
      Action.vlangRemoveLink(this.getLinkIndex(this.props.links, 'link_1'));
  }

  linkMarker(){
    return(
      <defs>
        <marker id="Triangle" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="3" markerHeight="3" orient="auto">
          <path d="M 0 0 L 0 10 L 10 10 L 10 0 z" />
        </marker>
      </defs>
    );
  }


  moveLinkStartTo(link, position){
     let l = this.linksMap[link];
     var ogl = this.getOutgoingLinkPosition(position);
     var icl = l.type === 'BOTTOM'? this.bottomIncomingLinkPosition(l.target) : this.topIncomingLinkPosition(l.target);
     this.linksMap[link].source = position;
     $(this.refs[link]).attr('d', this.diagonal(ogl, icl));

  }

  moveLinkEndTo(link, position){
     let l = this.linksMap[link];
     let ogl = this.getOutgoingLinkPosition(l.source);
     let icl = l.type === 'BOTTOM' ? this.bottomIncomingLinkPosition(position) : this.topIncomingLinkPosition(position);
     this.linksMap[link].target = position;
     $(this.refs[link]).attr('d', this.diagonal(ogl, icl));

  }

  render(){
    return (
        <div className = "pull-right col-md-10 vplContainer">
            <div className = "row">
            <div className = "col-md-10"></div>
            <div className = "col-md-2">
              <DropdownButton title={"Add Node"}  id={`dropdown-basic-1`}>
                <MenuItem onClick = {this.addAdditionNode}>Addition Node</MenuItem>
                <MenuItem onClick = {this.addMultiplicationNode}>Multication Node</MenuItem>
                <MenuItem onClick = {this.addAndNode}>And Node</MenuItem>
                <MenuItem onClick = {this.addOrNode}>Or Node</MenuItem>
                <MenuItem onClick = {this.addNotNode}>Not Node</MenuItem>
                <MenuItem onClick = {this.addLayerNode}>Layer Node</MenuItem>
               </DropdownButton>
            </div>

            </div>
            <div className = "row">
              <svg ref ={"mainSvgElement"} width="100%" height={'800px'} xmlns="http://www.w3.org/2000/svg">
                  {this.linkMarker()}
                  {this.props.nodes.map((node, index) => {
                      return this.createNodeObject(node, index);  
                  })}
                  {this.props.links.map((link, index) => {
                      return this.createLinkObject(link, index);
                  })}
              </svg> 
            </div>  
        </div>
    );
  }
}

const mapStateToProps = (state) =>{
    
    return {nodes: state.vpl.nodes, links: state.vpl.links};
};

export default connect(mapStateToProps)(VPL);