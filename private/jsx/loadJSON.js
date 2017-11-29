/* global THREE, project */

import Rx from 'rxjs/Rx'
import store from './store/store'

import json from '../static/nyc-small-er.json'

const features = json.features
const lineFeatures = features.filter(f => f.geometry.type == 'LineString')
console.log({ json, features, lineFeatures })

const material = new THREE.LineBasicMaterial({ color: 0x0000ff })

Rx.Observable
    .from(lineFeatures)
    .delay(5000) // wait global function to be defined
    .map(m => {
        const geometry = new THREE.Geometry()

        m.geometry.coordinates.map(d => {
            const [lng, lat] = d
            // console.log({ lng, lat })

            const coords = project([lat, lng])
            // const coords = project([lng, lat])

            // // x, y coordinates
            const x = coords.x
            const y = coords.z

            geometry.vertices.push(new THREE.Vector3(x, y, 0))
        })

        return geometry
    })
    .take(1000)
    .map(geometry => {
        const line = new THREE.Line(geometry, material)
        const scene = store.getState().map.instance.scene
        // console.log({ scene })

        return scene.add(line)

        //
        // TODO: parse line coords?
        //
    })
    .retry(100)
    .subscribe({
        // next: n => console.log('Next: $drawLines', n),
        error: e => console.log('Error: ', e),
        complete: c => console.log(c, 'Completed'),
    })
