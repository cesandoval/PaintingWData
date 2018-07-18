import React from 'react'
import ReactMapGL from 'react-map-gl'
import { connect } from 'react-redux'
import WebMercatorViewport from 'viewport-mercator-project'

class MapBox extends React.Component {
    MAPBOX_API_TOKEN = 'pk.eyJ1IjoiY3NhbmRvdmEiLCJhIjoiY2pqZWJjajY2NGxsczNrcDE0anZmY3A1MCJ9.Dq2Pukxp_L_o-j4Zz22srQ'

    state = {
        viewport: new WebMercatorViewport({
            width: window.innerWidth,
            height: window.innerWidth,
        }), // TODO: Change the width and height values to scale to whatever screen user's using.
    }

    componentWillReceiveProps(newProps) {
        // Gets the location.
        this.setState({
            viewport: this.state.viewport.fitBounds([
                newProps.bbox[0],
                newProps.bbox[2],
            ]),
        })
    }

    render() {
        return (
            <ReactMapGL
                {...this.state.viewport}
                onViewportChange={viewport => this.setState({ viewport })}
                mapboxApiAccessToken={this.MAPBOX_API_TOKEN}
            />
        )
    }
}

export default connect(s => ({
    bounds: s.datasets.bounds,
    bbox: s.map.bbox[0],
}))(MapBox)
