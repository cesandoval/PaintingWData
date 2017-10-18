export default class Exporter {
    // pixels will be a Three.js geometry
    constructor(geometries) {
        this.geometries = geometries
    }

    static parseGeometries(
        pixels,
        layerName,
        remap = false,
        translation = false
    ) {
        let geomSize = pixels.geometry.attributes.size.array
        let geomTranslation = pixels.geometry.attributes.translation.array

        if (remap != false && translation != false) {
            var color = pixels.endColor

            // rescale this to 0-255
            var rgbColor = [
                'rgb(',
                remap(color.r),
                ',',
                remap(color.g),
                ',',
                remap(color.b),
                ')',
            ].join('')
            var opacity = pixels.material.uniforms.transparency.value
            var allGeometries = ''
        } else {
            var geomsJSON = []
        }

        for (let i = 0, j = 0; i < geomTranslation.length; i = i + 3, j++) {
            let x = geomTranslation[i]
            let y = geomTranslation[i + 2]
            if (x != 0 && y != 0) {
                let size = geomSize[j]

                if (remap != false && translation != false) {
                    var currCircle = [
                        '<circle id="',
                        j,
                        '" r="',
                        size,
                        '" cx="',
                        x + translation[0],
                        '" cy="',
                        y + translation[1],
                        '" fill="',
                        rgbColor,
                        '" fill-opacity="',
                        opacity,
                        '" stroke-width="0"></circle>',
                    ].join('')

                    allGeometries = allGeometries.concat(currCircle)
                } else {
                    var currPoint = {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [x, y],
                        },
                        properties: {
                            value: size,
                            layerName: layerName,
                        },
                    }
                    geomsJSON.push(currPoint)
                }
            }
        }
        if (remap != false && translation != false) {
            return ['<g id="', layerName, '">', allGeometries, '</g>'].join('')
        } else {
            return geomsJSON
        }
    }

    // Zoom Extent based on geo's bbox
    static exportSVG(geometries, translation, centroid, bounds) {
        const remap = x => 255 * ((x - 0) / (1 - 0)) + 0

        let layers = Object.keys(geometries)
        let allSVG = [
            [
                '<svg width="',
                bounds[0],
                'px" height="',
                bounds[1],
                'px" viewBox="0 0 ',
                bounds[0],
                ' ',
                bounds[1],
                '">',
            ].join(''),
        ]
        for (let i in layers) {
            allSVG = allSVG.concat(
                this.parseGeometries(
                    geometries[layers[i]],
                    layers[i],
                    remap,
                    translation
                )
            )
        }

        allSVG = allSVG.concat('</svg>').join('')
        return allSVG
    }

    static exportJSON(geometries) {
        let layers = Object.keys(geometries)

        let allJSON = { type: 'FeatureCollection' }
        allJSON.features = []
        for (let i in layers) {
            allJSON.features = allJSON.features.concat(
                this.parseGeometries(geometries[layers[i]], layers[i])
            )
        }
        return JSON.stringify(allJSON)
    }
}
