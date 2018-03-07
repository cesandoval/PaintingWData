/* global project */

import React from 'react'
import * as Act from '../store/actions'
import { connect } from 'react-redux'

import PCoords from '../pcoords/pcoords'
import VPL from '../vprog/rVpl'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import Button from 'react-bootstrap/lib/Button'

class MapCanvas extends React.Component {
    constructor(props) {
        super(props)
        // this.state = { layersAdded: false }
        this.state = { mapInited: false, instance: {} }
    }
    componentDidMount() {
        const gElement = document.getElementById('mapCanvas')
        const gHeight = window.innerHeight
        const gWidth = gElement.clientWidth
        const G = new PaintGraph.Graph(gElement, gHeight, gWidth)
        G.start()
        this.setState({ instance: G })

        // act.mapAddInstance(G)
    }
    componentWillReceiveProps(newProps) {
        // Get layers once they appear
        // Map them to Pixels objects
        // Add the pixel geometries to the map
        // console.log(99999,G)
        console.log(this.state)
        if (!_.isEmpty(newProps.layers) && !this.state.mapInited) {
            Act.mapInit({
                instance: this.state.instance,
                datasetsLayers: newProps.layers,
            })
            this.setState({ mapInited: true })
        }

        /*
        if (!_.isEmpty(newProps.layers) && !this.state.layersAdded) {
            // Sets the camera to the voxels' bbox
            const bbox = newProps.layers[0].bbox
            const canvas = newProps.map

            // Set the camera
            PaintGraph.Pixels.zoomExtent(canvas, bbox)
            // Add the map to the canvas
            PaintGraph.Pixels.buildMapbox(this.props.map, canvas, bbox)

            this.setState({ layersAdded: true, bbox: bbox, canvas: canvas })

            newProps.layers.map((layer, n) => {
                // Defined geometry
                const circle = new THREE.CircleBufferGeometry(1, 20)
                // Parses the layer
                const out = PaintGraph.Pixels.parseDataJSON(layer)

                const nodeHashKey =
                    (+new Date()).toString(32) +
                    Math.floor(Math.random() * 36).toString(36)

                // Creates the Pixels object
                const P = new PaintGraph.Pixels(
                    nodeHashKey,
                    this.props.map,
                    circle,
                    out.otherArray,
                    out.startColor,
                    out.endColor,
                    layer.geojson.minMax,
                    out.addressArray,
                    layer.rowsCols.cols,
                    layer.rowsCols.rows,
                    n,
                    layer.bounds,
                    layer.shaderText
                )

                act.mapAddGeometry(layer.name, P)
            })
        }
        */
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
        link.setAttribute('download', 'voxelExport.'.concat(exportType))
        link.href = textFile
        document.body.appendChild(link)
        link.click()
    }

    exportJSON(geoms) {
        return PaintGraph.Exporter.exportJSON(geoms)
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
                let jsonExport = this.exportJSON(geoms)
                this.triggerDownload(jsonExport, 'json')

                break
            }
        }
    }

    zoomMap() {
        // console.log(this.props.geometries['key'].geometry.material.uniforms, 888888)
        PaintGraph.Pixels.zoomExtent(this.props.map, this.props.bbox)
        // this might be adding many meshes
        PaintGraph.Pixels.buildMapbox(this.props.map, this.props.bbox)
    }

    dummyFunction() {
        console.log('Chris says hi!')
    }

    render() {
        const panelShow = this.props.panelShow
        return (
            <div>
                <div style={{ display: panelShow == 'VPL' ? '' : 'none' }}>
                    <VPL />
                </div>
                <div
                    style={{
                        display: panelShow == 'PCoords' ? '' : 'none',
                    }}
                >
                    <PCoords />
                </div>
                <div
                    style={{
                        position: 'absolute',
                        width: '80vw',
                        right: '0px',
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            left: '40px',
                            top: '20px',
                            display: panelShow == 'VPL' ? 'none' : '',
                        }}
                        className="map-menu"
                    >
                        <DropdownButton title={'Export'} id={`export-dropdown`}>
                            <MenuItem
                                onClick={() => {
                                    this.exportMap('SVG')
                                }}
                            >
                                SVG
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    this.exportMap('GeoJSON')
                                }}
                            >
                                GeoJSON
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    this.exportMap('SHP')
                                }}
                            >
                                SHP (coming soon)
                            </MenuItem>
                        </DropdownButton>

                        <Button
                            id={`save-userfile`}
                            onClick={() => {
                                this.dummyFunction()
                            }}
                        >
                            Save Userfile
                        </Button>
                    </div>
                    <Button
                        id="zoomShow"
                        className="buttons zoomText btn buttonsText"
                        onClick={() => this.zoomMap()}
                    >
                        {' '}
                        Zoom to Map{' '}
                    </Button>
                </div>
                <div className="map" id="mapCanvas" />
                <div id="pivot" />
                <div id="grid" />
            </div>
        )
    }
}

export default connect(s => ({
    layers: s.datasets.layers,
    map: s.map.instance,
    panelShow: s.interactions.panelShow,
    geometries: s.map.geometries,
    bbox: s.map.bbox,
}))(MapCanvas)
