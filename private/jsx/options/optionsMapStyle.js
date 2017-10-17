import React from 'react'
import { connect } from 'react-redux'

import { ButtonToolbar, DropdownButton, MenuItem } from 'react-bootstrap'

class OptionsMapStyle extends React.Component {
    constructor(props) {
        super(props)

        // default mapbox.light
        this.state = {
            mapboxStyle: this.props.mapStyle,
            show: true,
        }

        this.changeMapStyle = this.changeMapStyle.bind(this)
        this.updateMapStyle = this.updateMapStyle.bind(this)

        this.start()
    }
    start() {
        if (this.updateMapStyle(this.state.mapboxStyle)) console.log('started')
        else
            setTimeout(() => {
                this.start()
            }, 1500)
    }
    updateMapStyle(style) {
        window.mapboxStyle = style

        const started = window.refreshTiles && window.updateTiles && true
        // console.log(`updateMapStyle(${style})`, started)

        if (started) {
            try {
                window.refreshTiles() // call window.refreshTiles() to refresh the tiles cache.
                window.updateTiles() // call window.updateTiles() to update the tiles.
                return true
            } catch (e) {
                // console.error(e)
                return false
            }
        }
    }

    changeMapStyle(style) {
        console.log('changeMapStyle(style) ', style)
        this.setState({ mapboxStyle: style })

        this.updateMapStyle(style)

        if (style == 'empty') this.props.onHide()
    }

    componentWillReceiveProps({ show }) {
        console.log(`componentWillReceiveProps(${show})`)

        // const mapStyle = this.state.mapboxStyle
        const mapStyle =
            this.state.mapboxStyle == 'empty'
                ? this.props.mapStyle
                : this.state.mapboxStyle

        if (show != this.state.show) {
            this.setState({ show: show })

            if (show) {
                this.changeMapStyle(mapStyle)
            } else {
                this.updateMapStyle('empty')
            }
        }
    }

    render() {
        return (
            <ButtonToolbar>
                <DropdownButton
                    id="mapStyleSelect"
                    title={this.state.mapboxStyle
                        .replace(/mapbox\./g, '')
                        .toUpperCase()}
                    bsSize="xsmall"
                    dropup
                    onSelect={this.changeMapStyle}
                >
                    <MenuItem eventKey="mapbox.streets"> Streets </MenuItem>
                    <MenuItem eventKey="mapbox.light"> Light </MenuItem>
                    <MenuItem eventKey="mapbox.dark"> Dark </MenuItem>
                    <MenuItem eventKey="mapbox.satellite"> Satellite </MenuItem>
                    <MenuItem eventKey="mapbox.streets-satellite">
                        {' '}
                        Streets-Satellite{' '}
                    </MenuItem>
                    <MenuItem eventKey="mapbox.wheatpaste">
                        {' '}
                        Wheatpaste{' '}
                    </MenuItem>
                    <MenuItem eventKey="mapbox.streets-basic">
                        {' '}
                        Streets-Basic{' '}
                    </MenuItem>
                    <MenuItem eventKey="mapbox.comic"> Comic </MenuItem>
                    <MenuItem eventKey="mapbox.outdoors"> Outdoors </MenuItem>
                    <MenuItem eventKey="mapbox.run-bike-hike">
                        {' '}
                        Run-Bike-Hike{' '}
                    </MenuItem>
                    <MenuItem eventKey="mapbox.pencil"> Pencil </MenuItem>
                    <MenuItem eventKey="mapbox.pirates"> Pirates </MenuItem>
                    <MenuItem eventKey="mapbox.emerald"> Emerald </MenuItem>
                    <MenuItem eventKey="mapbox.high-contrast">
                        {' '}
                        High-Contrast{' '}
                    </MenuItem>
                    <MenuItem divider />
                    <MenuItem eventKey="empty">Empty</MenuItem>
                </DropdownButton>
            </ButtonToolbar>

            /*
            <select value={this.state.mapboxStyle} onChange={this.changeMapStyle}>
                <option value="empty"> Empty </option>
                <option value="mapbox.streets"> Streets </option>
                <option value="mapbox.light"> Light </option>
                <option value="mapbox.dark"> Dark </option>
                <option value="mapbox.satellite"> Satellite </option>
                <option value="mapbox.streets-satellite"> Streets-Satellite </option>
                <option value="mapbox.wheatpaste"> Wheatpaste </option>
                <option value="mapbox.streets-basic"> Streets-Basic </option>
                <option value="mapbox.comic"> Comic </option>
                <option value="mapbox.outdoors"> Outdoors </option>
                <option value="mapbox.run-bike-hike"> Run-Bike-Hike </option>
                <option value="mapbox.pencil"> Pencil </option>
                <option value="mapbox.pirates"> Pirates </option>
                <option value="mapbox.emerald"> Emerald </option>
                <option value="mapbox.high-contrast"> High-Contrast </option>
            </select>
            */
        )
    }
}

export default connect(s => ({ map: s.map, geometries: s.map.geometries }))(
    OptionsMapStyle
)
