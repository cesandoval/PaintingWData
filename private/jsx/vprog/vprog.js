import React from 'react';
import { connect } from 'react-redux';
import * as act from '../store/actions';
import * as VprogNodes from './vprogNodes'


class Vprog extends React.Component {
    constructor(props){
       super(props);

       this.state = {
            rootNode: None,
       }

       

       this.onAddNode = this.onAddNode.bind(this);
       this.onAddConnection = this.onAddConnection.bind(this);
       this.onDeleteNode = this.onDeleteNode.bind(this);


    }
    

    onAddNode(node){
      console.log("add Node fired!!")
    }

    onDeleteNode(node){

    }

    onAddConnection(connection){
        let sourceNode = connection.source;
        let destinationNode = connection.destination;
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
            <div id="vprog" 
                 onAddNode = {this.onAddNode}
                 onDeleteNode = {this.onDeleteNode}
                 onAddConnection = {this.onAddConnection}
                 className="vprogContainer" style={}>

            </div>
        );
    }
    }

  

}


export default connect()(Vprog)
