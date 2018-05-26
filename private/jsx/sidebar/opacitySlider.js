import React from 'react'
import { connect } from 'react-redux'

import * as act from '../store/actions'

class OpacitySlider extends React.Component {
    constructor(props) {
        super(props)

        this.changeOpacity = this.changeOpacity.bind(this)
    }

    changeOpacity(e) {
        const value = e.target.value
        act.mapSetOpacity({ value })

        /*
        // TODO: may do this in reducer??
        for (var geo in this.props.geometries) {
            let geometry = this.props.geometries[geo]
            geometry.material.uniforms.transparency.value =
                parseFloat(e.target.value) / 100.0
        }
        */

        if (window.renderSec) window.renderSec(0.2, 'OpacitySlider')
    }

    render() {
        return (
            <div className="opacity-slider">
                <div className="row text-center">
                    <p className="slider-name"> Opacity </p>
                </div>
                <div className="row text-center">
                    <div className="col-md-1">
                        <p className="slider-label"> 0 </p>
                    </div>
                    <div className="col-md-9">
                        <input
                            type="range"
                            name="points"
                            id="points"
                            onChange={this.changeOpacity}
                            value={this.props.opacity}
                            min="0"
                            max="100"
                        />
                    </div>
                    <div className="col-md-1">
                        <p className="slider-label"> 100 </p>
                    </div>
                </div>
            </div>
        )
    }
}

export default connect(s => ({
    // geometries: s.map.geometries,
    opacity: s.options.opacity,
}))(OpacitySlider)
