export const AND_NODE = "AND_NODE";
export const OR_NODE = "OR_NODE";
export const ADDITION_NODE = "ADDITION_NODE";
export const SUBTRACTION_NODE = "SUBTRACTION_NODE";
export const DIVISION_NODE = "DIVISION_NODE";

export const MULTIPLICATION_NODE = "MULTIPLICATION_NODE";
export const XAND_NODE = "XAND_NODE";
export const XOR_NODE = "XOR_NODE";
export const LOG_NODE = "LOG_NODE";





class VprogNode {
  /* construct the node using */
  constructor(nodeType, numInputs){
    this.nodeType = nodeType;
    this.numInputs = numInputs;
  }

}

class LayerNode extends VprogNode{
   /* construct the node using */
  constructor(incomingNode){
    super("layerNode", 1);
    this.incomingNode = incomingNode;
  }

  isBalanced(){
    return true;
  }
}

class SingleInputNode extends VprogNode{
   /* construct the node using */
  constructor(nodeType, incomingNode1){
    super(nodeType, 1);
    this.incomingNode1 = incomingNode;
  }
  isBalanced(){
    if (this.incomingNode){
      return this.incomingNode.isBalanced();
    }
    return false;
  }
}

class DoubleInputNode extends VprogNode{
   /* construct the node using */
  constructor(nodeType, incomingNode1, incomingNode2){
    super(nodeType, 2);
    this.incomingNode1 = incomingNode;
    this.incomingNode2 = incomingNode2;
  }
  isBalanced(){
    if(this.incomingNode1 && this.incomingNode2){
      return this.incomingNode1.isBalanced() && this.incomingNode2.isBalanced();
    }
    return false;
  }

}

export default {
  LayerNode:       LayerNode,
  SingleInputNode: SingleInputNode,
  DoubleInputNode: DoubleInputNode,
};


