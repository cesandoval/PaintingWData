import React from 'react'

import * as Act from './store/actions.js'

import Sidebar from './sidebar/sidebar'
import Options from './options/options'
import Map from './map/map'

export default class App extends React.Component {
    componentDidMount() {
        /* // TODO: update the fetch $path and $options.
        fetch(`/getuserfile/${userId}/${datavoxelId}`, {
            method: 'POST',
            credentials: 'include',
        })
            .then(({ data }) => {
                this.importUserfile({ data })
            })
            .catch(e => console.log('getuserfile() error', e))

				*/

        //-- Test Block Start --: test importUserfile.
        const data = {
            options: {
                opacity: 10, // 0 ~ 100
                knnValue: 1, // 0 ~ 8
                bgStyle: 'mapbox.dark',
            },
        }

        Act.importUserfile({ data })
        //--- Test Block End ---: test importUserfile.
    }

    render() {
        return (
            <div className="mapMain">
                <Options />
                <Sidebar />
                <Map />
            </div>
        )
    }
}
