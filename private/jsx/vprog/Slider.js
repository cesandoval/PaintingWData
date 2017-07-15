import React from 'react';
import { connect } from 'react-redux';
import $ from 'jquery';

export default class extends React.Component{
    constructor(props){
        super(props);
        this.dp = {
            cX: 0,
            sX: 0,
            held: false
        }
        this.circleHandleMouseDown = this.circleHandleMouseDown.bind(this);
        this.containerMouseMove    = this.containerMouseMove.bind(this);
        this.containerMouseUp      = this.containerMouseUp.bind(this);
        this.containerMouseDown    = this.containerMouseDown.bind(this);
    }
    circleHandleMouseDown(event){
        event.stopPropagation();
        this.dp.held = true;
    }

    containerMouseDown(event){
        event.stopPropagation();
        this.dp.held = true;
        this.dp.sX = event.clientX;
        let target = $(event.currentTarget);
        let left = target.position().left;
        target.children('circle').attr('transform', 'translate('+ (event.clientX - 4 - parseInt(left)) +','+'0)')
        this.dp.cX = event.clientX;
    }

    containerMouseUp(event){
        event.stopPropagation();
        this.dp.held = false;
        this.dp.cX = 0; 
    }

    containerMouseMove(event){
        event.stopPropagation();
        if(this.dp.held){
            var dx = (event.clientX - this.dp.sX);
            let target = $(event.currentTarget);
            let left = target.position().left;
            $(event.currentTarget).children('circle').attr('transform', 'translate('+(event.clientX - 4 - parseInt(left))+','+'0)')
        }
    }

    render(){
        return(
            <g  onMouseDown = {this.containerMouseDown} 
                onMouseUp = {this.containerMouseUp}
                onMouseMove = {this.containerMouseMove}
                className = {"sliderContainer"}>
                <rect width={160} height={"5px"} x = {this.props.position.x + 20} y ={this.props.position.y + 70}/>
                <circle onMouseDown = {this.circleHandleMouseDown} className = {"sliderHandle"} cx = {this.props.position.x + 20} cy ={this.props.position.y + 73} r = {"8"} transform ={"translate(0, 0)"}/>
            </g>
        );
    }
}