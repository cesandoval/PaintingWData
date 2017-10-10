export default class Exporter {
    // pixels will be a Three.js geometry
    constructor(geometries){
        this.geometries = geometries

    }

    static parseGeometries(pixels, layerName, remap) {
        let geomTranslation = pixels.geometry.attributes.translation.array;
        let geomSize = pixels.geometry.attributes.size.array;
        let color = pixels.endColor;

        // rescale this to 0-255
        let rgbColor = ["rgb(",remap(color.r),",", remap(color.g),",", remap(color.b),")"].join("");
        let opacity = pixels.material.uniforms.transparency.value
        let allGeometries = ''

        for (let i = 0, j = 0; i < geomTranslation.length; i = i + 3, j++){
            let x = geomTranslation[i];
            let y = geomTranslation[i+2];
            if (x!=0 && y!=0) {
                let size = geomSize[j];
                var currCircle = ['<circle id="', j, '" r="', size, '" cx="', x, '" cy="', y, '" fill="', 
                rgbColor, '" fill-opacity="', opacity, '" stroke-width="0"></circle>'].join("");

                allGeometries = allGeometries.concat(currCircle);
                
            }
        }
        
        return ['<g id="', layerName, '">', allGeometries, '</g>'].join("");
    }

    // Zoom Extent based on geo's bbox
    static exportSVG(geometries) {
        const remap = x => (255)*((x-0)/(1-0))+0;

        let layers = Object.keys(geometries);
        let allSVG = ['<svg width="2000px" height="600px" viewBox="0 0 1000 300">'];
        for (let i in layers) {
            allSVG = allSVG.concat(this.parseGeometries(geometries[layers[i]], layers[i], remap));
        }   

        allSVG = allSVG.concat('</svg>').join("");
        return allSVG;
    }
}
