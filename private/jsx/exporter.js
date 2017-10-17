export default class Exporter {
    // pixels will be a Three.js geometry
    constructor(geometries) {
        this.geometries = geometries
    }

    // Zoom Extent based on geo's bbox
    static exportSVG(geometries) {
        let layers = Object.keys(geometries)
        let test = geometries[layers[0]]
        console.log(test)
        return 'we are exporting svgs'
    }
}
