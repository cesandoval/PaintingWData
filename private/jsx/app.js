/*global datavoxelId*/

import React from 'react'

import * as Act from './store/actions.js'

import Sidebar from './sidebar/sidebar'
import Options from './options/options'
import Map from './map/map'

export default class App extends React.Component {
    // TODO: when the user closes out, save the userFile
    componentDidMount() {
        /*eslint-disable*/
        fetch(`/importuserfile/${datavoxelId}`, {
            method: 'GET',
            credentials: 'include',
        })
            .then(data => data.json())
            .then(newState => {
                debugger;
                Act.importUserfile(newState);
            })
            .catch(e => console.log('importUserfile() error', e))
    }
    //    TODO: this is called if the data is empty
    //     //-- Test Block Start --: test importUserfile.
    //     const data = {
    //         options: {
    //             opacity: 10, // 0 ~ 100
    //             knnValue: 1, // 0 ~ 8
    //             bgStyle: 'mapbox.dark',
    //         },
    //     }
    //     Act.importUserfile({ data })
    //     //--- Test Block End ---: test importUserfile.
    // }

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
