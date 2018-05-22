import React from 'react'
import { connect } from 'react-redux'

import * as act from '../store/actions'

import OptionsMapStyle from './optionsMapStyle'
import Button from 'react-bootstrap/lib/Button'

class Options extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
        this.state.optionsMapStyleShow = true

        /*
        this.toggleOptionsMapStyleShow = this.toggleOptionsMapStyleShow.bind(
            this
        )
        */
    }
    componentDidMount() {
        // console.log(gElement);
    }
    /*
    toggleOptionShow(option) {
        console.log(`toggleOptionShow(${option})`)
        if (this.props.map.optionShow == option) act.setOptionShow('')
        else act.setOptionShow(option)
    }
    */
    togglePanelShow = panelName => {
        console.log(`togglePanelShow(${panelName})`)
        if (this.props.panelShow == panelName) act.setPanelShow({ value: '' })
        else act.setPanelShow({ value: panelName })
    }

    toggleOptionsMapStyleShow = () => {
        console.log(
            'toggleOptionsMapStyleShow',
            !this.state.optionsMapStyleShow
        )

        this.setState({ optionsMapStyleShow: !this.state.optionsMapStyleShow })
    }

    getScreenShot() {
        window.getScreenShot()
    }

    render() {
        return (
            <div className="options--react">
                <div
                    id="mapStyleOptions"
                    style={{
                        display: this.state.optionsMapStyleShow ? '' : 'none',
                    }}
                >
                    <OptionsMapStyle
                        show={this.state.optionsMapStyleShow}
                        onHide={() => {
                            this.setState({ optionsMapStyleShow: false })
                        }}
                    />
                </div>
                <div
                    onClick={this.getScreenShot}
                    style={{
                        cursor: 'pointer',
                        position: 'absolute',
                        width: '100%',
                        textAlign: 'center',
                        marginTop: '-20px',
                    }}
                >
                    {
                        // <img label="screenshot-download" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA0OTAgNDkwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0OTAgNDkwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCI+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTM2NC4xLDI1MS4zYy03LTctMTguNC03LTI1LjUsMEwyNjMsMzI3LjFWMTMwLjljMC05LjktOC4xLTE4LTE4LTE4Yy05LjksMC0xOCw4LjEtMTgsMTh2MTk2LjJsLTc1LjgtNzUuOCAgICBjLTctNy0xOC40LTctMjUuNSwwYy03LDctNywxOC40LDAsMjUuNWwxMDYuNSwxMDYuNWMzLjUsMy41LDguMSw1LjMsMTIuNyw1LjNjNC42LDAsOS4yLTEuOCwxMi43LTUuM2wxMDYuNS0xMDYuNSAgICBDMzcxLjEsMjY5LjgsMzcxLjEsMjU4LjQsMzY0LjEsMjUxLjN6IiBmaWxsPSIjMDAwMDAwIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNMjQ1LDBjLTkuOSwwLTE4LDguMS0xOCwxOHY0MS4yYzAsOS45LDguMSwxOCwxOCwxOGM5LjksMCwxOC04LjEsMTgtMThWMThDMjYzLDguMSwyNTQuOSwwLDI0NSwweiIgZmlsbD0iIzAwMDAwMCIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTQzOC4yLDMzNC45Yy05LjksMC0xOCw4LjEtMTgsMThWNDU0SDY5LjhWMzUyLjljMC05LjktOC4xLTE4LTE4LTE4Yy05LjksMC0xOCw4LjEtMTgsMThWNDcyYzAsOS45LDguMSwxOCwxOCwxOGgzODYuMyAgICBjMTAsMCwxOC4xLTguMSwxOC4xLTE4VjM1Mi45QzQ1Ni4yLDM0Myw0NDguMSwzMzQuOSw0MzguMiwzMzQuOXoiIGZpbGw9IiMwMDAwMDAiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K" />
                        <img
                            label="screenshot-camera"
                            src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA0OTAuNCA0OTAuNCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDkwLjQgNDkwLjQ7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4Ij4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNDA2Ljg1LDU1LjdoLTc2LjdjLTkuOSwwLTE4LDguMS0xOCwxOHM4LjEsMTgsMTgsMThoNzYuN2MxMS4yLDAsMjAuMyw5LjEsMjAuMywyMC4zdjE4NS44YzAsMTIuNi0xMC4zLDIyLjktMjIuOSwyMi45ICAgIEg4Ni4wNWMtMTIuNiwwLTIyLjktMTAuMy0yMi45LTIyLjlWMTEyYzAtMTEuMiw5LjEtMjAuMywyMC4zLTIwLjNoNzYuN2M4LjQsMCwxNS42LTUuOCwxNy41LTEzLjlsMy42LTE1LjMgICAgYzMuNi0xNS42LDE3LjMtMjYuNSwzMy40LTI2LjVoNjAuOWM5LjksMCwxOC04LjEsMTgtMThzLTguMS0xOC0xOC0xOGgtNjAuOWMtMzIuOCwwLTYxLDIyLjMtNjguNCw1NC4zbC0wLjMsMS40aC02Mi40ICAgIGMtMzEuMSwwLTU2LjMsMjUuMy01Ni4zLDU2LjN2MTg1LjdjMCwzMi41LDI2LjQsNTguOSw1OC44LDU4LjloMzE4LjJjMzIuNSwwLDU4LjktMjYuNCw1OC45LTU4LjlWMTEyICAgIEM0NjMuMTUsODAuOSw0MzcuODUsNTUuNyw0MDYuODUsNTUuN3oiIGZpbGw9IiMwMDAwMDAiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0zMjMuMDUsMTc5LjFjLTkuOSwwLTE4LDguMS0xOCwxOGMwLDMzLjEtMjYuOSw1OS45LTU5LjksNTkuOXMtNTkuOS0yNi45LTU5LjktNTkuOXMyNi45LTU5LjksNTkuOS01OS45ICAgIGM5LjksMCwxOC04LjEsMTgtMThjMC05LjktOC4xLTE4LTE4LTE4Yy01Mi45LDAtOTUuOSw0My05NS45LDk1LjljMCw1Mi45LDQzLDk1LjksOTUuOSw5NS45YzUyLjksMCw5NS45LTQzLDk1LjktOTUuOSAgICBDMzQxLjA1LDE4Ny4yLDMzMi45NSwxNzkuMSwzMjMuMDUsMTc5LjF6IiBmaWxsPSIjMDAwMDAwIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNMzkyLjM1LDM4OC4ySDk3Ljk1Yy05LjksMC0xOCw4LjEtMTgsMThjMCw5LjksOC4xLDE4LDE4LDE4aDI5NC40YzEwLDAsMTgtOCwxOC0xOCAgICBDNDEwLjM1LDM5Ni4zLDQwMi4yNSwzODguMiwzOTIuMzUsMzg4LjJ6IiBmaWxsPSIjMDAwMDAwIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNMzQ0LjM1LDQ1NC40aC0xOTguNGMtOS45LDAtMTgsOC4xLTE4LDE4YzAsOS45LDguMSwxOCwxOCwxOGgxOTguNGM5LjksMCwxOC04LjEsMTgtMTggICAgQzM2Mi4zNSw0NjIuNSwzNTQuMjUsNDU0LjQsMzQ0LjM1LDQ1NC40eiIgZmlsbD0iIzAwMDAwMCIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo="
                        />
                    }
                    <span style={{ marginLeft: '5px', verticalAlign: 'sub' }}>
                        Map Screenshot
                    </span>
                </div>
                <Button
                    id="mapStyleOptionsButton"
                    className="buttons graphText btn buttonsText"
                    onClick={this.toggleOptionsMapStyleShow}
                >
                    {this.state.optionsMapStyleShow ? 'Hide Map' : 'Show Map'}
                </Button>
                <Button
                    id="dataShow"
                    className="buttons dataText btn buttonsText"
                    onClick={() => this.togglePanelShow('PCoords')}
                >
                    {' '}
                    Query Data{' '}
                </Button>
                <Button
                    id="graphShow"
                    className="buttons graphText btn buttonsText"
                    onClick={() => this.togglePanelShow('VPL')}
                >
                    {' '}
                    Compute Data{' '}
                </Button>
            </div>
        )
    }
}

export default connect(s => ({
    map: s.map,
    panelShow: s.interactions.panelShow,
}))(Options)
