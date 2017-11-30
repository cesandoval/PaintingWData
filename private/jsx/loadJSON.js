/* global THREE, project */

import Rx from 'rxjs/Rx'
import store from './store/store'

// import json from '../static/nyc-small-er.json'
import json from '../static/bikeLane.json'
console.log({ json })

const features = json.features
const lineFeatures = features.filter(f => f.geometry.type == 'LineString')
console.log({ json, features, lineFeatures })

const material = new THREE.LineBasicMaterial({ color: 0x9a9a9a })

Rx.Observable
    .from(lineFeatures)
    .delay(5000) // wait global function to be defined
    .map(m => {
        const geometry = new THREE.Geometry()

        m.geometry.coordinates.map(d => {
            const [lng, lat] = d
            // console.log({ lng, lat })

            const coords = project([lng, lat])

            // // x, z coordinates
            const x = coords.x
            const z = coords.z

            geometry.vertices.push(new THREE.Vector3(x, 0, z))
        })

        return geometry
    })
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
