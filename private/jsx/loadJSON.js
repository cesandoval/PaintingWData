/* global THREE, scene */

import Rx from 'rxjs/Rx'

import json from '../static/nyc-small-er.json'

const features = json.features
const lineFeatures = features.filter(f => f.geometry.type == 'LineString')
console.log({ json, features, lineFeatures })

const material = new THREE.LineBasicMaterial({ color: 0x0000ff })

Rx.Observable
    .from(lineFeatures)
    .retry(1000)
    .map(m => {
        const geometry = new THREE.Geometry()

        m.geometry.coordinates.map(d => {
            const [x, y] = d
            // console.log({ x, y })
            geometry.vertices.push(new THREE.Vector3(x, y, 0))
        })
        console.log({ g: geometry })
        return geometry
    })
    .take(300)
    // .subscribe(observer('$drawLines'))
    .map(geometry => {
        const line = new THREE.Line(geometry, material)
        return scene.add(line)

        //
        // TODO: parse line coords?
        //
    })
    .retry(100)
    .subscribe({
        next: n => console.log('Next: $drawLines', n),
        error: e => console.log('Error: ', e),
        complete: c => console.log(c, 'Completed'),
    })
