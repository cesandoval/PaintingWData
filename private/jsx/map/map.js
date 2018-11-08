import React from 'react'
import * as Act from '../store/actions'
import { connect } from 'react-redux'
import PCoords from '../pcoords/pcoords'
import VPL from '../vprog/rVpl'
import Charts from '../charts/charts'
import Table from '../charts/table'
import Cover from './Cover'

/**
 * The Map component. Contains a draggable, zoomable map, with voxels as concentric circles
 * representing the data points. This can be used to correlate two variables, such as home
 * prices, or asthma rates, etc.
 * @author PaintingWithData
 */
class MapCanvas extends React.Component {
    /**
     * The constructor, which initializes the state of the Map component.
     * @param {Object} props
     */
    constructor(props) {
        super(props)
        /**
         * The state of the Map component.
         * @type     {Object}
         * @property {Boolean} mapInited True iff we've rendered the map graphics.
         * @property {Boolean} mapStarted True iff the sidebar options have been initialized.
         * @property {PaintGraph.Graph} instance The graph containing the canvas properties.
         */
        this.state = { mapInited: false, instance: {}, mapStarted: false }
    }
    /**
     * Adds the DOM element with id "mapCanvas", and binds it to a Graph G.
     * Then, G is bound to this.state.instance.
     */
    componentDidMount() {
        // The element 'mapCanvas'; the height and width.
        const gElement = document.getElementById('mapCanvas')
        const gHeight = window.innerHeight
        const gWidth = gElement.clientWidth
        // Constructs a new PaintGraph.Graph based in "mapCanvas" and updates state.
        const G = new PaintGraph.Graph(gElement, gHeight, gWidth)
        G.start()
        this.setState({ instance: G })
    }
    /**
     * This function either:
     *    (1) Renders the initial map; this is only when the map loads.
     *    (2) Initializes the sidebar options.
     * We'll only do anything on initialization. Otherwise, we don't do anything.
     * @param {Object} newProps The props to be passed in.
     */
    componentWillReceiveProps(newProps) {
        // Checks if we've already initialized or if the props passed in aren't layers.
        if (!_.isEmpty(newProps.layers) && !this.state.mapInited) {
            // Gets the layers once they appear, maps them to Pixels objects, and adds the pixel geometries to the map.
            Act.mapInit({
                instance: this.state.instance,
                datasetsLayers: newProps.layers,
            })
            // Now we know that the map is initialized.
            this.setState({ mapInited: true })
            Act.setLoading({ value: false })
        }

        // Initializes the sidebar options.
        // if (newProps.mapStarted && !this.state.mapStarted) {
        //     const options = this.props.options
        //     // Changes the option values accordingly.

        //     if (options.knnValue) Act.mapSetKNN({ value: options.knnValue })
        //     if (options.opacity) Act.mapSetOpacity({ value: options.opacity })
        //     if (options.bgStyle) Act.mapSetBgStyle({ value: options.bgStyle })
        //     // Sets mapStarted = true so that this conditional block doesn't get accessed again.

        //     this.setState({ mapStarted: true })
        // }
    }

    /* 
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
    
    // Zooms the map back to its original location.
    zoomMap() {
        PaintGraph.Pixels.zoomExtent(this.props.map, this.props.bbox)
        window.refreshTiles()
        window.updateTiles()
    }
    */

    render() {
        const panelShow = this.props.panelShow
        const activeNodeType = this.props.activeNode
            ? this.props.activeNode.type
            : ''

        const PCoordsShow =
            panelShow == 'PCoords' ||
            (panelShow == 'VPL' && activeNodeType == 'DATASET')

        return (
            <div>
                <div
                    id="table"
                    // style={{
                    //     backgroundColor: 'white',
                    //     width: 'calc(95vw - 280px)',
                    //     position: 'fixed',
                    //     overflow: 'hidden',
                    //     top: '170px',
                    //     right: '2.5vw',
                    //     zIndex: '100',
                    //     opacity: 0.9,
                    //     display: panelShow == 'TABLE' ? '' : 'none',
                    //     border: 'none',
                    // }}
                >
                    <Table />
                </div>
                <style jsx>
                    {`
                        #table {
                            background-color: white;
                            width: calc(95vw - 280px);
                            position: fixed;
                            overflow: hidden;
                            top: 170px;
                            right: 2.5vw;
                            zindex: 100;
                            opacity: 0.9;
                            display: ${panelShow == 'TABLE' ? '' : 'none'};
                            border: none;
                        }
                    `}
                </style>

                <div
                    id="charts"
                    // style={{
                    //     backgroundColor: 'white',
                    //     width: 'calc(100vw - 280px)',
                    //     height: '300px',
                    //     position: 'fixed',
                    //     overflow: 'hidden',
                    //     bottom: '0px',
                    //     right: '0',
                    //     zIndex: '100',
                    //     opacity: 0.5,
                    //     display: panelShow.includes('Chart') ? '' : 'none',
                    // }}
                >
                    <Charts />
                </div>
                <style jsx>
                    {`
                        #charts {
                            background-color: white;
                            width: calc(100vw - 280px);
                            height: 300px;
                            position: fixed;
                            overflow: hidden;
                            bottom: 0px;
                            right: 0;
                            zindex: 100;
                            opacity: 0.5;
                            display: ${panelShow.includes('Chart')
                                ? ''
                                : 'none'};
                        }
                    `}
                </style>

                <div style={{ display: panelShow == 'VPL' ? '' : 'none' }}>
                    <VPL />
                </div>
                <div id="PCoords">
                    <PCoords />
                </div>
                <style jsx>{`
                    #PCoords {
                        transition: visibility 0s, opacity 0.7s ease-out;
                        visibility: ${PCoordsShow ? 'visible' : 'hidden'};
                        opacity: ${PCoordsShow ? 1 : 0};
                    }
                `}</style>

                <div id="Cover">
                    <Cover />
                </div>
                <style jsx>{`
                    #Cover {
                        width: 100%;
                        height: 100%;
                    }
                `}</style>
                <div className="map" id="mapCanvas" />
                <style jsx>
                    {`
                        #mapCanvas {
                            width: calc(100vw - 280px);
                            position: fixed;
                            right: 0;
                            top: 50px;
                            bottom: 0;
                            z-index: -1;
                        }
                    `}
                </style>
            </div>
        )
    }
}

export default connect(s => ({
    layers: s.datasets.layers,
    map: s.map.instance,
    mapStarted: s.map.started,
    options: s.options,
    panelShow: s.interactions.panelShow,
    activeNode: s.vpl.nodes[s.interactions.activeNode],
    geometries: s.map.geometries,
    bbox: s.map.bbox,
    vpl: s.vpl,
}))(MapCanvas)
