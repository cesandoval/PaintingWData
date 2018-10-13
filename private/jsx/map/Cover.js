/* global project */

import React from 'react'
import * as Act from '../store/actions'
import { connect } from 'react-redux'

import { Modal, Button, Menu, Dropdown } from 'antd'

class Cover extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            exportModalVisible: false,
        }

        this.initBgMapRender()
    }

    exportSVG(geoms) {
        // let layer = Object.values(this.props.layers)[0]
        let centroid = this.props.map.camera.position
        let bbox = this.props.bbox[0]
        let projectedMin = project([bbox[0][0], bbox[0][1]])
        let projectedMax = project([bbox[2][0], bbox[2][1]])

        let translation = [0 - projectedMin.x, 0 - projectedMax.z]
        let bounds = [
            Math.abs(projectedMax.x + translation[0]),
            Math.abs(projectedMax.z + (0 - projectedMin.z)),
        ]

        return PaintGraph.Exporter.exportSVG(
            geoms,
            translation,
            centroid,
            bounds
        )
    }

    triggerDownload(exportFile, exportType) {
        var data = new Blob([exportFile], { type: 'text/plain' })

        if (textFile !== null) {
            window.URL.revokeObjectURL(textFile)
        }

        let textFile = window.URL.createObjectURL(data)

        let link = document.createElement('a')
        link.setAttribute('download', 'projectExport.'.concat(exportType))
        link.href = textFile
        document.body.appendChild(link)
        link.click()
    }

    exportJSON(geoms) {
        return PaintGraph.Exporter.exportJSON(geoms)
    }

    exportSHP(geoms) {
        return PaintGraph.Exporter.exportSHP(geoms)
    }

    exportMap(type) {
        console.log(`exportMap(${type})`)

        let geoms = this.props.geometries
        switch (type) {
            case 'SVG': {
                let svgExport = this.exportSVG(geoms)
                this.triggerDownload(svgExport, 'svg')

                break
            }
            case 'GeoJSON': {
                let jsonExport = this.exportJSON(this.props.layers)
                this.triggerDownload(jsonExport, 'json')

                break
            }
            case 'SHP': {
                this.exportSHP(this.props.layers)

                break
            }
        }
    }

    getScreenShot() {
        window.getScreenShot()
    }

    /**
     * Zooms the map back to its original location.
     */
    zoomMap() {
        PaintGraph.Pixels.zoomExtent(this.props.map, this.props.bbox)
        window.refreshTiles()
        window.updateTiles()
    }

    setExportModalVisible = exportModalVisible => {
        this.setState({ exportModalVisible })
    }

    initBgMapRender = () => {
        if (this.updateMapStyle(this.props.bgStyle)) console.log('started')
        else
            setTimeout(() => {
                this.initBgMapRender()
            }, 1500)
    }
    updateMapStyle = style => {
        window.mapBgStyle = style

        const started = window.refreshTiles && window.updateTiles && true
        // console.log(`updateMapStyle(${style})`, started)

        const value = style

        if (started) {
            try {
                Act.mapSetBgStyle({ value })
                window.refreshTiles() // call window.refreshTiles() to refresh the tiles cache.
                window.updateTiles() // call window.updateTiles() to update the tiles.
                return true
            } catch (e) {
                // console.error(e)
                return false
            }
        }
    }

    changeMapStyle = style => {
        console.log('changeMapStyle(style) ', style)

        this.updateMapStyle(style)
    }

    componentWillReceiveProps({ show }) {
        // console.log(`componentWillReceiveProps(${show})`)

        const bgStyle =
            this.props.bgStyle == 'empty'
                ? this.defaultBgStyle
                : this.props.bgStyle

        if (show != this.state.show) {
            this.setState({ show })

            if (show) {
                this.changeMapStyle(bgStyle)
            } else {
                this.updateMapStyle('empty')
            }
        }
    }

    render() {
        const MapStyleMenu = (
            <Menu onClick={({ key }) => this.changeMapStyle(key)}>
                <Menu.Item key="empty">
                    <span>Empty </span>
                </Menu.Item>
                <Menu.Item key="mapbox.streets">
                    <span>Streets </span>
                </Menu.Item>
                <Menu.Item key="mapbox.light">
                    <span>Light </span>
                </Menu.Item>
                <Menu.Item key="mapbox.dark">
                    <span>Dark </span>
                </Menu.Item>
                <Menu.Item key="mapbox.satellite">
                    <span>Satellite </span>
                </Menu.Item>
                <Menu.Item key="mapbox.streets-satellite">
                    <span>Streets-Satellite </span>
                </Menu.Item>
                <Menu.Item key="mapbox.wheatpaste">
                    <span>Wheatpaste </span>
                </Menu.Item>
                <Menu.Item key="mapbox.streets-basic">
                    <span>Streets-Basic </span>
                </Menu.Item>
                <Menu.Item key="mapbox.comic">
                    <span>Comic </span>
                </Menu.Item>
                <Menu.Item key="mapbox.outdoors">
                    <span>Outdoors </span>
                </Menu.Item>
                <Menu.Item key="mapbox.run-bike-hike">
                    <span>Run-Bike-Hike </span>
                </Menu.Item>
                <Menu.Item key="mapbox.pencil">
                    <span>Pencil </span>
                </Menu.Item>
                <Menu.Item key="mapbox.pirates">
                    <span>Pirates </span>
                </Menu.Item>
                <Menu.Item key="mapbox.emerald">
                    <span>Emerald </span>
                </Menu.Item>
                <Menu.Item key="mapbox.high-contrast">
                    <span>High-Contrast </span>
                </Menu.Item>
            </Menu>
        )

        const mapButtonsInvisible = this.props.panelShow == 'VPL'

        return (
            <div>
                <div
                    id="mapButtons"
                    style={{ display: mapButtonsInvisible ? 'none' : '' }}
                >
                    <div id="left-top">
                        <Dropdown overlay={MapStyleMenu}>
                            <Button
                                shape="circle"
                                icon="appstore-o"
                                size="large"
                            />
                        </Dropdown>
                    </div>
                    <div id="right-top">
                        <Button
                            shape="circle"
                            icon="export"
                            size="large"
                            onClick={() => this.setExportModalVisible(true)}
                        />
                        <Button
                            shape="circle"
                            icon="scan"
                            size="large"
                            onClick={() => this.zoomMap()}
                        />
                    </div>
                </div>

                <style jsx>{`
                    #left-top {
                        position: absolute;
                        top: 20px;
                        left: calc(280px + 30px);
                    }
                    #right-top {
                        position: absolute;
                        top: 20px;
                        right: 30px;
                    }

                    #mapButtons {
                        :global(button) {
                            margin: 10px;
                            border-color: #00000030;
                            // border-width: 0px;
                            background-color: #ffffffe0;
                            &:hover {
                                color: #e75332;
                                border-color: #e75332;
                            }
                        }
                    }
                `}</style>

                <Modal
                    wrapClassName="export-modal"
                    visible={this.state.exportModalVisible}
                    style={{ top: '25vh' }}
                    title={null}
                    footer={null}
                    onCancel={() => this.setExportModalVisible(false)}
                >
                    <span className="title">Export Project</span>
                    {/* SVG GeoJSON SHP IMAGE */}
                    <span className="fileTypes">
                        <span
                            className="fileType"
                            onClick={() => {
                                this.exportMap('SVG')
                            }}
                        >
                            <i className="far fa-file-code" />
                            <span className="fileTypeName">SVG</span>
                        </span>
                        <span
                            className="fileType"
                            onClick={() => {
                                this.exportMap('GeoJSON')
                            }}
                        >
                            <i className="far fa-file-code" />
                            <span className="fileTypeName">GeoJSON</span>
                        </span>
                        <span
                            className="fileType"
                            onClick={() => {
                                this.exportMap('SHP')
                            }}
                        >
                            <i className="far fa-file-archive" />
                            <span className="fileTypeName">SHP</span>
                        </span>
                        <span className="fileType" onClick={this.getScreenShot}>
                            <i className="far fa-file-image" />
                            <span className="fileTypeName">Image</span>
                        </span>
                    </span>
                </Modal>
                <style jsx>{`
                    :global(.export-modal) {
                        :global(.ant-modal-body) {
                            text-align: center;
                            height: 260px;
                        }

                        .title {
                            display: block;
                            font-size: 20px;
                            margin-bottom: 62px;
                        }

                        .fileType {
                            transition: opacity 0.1s;
                            cursor: pointer;
                            display: inline-block;
                            opacity: 0.3;
                            margin: 0 20px;
                            width: 78px;

                            &:hover {
                                opacity: 0.5;
                            }

                            .far {
                                display: block;
                                font-size: 28px;
                            }
                            .fileTypeName {
                                font-size: 13px;
                                margin: 7px 0;
                                line-height: 18px;
                                font-weight: 600;
                            }
                        }
                    }
                `}</style>
            </div>
        )
    }
}

export default connect(s => ({
    layers: s.datasets.layers,
    map: s.map.instance,
    mapStarted: s.map.started,
    options: s.options,
    geometries: s.map.geometries,
    bbox: s.map.bbox,
    vpl: s.vpl,
    bgStyle: s.options.bgStyle,
    panelShow: s.interactions.panelShow,
}))(Cover)
