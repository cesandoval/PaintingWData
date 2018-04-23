import React from 'react'
import * as act from '../store/actions'
import { connect } from 'react-redux'

class Layer extends React.Component {
    constructor(props) {
        super(props)
        this.changeVisibility = this.changeVisibility.bind(this)
        this.changeColor = this.changeColor.bind(this)
        this.handleCheckedEvent = this.handleCheckedEvent.bind(this)
    }
    changeVisibility(e) {
        /* eslint-disable */
        debugger
        act.updateGeometry(
            this.props.name,
            'Visibility',
            e.target.checked,
            'visible'
        )
        act.vlangUpdateNode({
            nodeKey: this.props.name,
            attr: 'visibility',
            value: e.target.checked,
        })
        // act.sideRemoveLayer(this.props.name) // deprecated
    }
    handleCheckedEvent(e) {
        this.changeVisibility(e)
        // var layerName = this.props.name;
        // act.sideRemoveLayer(layerName);
    }
    changeColor(e) {
        act.updateGeometry(this.props.name, 'Color', e.target.value, 'color1')
        act.vlangUpdateNode({
            nodeKey: this.props.name,
            attr: 'color',
            value: e.target.value,
        })

        if (window.renderSec) window.renderSec(0.5, 'sidebar layer color')
    }
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
                                    checked={this.props.visible}
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
                                    name="color1"
                                    value={this.props.color1}
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
        layers: state.map.layers,
        geometries: state.map.geometries,
    }
}
export default connect(mapStateToProps)(Layer)
