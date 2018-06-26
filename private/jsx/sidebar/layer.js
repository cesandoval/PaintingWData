import React from 'react'
import * as Act from '../store/actions'
import { connect } from 'react-redux'
/**
 * The sub-component of "Layers"; it depicts a single layer.
 */
class Layer extends React.Component {
    constructor(props) {
        super(props)
        /**
         * Sets default state to gray and visible.
         * @property {String} color The color of the layer.
         * @property {Boolean} visibility The visibility of the color.
         */
        this.state = {
            node: {
                color: '#AFAFAF',
                visibility: true,
            },
        }
        /**
         * @member {Function} changeColor
         * @member {Function} handleCheckedEvent
         */
        this.changeColor = this.changeColor.bind(this)
        this.handleCheckedEvent = this.handleCheckedEvent.bind(this)
    }
    /**
     * Handles a check/uncheck event by changing visibility of the layer.
     * @listens onChange
     */
    handleCheckedEvent(e) {
        Act.nodeUpdate({
            nodeKey: this.props.layerKey,
            attr: 'visibility',
            value: e.target.checked,
        })
    }
    componentWillReceiveProps(props) {
        /*eslint-disable*/
        debugger;
        console.log('layer props', this.props.name, { props })

        const node = props.nodes[props.layerKey]

        if (node) this.setState({ node })
    }
    /**
     * Handles a color change.
     * @listens onChange When its color ends up changing.
     */
    changeColor(e) {
        Act.nodeUpdate({
            nodeKey: this.props.layerKey,
            attr: 'color',
            value: e.target.value,
        })

        if (window.renderSec) window.renderSec(0.5, 'sidebar layer color')
    }
    /**
     * Renders each "Layer" component, which shows: (1) the name, (2) a checkbox for visibility,
     * and (3) the color.
     */
    render() {
        if (this.props.showSidebar != false)
            return (
                <div className="layers__single">
                    <div className="row">
                        <div className="col-md-6">
                            <p className="layer-label">
                                {this.props.userPropName}
                            </p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <p className="layer-label-small">
                                {this.props.propName}
                            </p>
                        </div>
                        <div className="col-md-6">
                            <div className="text-right">
                                <input
                                    type="checkbox"
                                    checked={this.state.node.visibility}
                                    onChange={this.handleCheckedEvent}
                                    name={this.props.name}
                                    style={{
                                        '-webkit-appearance': 'checkbox',
                                        height: '17px',
                                        width: '16px',
                                        margin: '0px 5px',
                                    }}
                                />
                                <input
                                    type="color"
                                    name="color"
                                    value={this.state.node.color}
                                    onChange={this.changeColor}
                                />
                                {/* <input type="color" name="color2" value={this.props.color2} onChange={this.changeColor} /> */}
                            </div>
                        </div>
                    </div>
                </div>
            )
        else return null
    }
}

const mapStateToProps = state => {
    return {
        nodes: state.vpl.nodes,
    }
}
export default connect(mapStateToProps)(Layer)
