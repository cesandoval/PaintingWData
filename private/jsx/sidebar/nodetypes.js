import React from 'react';

export default class extends React.Component {
    constructor(props){
        super(props);
        this.changeWeights = this.changeWeights.bind(this);
    }
    changeWeights() {
        //var size = window.geometry.getAttribute('size');
        //window.setWeights(size, [0,1,2,3,4,5,6].map(function(i){return {x: i*10, y: Math.pow(i, 2), value: 5};}));
        // window.createUpdate();
        console.log(999999999999999)
    }
    render(){
        // return(
        //     <div>
        //         NodeTypes
        //         <input type="button" onClick={this.changeWeights} value="rofl"/>
        //     </div>
        // );
        return;
    }
}
