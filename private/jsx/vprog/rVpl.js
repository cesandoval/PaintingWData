import React from 'react';
import { connect } from 'react-redux';
import $ from 'jquery';
import Rx from 'rxjs/Rx'
import _ from 'lodash'



import * as Action from '../store/actions.js';
import * as consts  from '../store/consts.js';

import Slider from './Slider.js';
import Panel from './Panel.js';
import { DropdownButton, MenuItem } from 'react-bootstrap';

import * as NodeType from './nodeTypes'
// console.log('NodeType', Object.keys(NodeType))

import {Nodes, Links} from './mockData'
// console.log('mockData', {nodes, links})


// TODO: typo fix (addSubractionNode -> addSubtractionNode)
// TODO: remove color2
// TODO: nodeSVG() for dataset layer. need property?

const style = {
  node: {
    rx: '2px', // rect radius
    // ry: '2px', // same as rx
    minWidth: 200,
    minHeight: 130,
    plug: {
      height: 20,
      width: 20,
      marginTop: 30,
    },
    topOffset: 5,
    fontSize: { // px unit
      nodeName: 16,
      propertyName: 10,
      plugName: 14,
    },
  }
}

function observer(label = '') {
  return {
    // next: (n) => console.log(label, 'Next: ', n),
    error: (e) => console.log(label, 'Error: ', e),
    complete: (c) => console.log(label, 'Completed'),
  }
}

const body = document.body;
const mouseDown$ = Rx.Observable.fromEvent(body, "mousedown");
const mouseUp$ = Rx.Observable.fromEvent(body, 'mouseup');
const mouseMove$ = Rx.Observable.fromEvent(body, 'mousemove');
const empty$ = Rx.Observable.empty()


class VPL extends React.Component{
  constructor(props){
    super(props);

    this.width = 200;
    this.height = 130;
    
    /*
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
    */

    this.newProps = {};

    /*
    this.linksMap = this.refToElement(this.props.links);
    this.nodesMap = this.refToElement(this.props.nodes);
    this.nodeToLink = this.populateNodeToLink(this.props);
    this.linkToNode = this.populateLinkToNode(this.props);
    this.linksList = this.populateLinksList(this.props);
    */

    /*
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
    */

    /* this function is defined but never used
    this.logicalNode     = this.props.node;
    */

    /*
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
    */


    this.createNodeObject= this.createNodeObject.bind(this);

    /*
    this.SubtractionNode = this.SubtractionNode.bind(this);
    this.AdditionNode     = this.AdditionNode.bind(this);
    this.MultiplicationNode     = this.MultiplicationNode.bind(this);
    this.DivisionNode = this.DivisionNode.bind(this);
    this.LogarithmNode = this.LogarithmNode.bind(this);
    this.AndNode     = this.AndNode.bind(this);
    this.OrNode     = this.OrNode.bind(this);
    this.NotNode     = this.NotNode.bind(this);
    */

    this.nodeSVG = this.nodeSVG.bind(this);

    /*
    this.getNotZero = this.getNotZero.bind(this);
    */

    this.evalArithmeticNode = this.evalArithmeticNode.bind(this);

    this.logNode = this.logNode.bind(this);

    // Ask: which is for debugging ???
    // this is just for debugging ...

    this.addNode         = this.addNode.bind(this);

    /* unused function
    this.removeLink      = this.removeLink.bind(this);
    */

    /* unused function
    this.printMaps       = this.printMaps.bind(this);
    this.displayMouseInfo= this.displayMouseInfo.bind(this);
    */

    // addNodeType
    /*
    this.addAdditionNode = this.addAdditionNode.bind(this);
    this.addSubractionNode = this.addSubractionNode.bind(this);
    this.addMultiplicationNode = this.addMultiplicationNode.bind(this);
    this.addDivisionNode = this.addDivisionNode.bind(this);
    this.addLogarithmNode = this.addLogarithmNode.bind(this);
    this.addNotNode      = this.addNotNode.bind(this);
    this.addOrNode       = this.addOrNode.bind(this);
    this.addAndNode      = this.addAndNode.bind(this);
    this.addLayerNode    = this.addLayerNode.bind(this);
    */

    this.addVoxelGeometry = this.addVoxelGeometry.bind(this);



    $(window).on('keydown', this.handleKeyDown);
    $(window).on('keyup', this.handleKeyUp);

    /*
    $(window).on('mousemove', this.displayMouseInfo);
    */


    this.state = {
      Nodes,
      Links,
      tempLink: {
        from: {x: 50, y: 50}, to: {x: 50, y: 50},
      }
    }

    this.checked = {
      datasetNode: false,
    }

  }

  // create the dataset nodes if they're not exitst.
  initDatasetNode = () => {
    const datasets = this.props.layers
    console.log('initDatasetNode()', datasets)

    datasets.map( (dataset, index) => {
      console.log('dataset', dataset)

      // TODO: generate hash key for datasets. 
      if(!Nodes[dataset.name]){
        const datasetNode = this.newNodeObj('DATASET')

        datasetNode.position = {
          x: 50,
          y: 50 + 150 * index,
        }
        datasetNode.name = dataset.name

        Nodes[dataset.name] = datasetNode
      }
    })

    this.setState({Nodes})

    return datasets.length > 0
  }

  newNodeObj = (type) => {
    const nodesLength = Object.keys(Nodes).length

    const newNode = {
      name: type,
      type: type,
      options: {},
      position: {
        x: 50 + 200 * (nodesLength / 4),
        y: 50 + 100 * (nodesLength % 4),
      },
      color: d3.hsl(this.getRandomInt(0, 360), '0.6', '0.6').toString(),
      opacity: 0.5,
      visibility: true,
    }

    return newNode;
  } 

  componentWillReceiveProps(newProps){
    this.newProps = newProps;
    // console.log(newProps, 8888888)
    // console.log(this.newProps)

    if(!this.checked.datasetNode){
      this.checked.datasetNode = this.initDatasetNode()
    }
  }

  /* unused functions
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
  */

  componentDidMount(){
    
    /*
    $('svg').on('mousemove', this.handleMouseMove);
    $('svg').on('mousedown', this.windowMouseDown);// TODO: revisit this, do you have to listen to the event 
    $('svg').on('mouseup', this.windowMouseUp);//       on the entire window or just the svg
    */

    this.mouseTracker$ = mouseDown$
      .do((down)=>{console.log(down)})
      .map(down => {

        const nodeDOM = down.target.closest('g.node')
        const plugDOM = down.target.closest('g.plug')
        const controlDOM = down.target.closest('g.control')
        const svgDOM = down.target.closest('svg')

        down.purpose = nodeDOM ? 'move' : 'none'
        
        down.purpose = plugDOM ? 'link' : down.purpose
        down.purpose = controlDOM ? 'none' : down.purpose
        
        switch(down.purpose) {
          case ('move'): {
            const [x, y] = nodeDOM.getAttribute('transform').match(/\d+/g)
            down.info = {x, y, nodeDOM}
            break;
          }
          case ('link'): {
            const nodeKey = nodeDOM.getAttribute('data-key')
            down.info = {nodeDOM, plugDOM, svgDOM}
            break;
          }
        }

        console.log('down purpose : ', down.purpose, down.info)

        return mouseMove$
          .takeUntil(mouseUp$)
          .map(move => ({move, down}))
          .combineLatest( // get the lastest mouse up event
            mouseUp$.mapTo(true).startWith(false).take(2),
            ({move, down}, up) => ({move, down, up})
          )

      })
      .concatAll()
      .do(({move, down}) => {
        // prevent text/element selection with cursor drag
        down.preventDefault()
        move.preventDefault()
      })
      .share()


    this.moveNode$ = this.mouseTracker$
      .filter(({down}) => down.purpose == 'move' )
      // .do(({down, move}) => {console.log('moveNode$', {move, down})})
      // .throttleTime(30) // limit execution time for opt performance
      .map(({down, move}) => ({
          nodeKey: down.info.nodeDOM.getAttribute('data-key'),
          x: Number(down.info.x) + (move.clientX - down.clientX),
          y: Number(down.info.y) + (move.clientY - down.clientY),
        })
      )
      .do(({nodeKey, x, y}) => {
        // console.log("nodeMove", {nodeKey, x, y})
        const newPosition = ({x, y})
        const moveNode = {nodeKey, newPosition}

        this.moveNode(moveNode)
      })
      .subscribe(observer('moveNode$'))


    this.linkNode$ = this.mouseTracker$
      .filter(({down}) => down.purpose == 'link' )
      // .do(({down, link}) => {console.log('linkNode$', {link, down})})
      // .throttleTime(30) // limit execution time for opt performance
      .do(({down, move}) => {
          const plugRect = down.info.plugDOM.getBoundingClientRect()
          const svgRect = down.info.svgDOM.getBoundingClientRect()

          const from = {
            x: plugRect.right - svgRect.left,
            y: plugRect.top + plugRect.height / 2 - svgRect.top,
          }
          const to = {
            // minus 2 to avoid targeting the `link` element.
            x: move.clientX - svgRect.left - 2,
            y: move.clientY - svgRect.top - 2,
          }

          console.log('this.moveTempLink(from, to)', from, to)
          this.moveTempLink({from, to})

        }
      )
      .filter(({up}) => up)
      .do(({down, move, up}) => {
        // clear temp link
        this.moveTempLink({from: {x: 0, y: 0}, to: {x: 0, y: 0}})

        const toPlugDOM = move.target.closest('g[data-plug]')

        if(toPlugDOM){
          const toPlugType = toPlugDOM.getAttribute('data-plug-type')
          // console.log('toPlugType= ', toPlugType)

          if(toPlugType == 'input'){
            // className="plug" data-node-key={nodeKey} data-plug="true" data-plug-type="output" data-output={output} 
            const srcNode = down.info.plugDOM.getAttribute('data-node-key')

            // className="plug" data-node-key={nodeKey} data-plug="true" data-plug-type="input" data-input={input} 
            const toNode = toPlugDOM.getAttribute('data-node-key')
            const toInput = toPlugDOM.getAttribute('data-input')

            this.linkNode({srcNode, toNode, toInput})
          }
        }

      })
      .do(() => {this.linkThenComputeNode()})
      .subscribe(observer('linkNode$'))

  }

  componentWillUnmount(){
    console.log('componentWillUnmount', 'unsubscribe observer')
    this.mouseTracker$.unsubscribe()
    this.moveNode$.unsubscribe()
    this.linkNode$.unsubscribe()
  }

  componentDidUpdate(nextProps){
    console.log('props changed ...')
    /*
    this.linksMap = this.refToElement(this.props.links);
    this.nodesMap = this.refToElement(this.props.nodes);
    this.nodeToLink = this.populateNodeToLink(this.props);
    this.linkToNode = this.populateLinkToNode(this.props);
    this.linksList  = this.populateLinksList(this.props);
    */
  }

  updateNodes = () => {
    this.setState({Nodes})
  }

  moveNode = ({nodeKey, newPosition}) => {
    console.log('moveNode()', {nodeKey, newPosition})
    Nodes[nodeKey].position = newPosition
    this.updateNodes()
  }

  linkNode = ({srcNode, toNode, toInput}) => {
    console.log('linkNode()', srcNode, toNode, toInput)

    // const inputs = {
    //   [toNode]: {
    //     [toInput]: srcNode,
    //   },
    // }
    // const outputs = {
    //   [srcNode]: {
    //     [toNode]: toInput,
    //   },
    // }

    const links = this.state.Links

    // limitation of link
    if(srcNode == toNode)
      return console.log('linkNode(): link same node')

    if(links.inputs[toNode] && links.inputs[toNode][toInput]){
      console.log('linkNode(): one input only allow one link')
      delete links.outputs[links.inputs[toNode][toInput]][toNode]
    }

    // inputs
    if(links.inputs[toNode]){

      // delete the others same srcNode
      Object.entries(links.inputs[toNode])
        .map(([_toInput, _srcNode]) => {
          if(srcNode == _srcNode)
            delete links.inputs[toNode][_toInput]
        })

      links.inputs[toNode][toInput] = srcNode
    }
    else
      links.inputs[toNode] = {
        [toInput]: srcNode,
      }

    // outputs
    if(links.outputs[srcNode])
      links.outputs[srcNode][toNode] = toInput
    else
      links.outputs[srcNode]= {
        [toNode]: toInput,
      }

    this.setState({Links: links})

  }

  createTempLink = () => {
    return (
        <path markerEnd="url(#Triangle)" ref="tempLink" key="tempLink" className={"link"} d={this.diagonal(this.state.tempLink.from, this.state.tempLink.to)}></path>
    );
  }

  moveTempLink = ({from, to}) => {
    this.setState({tempLink: {from, to}})
  }

  createLink = ({linkKey, from, to}) => {
    const linkRef = 'link_' + linkKey
    return (
        <path markerEnd="url(#Triangle)" ref={linkRef} key={linkKey} className={"link"} d={this.diagonal(from, to)}></path>
    );
  }

  createLinks = () => {
    const outputs = this.state.Links.outputs

    const svgDOM = document.querySelector('svg.vpl')
    if(!svgDOM)
      return '';

    return Object.entries(outputs)
      .map(([outputNode, input], index) => {

        const svgRect = svgDOM.getBoundingClientRect()

        const outputNodeDOM = this.refs['node_' + outputNode]
        const outputPlugDOM = this.refs[`${outputNode}_plug_output`]

        console.log('outputNodeDOM', outputNodeDOM)

        return Object.entries(input)
          .map(([inputNode, inputKey], index) => {
            
            const inputNodeDOM = this.refs['node_' + inputNode]
            const inputPlugDOM = this.refs[`${inputNode}_plug_input_${inputKey}`]
            
            const linkKey = `${outputNode}_${inputNode}`

            const outputPlugRect = outputPlugDOM.getBoundingClientRect()
            const inputPlugRect = inputPlugDOM.getBoundingClientRect()

            const from = {
              x: outputPlugRect.right - svgRect.left,
              y: outputPlugRect.top + outputPlugRect.height / 2 - svgRect.top,
            }
            const to = {
              x: inputPlugRect.left - svgRect.left,
              y: inputPlugRect.top + inputPlugRect.height / 2 - svgRect.top,
            }

            console.log('createLink({linkKey, from, to})', linkKey, from, to)
            return this.createLink({linkKey, from, to})
          })
      })
  }

  linkThenComputeNode = ()=> {

    /*
    inputs: { // for arithmetic iterate
      // [toNode]: {
      //   [toInput]: srcNode,
      // },
      '$nodeC':{
        'Minuend': '$nodeA',
        'Subtrahend': '$nodeB',
      },
      '$nodeD':{
        'Numerator': '$nodeB',
        'Denominator': '',
      },
    },
    outputs: { // for checking the limitation of links
      // [srcNode]: {
      //   [toNode]: toInput,
      // },
      '$nodeA':{
        '$nodeC': 'Minuend',
      },
      '$nodeB':{
        '$nodeC': 'Subtrahend',
        '$nodeD': 'Numerator',
      },
    },
    */

    const nodes = this.state.Nodes
    window.nodes = nodes

    const datasetNodes = Object.entries(nodes)
      .filter(([key, value]) => value.type == 'DATASET')
      .map(([key, value]) => key)

    const outputs = _.cloneDeep(this.state.Links.outputs)
    const inputs = _.cloneDeep(this.state.Links.inputs)


    // collect node inputs if inputs enough like node type setting
    const nodeInputsFromNode = {}

    Object.entries(inputs)
      .map(([toNodeKey, inputsSrcNode], index) => {
        const toNode = nodes[toNodeKey]
        const toNodeTypeInputs = Object.keys(NodeType[toNode.type].inputs)

        const toNodeInputs = toNodeTypeInputs.map(input => inputsSrcNode[input])
        if((toNodeInputs.filter(f => f).length) == (toNodeTypeInputs.length)){
          console.log(toNodeKey, 'enough input')
          nodeInputsFromNode[toNodeKey] = inputsSrcNode
        } else {
          console.log(toNodeKey, 'less input')
        }
      })

    console.log({nodeInputsFromNode})


    // getting a output Tree Structure to check the order of output.
    const nodeOutputTree = {}

    const getOutputToNode = (output) => {
      Object.keys(output).map(toNodeKey => {
        if(outputs[toNodeKey]){
          output[toNodeKey] = outputs[toNodeKey]
          getOutputToNode(output[toNodeKey])
        } else
          output[toNodeKey] = true
      })
    }

    datasetNodes.map(datasetNodeKey => {
      if(outputs[datasetNodeKey]){
        nodeOutputTree[datasetNodeKey] = outputs[datasetNodeKey]
        getOutputToNode(nodeOutputTree[datasetNodeKey])
      }
    })

    console.log({nodeOutputTree})


    let outputOrder = [[]]

    const getOutputOrder = (tree, depth) => {
      // console.log(`S getOutputOrder(${depth})`, tree)
      let depthNodes = []
      let deepDepth = depth + 1

      Object.entries(tree).map(([nodeKey, value]) => {
        if(nodeInputsFromNode[nodeKey]){
          depthNodes.push(nodeKey)
          getOutputOrder(value, deepDepth)
        }
      })

      // console.log(`E getOutputOrder(${depth})`, tree, depthNodes)
      outputOrder[depth] = outputOrder[depth] ? [...outputOrder[depth], ...depthNodes] : [...depthNodes]
    }

    Object.entries(nodeOutputTree).map(([nodeKey, value]) => {
      outputOrder[0].push(nodeKey)
      getOutputOrder(value, 1)
    })

    outputOrder = _.uniq(_.flatten(outputOrder))
    console.log({outputOrder})

    window.nodeOutputTree = nodeOutputTree
    window.nodeInputsFromNode = nodeInputsFromNode
    window.outputOrder = outputOrder


    // TODO: save computed data to this state
    // TODO: refactoring this function. some node has different input order.
    const computeNodeThenAddVoxel = (node, inputNodes)=>{
      /*
      const geometries = this.newProps.map.geometries
      console.log(`S compute ${node.type} ${node.nodeKey}`, geometries, inputNodes, node)
      let geometry1 = geometries[inputNodes[0]]
      let geometry2 = geometries[inputNodes[1]]
      console.log(`E compute ${node.type} ${node.nodeKey}`, {node, inputNodes, geometry1, geometry2})

      if(geometry1 && geometry2)
        this.evalArithmeticNode(geometry1, geometry2, node, NodeType[node.type].arithmetic)
      */

      const mapGeometries = this.newProps.map.geometries
      const mathFunction = NodeType[node.type].arithmetic
      let inputGeometries = inputNodes.map(index => mapGeometries[index])
      console.log(`computeNodeThenAddVoxel() ${node.type} ${node.nodeKey}`, {node, inputNodes, mapGeometries, inputGeometries})

      if((inputGeometries.filter(f => f).length) == (inputNodes.length))
        this.evalArithmeticNode(node, mathFunction, inputGeometries) 
    }

    Object.entries(nodes).map(([nodeKey, node]) => {
      if(node.type != 'DATASET')
        Action.mapRemoveGeometry(nodeKey)
    })

    outputOrder.map(nodeKey =>{
      const node = nodes[nodeKey]
      if(node.type != 'DATASET'){
        const inputNodes = Object.values(nodeInputsFromNode[nodeKey])
        computeNodeThenAddVoxel(node, inputNodes)
      }
    })

    return {nodeInputsFromNode, nodeOutputTree, outputOrder}
  }

  /*
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

    // if(window.renderSec)
      // window.renderSec(0.5, 'vpl mouseUp') // might be not necessary

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
        Action.vlangMoveNode(this.getLinkIndex(this.props.nodes, this.dp.nodeUnderMouseRef), {x: sx, y: sy}, this.props.nodes);
      
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
  */


  diagonal(source, target) {
        return "M" + source.x + "," + source.y
            + "C" + (source.x + target.x) / 2 + "," + source.y
            + " " + (source.x + target.x) / 2 + "," + target.y
            + " " + target.x + "," + target.y;
    }

  /* this function is defined but never used
  createTempLink(startPosition, endPosition){
      return (
          <path className={"tempLink"} d={this.diagonal(startPosition, endPosition)} />
      );
  }
  */


  /*
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
  */

  /* this function is defined but never used
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
  */

  /*
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

  getNotZero(number1, number2) {
      if (number1 != 0) {
          return number1;
      } else if (number2 != 0) {
          return number2;
      } else {
          return 0;
      }
  }
  */

  createNodeObject(node, key){
      // console.log(`createNodeObject(${node}, ${key})`, node)

      /* unused
      let p = node.position;
      let property = node.property;
      let userLayerName = node.userLayerName;
      let name = node.name;
      */
      const nodeRef = 'node_' + key
      
      return(
        <g className="node"
           ref={nodeRef}
           data-key={key}
           // onMouseOver  = {this.handleMouseOver}
           // onMouseLeave = {this.handleMouseLeave}
           // onMouseUp    = {this.handleMouseUp}
           // onMouseDown  = {this.handleMouseDown}
           transform = {`translate(${node.translate.x},${node.translate.y})`}
        >
        {
           this.decideNodeType(node)
        }
        </g>
      );
  }

  evaluateNodeType(node, geometry1, geometry2={}, names=[]){

    return  this.evalArithmeticNode(geometry1, geometry2, node, NodeType[node.type].arithmetic, names);

    /*
    switch(node.type){
        case consts.MULTIPLICATION_NODE:
            return  this.evalArithmeticNode(geometry1, geometry2, node, math.dotMultiply, names);
        case consts.DIVISION_NODE:
            return this.evalArithmeticNode(geometry1, geometry2, node, math.dotDivide, names);
        case consts.SUBTRACTION_NODE:
            return this.evalArithmeticNode(geometry1, geometry2, node, math.subtract, names);
        case consts.LOG_NODE:
            return this.evalArithmeticNode(geometry1, geometry2, node, this.logNode, names);
        // case consts.AND_NODE:
        //     return  this.evalAndNode(p);
        // case consts.OR_NODE:
        //     return  this.evalOrNode(p);
        // case consts.NOT_NODE:
        //     return  this.evalNotNode(p);
        default:
            // This is for addition
            return  this.evalArithmeticNode(geometry1, geometry2, node, math.add, names);
    }
    */
  };

  logNode(geomArray1, geomArray2) {
    const valDiff = 10;

    let min = math.min(Array.from(geomArray1));
    let max = math.max(Array.from(geomArray1));

    const remap = function(x) {
        if (x != 0) {
            return (valDiff)*((x-min)/(max-min))+min;
        } else {
            return 0;
        }
    }

    let newSizeArray = math.log(geomArray1.map(remap));
    let newMin = math.min(newSizeArray.filter(item => item !== Number.NEGATIVE_INFINITY));
    const notInfinity = function(x) {
        if (x == Number.NEGATIVE_INFINITY) {
            return newMin;
        } else {
            return x;
        }
    }
    return newSizeArray.map(notInfinity);
  }

  
  // TODO: refactoring this function. some node has different input order.
  evalArithmeticNode(node, mathFunction, geometries) {
  // evalArithmeticNode(geometry1, geometry2, node, mathFunction, names) {
    console.log(`evalArithmeticNode()`, {node, mathFunction, geometries})
    const arraySize = geometries[0].geometry.attributes.size.count;
    const hashedData = {};
    const allIndices = this.newProps.layers[0].allIndices;

    const amplifier = 3


    // let transArray1 = geometry1.geometry.attributes.translation.array;
    // let transArray2 = geometry2.geometry.attributes.translation.array;
    let transArray = geometries.map((geometry) => geometry.geometry.attributes.translation.array)

    // let geomArray1 = Array.from(geometry1.geometry.attributes.size.array);
    // let geomArray2 = Array.from(geometry2.geometry.attributes.size.array);
    let geomArray = geometries.map((geometry) => Array.from(geometry.geometry.attributes.size.array))

    // let sizeArray = mathFunction(geomArray1, geomArray2);
    let sizeArray = mathFunction(geomArray)

    /*
    const translationArray = new Float32Array(arraySize*3);
    for (let i = 0, j = 0; j < arraySize; i = i + 3, j++){s
        translationArray[i] = this.getNotZero(transArray1[i], transArray2[i]);
        translationArray[i+1] = this.getNotZero(transArray1[i+1], transArray2[i+1]);
        translationArray[i+2] = this.getNotZero(transArray1[i+2], transArray2[i+2]);
        if (allIndices.includes(j)) {
            let hashedArray = Array(8);
            hashedArray[3] = sizeArray[j];
            hashedData[j] = hashedArray;
        }
    }
    */

    const translationArray = new Float32Array(arraySize * amplifier);
    for (let i = 0, j = 0; j < arraySize; i = i + amplifier, j++){
      
      for (let k = amplifier - 1; k >= 0; k--) {
        // `.find(f=> f != 0) || 0` replace `getNotZero()`
        translationArray[i + k] = transArray.map(ta => ta[i + k]).find(f=> f != 0) || 0
      }

      if (allIndices.includes(j)) {
        let hashedArray = Array(8)
        hashedArray[3] = sizeArray[j]
        hashedData[j] = hashedArray
      }
    }


    let min = math.min(Array.from(sizeArray));
    let max;

    if (node.type == 'DIVISION') {
        max = math.max(sizeArray.filter(item => item !== Number.POSITIVE_INFINITY));
    } else {
        max = math.max(sizeArray);
    }    
    
    const valDiff = geometries[0].highBnd-geometries[0].lowBnd;
    const remap = function(x) {
        if (x != 0) {
            return (valDiff)*((x-min)/(max-min))+geometries[0].lowBnd;
        } else {
            return 0;
        }
    }

    let remapOriginalSize = sizeArray.map(remap);
    let remapSize = remapOriginalSize.slice(0);
    let props = {
        size: remapOriginalSize,
        translation: translationArray
    }

    let geometry = {
        minMax: this.newProps.layers[0].geojson.minMax,
        addressArray: this.newProps.map.geometries[Object.keys(this.newProps.map.geometries)[0]].addresses,
        properties: props,
        cols: this.newProps.layers[0].rowsCols.cols,
        rows: this.newProps.layers[0].rowsCols.rows,
        bounds: this.newProps.layers[0].bounds,
        shaderText: this.newProps.layers[0].shaderText,
        n: this.newProps.layers.length + 1,
        name: node.name,
        type: node.type,
        layerName: node.nodeKey,
        // length: Math.max(geometry1.numElements, geometry2.numElements),
        length: Math.max(...geometries.map(g => g.numElements)),
        hashedData: hashedData, 
        allIndices: allIndices,
        // propVals: names, // CHECK: is this necessary?
        color1: node.color,
        color2: node.color,
    }
    this.addVoxelGeometry(geometry)
  }


  decideNodeType(node){
    // console.log(`decideNodeType()`, node)

    return this.nodeSVG(node)


    /*
    const p = position

    switch(type){
        case consts.LAYER_NODE:
          return  this.LayerNode(p, property, userLayerName, name);
        default:
          const inputs = NodeType[type].inputs
          const inputNum = Object.keys(inputs).length ? Object.keys(inputs).length : 0

          return this.nodeSVG({ color, name, inputs, type })
    */

        /*
        case consts.MULTIPLICATION_NODE:
            return this.nodeSVG({ color1, color2, p, layerName, inputNum: 2})
            // return  this.MultiplicationNode(p);
        case consts.SUBTRACTION_NODE:
            return this.nodeSVG({ color1, color2, p, layerName, inputNum: 2})
            // return this.SubtractionNode(p);
        case consts.DIVISION_NODE:
            return this.nodeSVG({ color1, color2, p, layerName, inputNum: 2})
            // return this.DivisionNode(p);
        case consts.LOG_NODE:
            return this.nodeSVG({ color1, color2, p, layerName, inputNum: 1})
            // return this.LogarithmNode(p);
        case consts.AND_NODE:
            return this.nodeSVG({ color1, color2, p, layerName, inputNum: 2})
            // return  this.AndNode(p);
        case consts.OR_NODE:
            return this.nodeSVG({ color1, color2, p, layerName, inputNum: 2})
            // return  this.OrNode(p);
        case consts.NOT_NODE:
            return this.nodeSVG({ color1, color2, p, layerName, inputNum: 1})
            // return  this.NotNode(p);
        case consts.ADDITION_NODE: 
            return this.nodeSVG({ color1, color2, p, layerName, inputNum: 2})
        default:
            // return  this.nodeSVG({ color1, color2, p, 'default', inputNum: 1); // TODO: what is default?
            // return  this.AdditionNode(p);
        */
    // }
  };

  nodeSVG({color, name, type, nodeKey}){
      // console.log(`nodeSVG({${color}, ${name}, ${type}})`)

      //const p = {x: 0, y: 0}

      const inputs = NodeType[type].inputs
      const output = NodeType[type].output

      // const nodeName = layerName
      const nodeName = name || NodeType[type].fullName
      const Style = style.node

      // const nodeWidth = nodeName.length > 10 ? Style.minWidth + (nodeName.length - 10) * Style.fontSize.nodeName * 0.6 : Style.minWidth // 0.6 is the font width/height ratio
      const nodeWidth = Style.minWidth
      const nodeHeight = Style.minHeight 

      return(
          // TODO: add key attr for g
          <g data-node-name={nodeName}>
              <rect className="background" width={nodeWidth} height={nodeHeight} x="0" y="0" style={{fill: '#ecf0f1', stroke: '#ccc', rx: '2px'}}></rect>

              {/* Output Plugs */}
              { Object.entries(inputs)
                  .map(([input, abbr], index) =>
                    <g
                      ref={`${nodeKey}_plug_input_${input}`}
                      className="plug" data-node-key={nodeKey} data-plug="true" data-plug-type="input" data-input={input} 
                      transform={`translate(0, ${Style.plug.height / 2 + Style.topOffset + Style.plug.marginTop * index})`}
                    >
                      <rect width={Style.plug.width} height={Style.plug.height} 
                        x ={0} y={- Style.plug.height / 2} style={{fill: '#fff', stroke: '#ccc',}}
                      ></rect>
                      <text
                        x={Style.plug.width / 2} y={0}
                        fontSize={Style.fontSize.plugName} 
                        style={{textAnchor: 'middle', fontFamily: 'Monospace', fill: '#4a4a4a', dominantBaseline: 'central' }}
                      >{ abbr }</text>
                    </g>
                  )
              }

              {/* Output Plug */}
              <g
                ref={`${nodeKey}_plug_output`}
                className="plug" data-node-key={nodeKey} data-plug="true" data-plug-type="output" data-output={output} 
                transform={`translate(${nodeWidth - Style.plug.width}, ${Style.plug.height / 2 + Style.topOffset})`}
              >
                <rect width={Style.plug.width} height={Style.plug.height} 
                  x ={0} y={- Style.plug.height / 2} style={{fill: '#fff', stroke: '#ccc',}}
                ></rect>
                <text
                  x={Style.plug.width / 2} y={0}
                  fontSize={Style.fontSize.plugName} 
                  style={{textAnchor: 'middle', fontFamily: 'Monospace', fill: '#4a4a4a', dominantBaseline: 'central' }}
                >{ output[0] }</text>
              </g>

              <text x={nodeWidth / 2} y="25" fontSize={Style.fontSize.nodeName + 'px'} style={{textAnchor: 'middle', fontFamily: 'Monospace', fill: '#536469',}}>
                {nodeName}
              </text>

              <g className="control">
                {/* TODO: modify slider width */}
                <Slider index={nodeKey}/>
                <Panel color={color} index={nodeKey}/>
              </g>

          </g>
          );      


      /*
      return(
          <g>
              <rect className = {"nodeMain"} width= {this.width} height ={this.height} 
              x = {p.x} y = {p.y} ></rect>
              <rect className = {this.style.niClassName} width= {this.style.niw} height = {this.style.nih} x ={p.x} y ={p.y + this.style.nito}></rect>
              <text className = {"nodeInputLabel"} x = {p.x + this.style.tltlo} y = {p.y + this.style.tltto} fontSize={"15"}>I</text>
              {
                (inputNum > 1) &&
                (<g>
                    <rect className = {this.style.niClassName} width= {this.style.niw} height = {this.style.nih} x ={p.x} y ={p.y + this.style.nibo}></rect>
                    <text className = {"nodeInputLabel"} x = {p.x + this.style.tltlo} y = {p.y + this.style.tltto + 25} fontSize={"15"}>I</text>
                </g>)
              }
              <rect className = {this.style.niClassName} width= {this.style.niw} height = {this.style.nih} x = {p.x + this.width - 20} y ={p.y + this.style.nito}></rect>
              <text className = {"nodeInputLabel"} x = {p.x + this.style.tltlo + this.width - 20} y = {p.y + this.style.tltto} fontSize={"15"}>O</text>
              <text className = {"nodeText"} x = {p.x + 102} y = {p.y + 25} fontSize={"16"} style={{textAnchor: 'middle'}}>
                      {layerName}
              </text>

              <Panel color1={color1} color2={color2} position={p} index={layerName}/>
              <Slider position={p} index={layerName}/>
          </g>
          );
      */
  }


  /*
  AdditionNode(p){
      console.log(p)
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
        </g>
        );
  }

  SubtractionNode(p){
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
            <text className = {"nodeText"} x = {p.x + 55} y = {p.y + 25} fontSize={"20"}>              
                    SUBTRACT
            </text>
             <text className = {"nodeText"} x = {p.x + 30} y = {p.y + 30} fontSize={"10"}>                
                    
            </text>
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
        </g>
        );
  }

  DivisionNode(p){
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
            <text className = {"nodeText"} x = {p.x + 65} y = {p.y + 25} fontSize={"20"}>              
                    DIVIDE 
            </text>
             <text className = {"nodeText"} x = {p.x + 30} y = {p.y + 30} fontSize={"10"}>                
                    
            </text>
        </g>
        );
  }

  LogarithmNode(p){
      return(
       <g>
            <rect className = {"nodeMain"} width= {this.width} height ={this.height} 
            x = {p.x} y = {p.y} ></rect>
            <rect className = {this.style.niClassName} width= {this.style.niw} height = {this.style.nih} x ={p.x} y ={p.y + this.style.nito}></rect>
            <rect className = {this.style.niClassName} width= {this.style.niw} height = {this.style.nih} x = {p.x + this.width - 20} y ={p.y + this.style.nito}></rect>
            <text className = {"nodeInputLabel"} x = {p.x + this.style.tltlo} y = {p.y + this.style.tltto} fontSize={"15"}>A</text>
            <text className = {"nodeInputLabel"} x = {p.x + this.style.tltlo + this.width - 20} y = {p.y + this.style.tltto} fontSize={"15"}>O</text>
            <text className = {"nodeText"} x = {p.x + 45} y = {p.y + 25} fontSize={"20"}>              
                    LOGARITHM
            </text>
             <text className = {"nodeText"} x = {p.x + 30} y = {p.y + 30} fontSize={"10"}>                
                    
            </text>
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
            <text className = {"nodeText"} x = {p.x + 85} y = {p.y + 25} fontSize={"20"}>              
                    AND
            </text>
             <text className = {"nodeText"} x = {p.x + 30} y = {p.y + 30} fontSize={"10"}>                
                    
            </text>
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
        </g>
    ); 
  }
  */

  /* 
 LayerNode(p,  property, userLayerName, name){

    const Style = style.node  

    return(
      <g>
        <rect className={"nodeMain"} width={Style.minWidth} height ={Style.minHeight} 
        x={p.x} y={p.y} ></rect>        
        <rect className={"nodeInput"} width={Style.plug.width} height={Style.plug.height} x={p.x + Style.minWidth - 20} y ={p.y + Style.topOffset}></rect>         
        <text className={"nodeInputLabel"} x={p.x + 5 + Style.minWidth - 20} y={p.y + 20} fontSize={"15"}>O</text>
        <text className={"nodeText"} x={p.x + 30} y={p.y + 25} fontSize={"20"}>              
                {userLayerName}
        </text>
        <text className={"nodeText"} x={p.x + 30} y={p.y + 45 } fontSize={"10"}>                
                {property}
        </text>
        <Slider position={p} index={name}/>
        <Panel position={p} index={name}/>
      </g>


     return(
       <g>
            <rect className = {"nodeMain"} width= {this.width} height ={this.height} 
            x = {p.x} y = {p.y} ></rect>        
            <rect className = {this.style.niClassName} width= {this.style.niw} height = {this.style.nih} x = {p.x + this.width - 20} y ={p.y + this.style.nito}></rect>         
            <text className = {"nodeInputLabel"} x = {p.x + this.style.tltlo + this.width - 20} y = {p.y + this.style.tltto} fontSize={"15"}>O</text>
            <text className = {"nodeText"} x = {p.x + 30} y = {p.y + 25} fontSize={"20"}>              
                    {userLayerName}
            </text>
            <text className = {"nodeText"} x = {p.x + 30} y = {p.y + 45 } fontSize={"10"}>                
                    {property}
            </text>
            <Slider position={p} index={name}/>
            <Panel position={p} index={name}/>
        </g>


    );
  }
  */
  

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

  /*
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
  */

  addNode(type){
    // TODO: WIP

    const nodeHashKey = (+new Date).toString(32) + Math.floor(Math.random()* 36).toString(36)
    Nodes[nodeHashKey] = this.newNodeObj(type)

    this.setState({Nodes})

    /*
    const color10 = d3.scale.category10().range(); // d3.js v3
    // shuffle the color10
    for (let i = color10.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [color10[i - 1], color10[j]] = [color10[j], color10[i - 1]];
    }

    let color1 = color10[(this.newProps.layers.length + 1) % 10];
    let color2 = color1
    // let color2 = d3.rgb(color1).brighter().toString()

    let currentLayers = [];
    for (let i=0; i < this.props.layers.length; i++) {
        currentLayers.push(this.props.layers[i].name);
    }
    let layerName
    if (! currentLayers.includes(type)) {
        layerName = type;
    } else {
        for (let layerNum in currentLayers) {
            if (currentLayers[layerNum].startsWith(type + '_')){
                let n = currentLayers[layerNum].lastIndexOf("_");
                let layerIndex = currentLayers[layerNum].substring(n+1);

                if (!isNaN(layerIndex)) {
                    let newLayerIndex = parseInt(currentLayers[layerNum].slice(n+1))+1;
                    layerName = currentLayers[layerNum].slice(0,n+1)+newLayerIndex;
                }
            } else {
                layerName = type + '_1';
            }
        }
    }

    const node = {
        type,
        layerName,
        color1,
        color2,
    }

    // this.evaluateNodeType('MULTIPLICATION_NODE', this.newProps.map.geometries['Asthma_ED_Visit'], this.newProps.map.geometries['Census_HomeValue'])
    this.evaluateNodeType(node, this.newProps.map.geometries['Asthma_ED_Visit'], this.newProps.map.geometries['Census_HomeValue'], ['Asthma_ED_Visit', 'Census_HomeValue'])
    // this.evaluateNodeType('LOG_NODE', this.newProps.map.geometries['Asthma_ED_Visit'])
    
    Action.vlangAddNode({ ref: "node_" + this.props.nodes.length + 1, layerName, type, color1, color2, position: this.getRandomPosition(), translate: {x: 0, y: 0}});
    */
  }



  /*
  addAdditionNode(){
    this.addNode(consts.ADDITION_NODE);
  }
  addSubractionNode(){
    this.addNode(consts.SUBTRACTION_NODE);
  }
  addMultiplicationNode(){
    this.addNode(consts.MULTIPLICATION_NODE);
  }
  addDivisionNode(){
    this.addNode(consts.DIVISION_NODE);
  }
  addLogarithmNode(){
    this.addNode(consts.LOG_NODE);
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
  */


  /* this function is defined but never used
  removeNode(){
      let x = parseInt($('#moveX').val());
      let y = parseInt($('#moveY').val());
      let position = {x: x, y: y};
      Action.vlangMoveNode(0, position);
  }
  */
  
  /* unused function
  removeLink(){
      Action.vlangRemoveLink(this.getLinkIndex(this.props.links, 'link_1'));
  }
  */

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

  /*
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
  */

  addVoxelGeometry(geometry) {
    const map = this.newProps.map.instance;
    const circle = new THREE.CircleBufferGeometry(1, 20);
    const otherArray = [];

    const color1 = geometry.color1
    const color2 = geometry.color2

    
    // let shaderContent = document.getElementById( 'fragmentShader' ).textContent;
    // shaderContent = shaderContent.replace(/1.5/g, parseFloat(1/ptDistance));

    const P = new PaintGraph.Pixels(map, circle, otherArray, color1, color2, geometry.minMax, 
        geometry.addressArray, geometry.cols, geometry.rows, geometry.n, geometry.bounds, geometry.shaderText, true, geometry.properties);
    Action.mapAddGeometry(geometry.layerName, P);

    let geoJSON = {
        minMax: geometry.minMax,
        length: geometry.length,
        hashedData: geometry.hashedData
    };

    /* don't add node layer to sidebar
    Action.sideAddLayer(createLayer(geometry.layerName, geometry.propVals.toString(), true, 
        color1, color2, geoJSON, [], {rows : geometry.rows, columns : geometry.columns}, geometry.bounds, geometry.allIndices, geometry.shaderText, geometry.layerName))
    */
  }

  render(){
    return (
        <div className = "pull-right col-md-10 vplContainer">
            <div className = "row">
            <div className = "col-md-10"></div>
            <div className = "col-md-2">
              <DropdownButton title={"Add Node"}  id={`add-node-dropdown`}>
                { Object.entries(NodeType)
                    .map( ([key, node]) =>
                      key != 'DATASET'
                      ? <MenuItem 
                          key={key} 
                          onClick={() => {this.addNode(key)}}
                        >
                          { node.fullName + ' Node' }
                        </MenuItem>
                      : ''
                    )
                }
               </DropdownButton>
            </div>

            </div>
            <div className = "row">
              <svg className="vpl" ref={"mainSvgElement"} width="100%" height={'800px'} xmlns="http://www.w3.org/2000/svg">
                  {this.linkMarker()}


                  {
                    Object.entries(Nodes)
                      .map(([key, node], index) => {
                        node.name = node.name ? node.name : node.type
                        // index += 3
                        node.translate = node.position
                        node.nodeKey = key

                        return this.createNodeObject(node, key);  
                      })

                    /*
                    this.props.nodes.map((node, index) => {
                    console.log('props.nodes', node)
                    // if(node.type == 'LAYER_NODE')
                      return this.createNodeObject(node, index);  
                    })
                    */
                  }


                  {
                    // do not display temp link when its `from` and `to` is the same
                    // (this.state.tempLink.from.x == this.tempLink.tempLink.to.x && this.state.tempLink.from.y == this.tempLink.tempLink.to.y)
                    (JSON.stringify(this.state.tempLink.from) != JSON.stringify(this.state.tempLink.to)) 
                    ? this.createTempLink() : ''
                  }
                  {
                    this.createLinks()

                    /*
                    this.props.links.map((link, index) => {
                      return this.createLinkObject(link, index);
                    })
                    */
                  }

              </svg> 
            </div>  
        </div>
    );
  }
}

/* don't add node layer to sidebar
const createLayer = (name, propertyName, visible, color1='#00ff00', color2='#0000ff', geojson=[], bbox, rowsCols, bounds, allIndices, shaderText, userLayerName) => ({
    name, propertyName, visible, color1, color2, geojson, bbox, rowsCols, bounds, allIndices, shaderText, userLayerName
})
*/

const mapStateToProps = (state) =>{
    return {nodes: state.vpl.nodes, links: state.vpl.links, map: state.map, layers: state.sidebar.layers};
};

export default connect(mapStateToProps)(VPL);