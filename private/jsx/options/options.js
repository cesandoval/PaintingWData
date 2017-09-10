import React from 'react';
import { connect } from 'react-redux';

import * as act from '../store/actions';

import OptionsButton from './optionsButton';
import OptionsForm  from './optionsForm';
import OptionsMapStyle  from './optionsMapStyle';
import Button from 'react-bootstrap/lib/Button';

class Options extends React.Component {
    constructor(props){
        super(props);
        this.state = {};
        this.state.optionsMapStyleShow = true

        this.toggleOptionsMapStyleShow = this.toggleOptionsMapStyleShow.bind(this);

    }
    componentDidMount() {
        const gElement = document.getElementById('parcoords')
        // console.log(gElement);
    }
    toggleOptionShow(option) {
        console.log(`toggleOptionShow(${option})`)
        if(this.props.map.optionShow == option)
            act.setOptionShow("");
        else
            act.setOptionShow(option);
    }
    componentWillReceiveProps(newProps){
        // // Get layers once they appear
        // // Map them to Pixels objects
        // // Add the pixel geometries to the map
        // // TODO: check this function
        // if (newProps.layers && newProps.layers.length > 0 && !this.state.layersAdded) {
        //     // Sets the camera to the voxels' bbox 
        //     console.log(7474747474, newProps)
        // }
    }
    toggleOptionsMapStyleShow(){
        console.log('toggleOptionsMapStyleShow', !this.state.optionsMapStyleShow)
        this.setState({ optionsMapStyleShow: !this.state.optionsMapStyleShow });

    }

    getScreenShot(){
        window.getScreenShot()
    }

    render() {
        if(window.renderSec)
            window.renderSec(1, 'options.js')
        
        return(
            <div className="options--react">
                <OptionsForm/>
                <div id="mapStyleOptions" style={{display: (this.state.optionsMapStyleShow ? '' : 'none')}}>
                    <OptionsMapStyle
                        mapStyle="mapbox.light"
                        show={this.state.optionsMapStyleShow}
                        onHide={()=>{this.setState({optionsMapStyleShow: false})}}
                    />
                </div>
                <div style={{position: 'absolute', width: '100%', textAlign: 'center', marginTop: '-27px',}}>
                    <img style={{cursor: 'pointer'}} onClick={this.getScreenShot} src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA0OTAgNDkwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0OTAgNDkwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCI+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTM2NC4xLDI1MS4zYy03LTctMTguNC03LTI1LjUsMEwyNjMsMzI3LjFWMTMwLjljMC05LjktOC4xLTE4LTE4LTE4Yy05LjksMC0xOCw4LjEtMTgsMTh2MTk2LjJsLTc1LjgtNzUuOCAgICBjLTctNy0xOC40LTctMjUuNSwwYy03LDctNywxOC40LDAsMjUuNWwxMDYuNSwxMDYuNWMzLjUsMy41LDguMSw1LjMsMTIuNyw1LjNjNC42LDAsOS4yLTEuOCwxMi43LTUuM2wxMDYuNS0xMDYuNSAgICBDMzcxLjEsMjY5LjgsMzcxLjEsMjU4LjQsMzY0LjEsMjUxLjN6IiBmaWxsPSIjMDAwMDAwIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNMjQ1LDBjLTkuOSwwLTE4LDguMS0xOCwxOHY0MS4yYzAsOS45LDguMSwxOCwxOCwxOGM5LjksMCwxOC04LjEsMTgtMThWMThDMjYzLDguMSwyNTQuOSwwLDI0NSwweiIgZmlsbD0iIzAwMDAwMCIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTQzOC4yLDMzNC45Yy05LjksMC0xOCw4LjEtMTgsMThWNDU0SDY5LjhWMzUyLjljMC05LjktOC4xLTE4LTE4LTE4Yy05LjksMC0xOCw4LjEtMTgsMThWNDcyYzAsOS45LDguMSwxOCwxOCwxOGgzODYuMyAgICBjMTAsMCwxOC4xLTguMSwxOC4xLTE4VjM1Mi45QzQ1Ni4yLDM0Myw0NDguMSwzMzQuOSw0MzguMiwzMzQuOXoiIGZpbGw9IiMwMDAwMDAiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K" />
                </div>
                <Button id="mapStyleOptionsButton" className="buttons graphText btn buttonsText" onClick={this.toggleOptionsMapStyleShow}>{this.state.optionsMapStyleShow ? 'Hide Map' : 'Show Map'}</Button>
                <Button id="dataShow" className="buttons dataText btn buttonsText" onClick={()=>this.toggleOptionShow('PCoords')}> Query Data </Button>
                <Button id="graphShow" className="buttons graphText btn buttonsText" onClick={()=>this.toggleOptionShow('VPL')}> Compute Data </Button>
            </div>
        );
    }
}

export default connect(s=>({map: s.map}))(Options);
