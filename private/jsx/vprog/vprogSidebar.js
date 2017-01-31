import React from 'react';
import { connect } from 'react-redux';
import * as act from '../store/actions';

class VprogSidebar extends React.Component {
    constructor(props){
       super(props);

       

       this.nodeTypes = [
          "Multiplication",
          "Division",
          "Addition",
          "Subtraction",
          "And",
          "XAnd",
          "Or",
          "XOR",
          "Log"
       ]

       // this.onNodeClick = this.onNodeClick.bind();


      
    }
    

    onNodeClick(nodeType){

      console.log("node clicked: ", nodeType);
    }

    onExpandClick(){
      console.log("node deleted");
    }

    openMap(){
      console.log("openMapClicked")
    }

    onAddConnection(connection){
        let sourceNode = connection.source;
        let destinationNode = connection.destination;
    }

     render() {
        return(
            <div id="vprogSidebar">
              <ul>
                {this.nodeTypes.map((nodeType, i) => (
                    <li key={i}
                        name={nodeType}
                        onClick={() => this.onNodeClick(nodeType)}>
                      {nodeType} Node 
                    </li>
                    <li id="openButton" onClick={this.openMap}>Open Map</li>
                ))}
              </ul>
                 

            </div>
        );
    }

  

}



export default VprogSidebar
