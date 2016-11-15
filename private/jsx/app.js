import React from 'react';

import Sidebar from './sidebar/sidebar';
import Options from './options/options';
import Map from './map/map';

export default class extends React.Component {
    render() {
        return(
            <div className="mapMain">
                <Options />
                <Sidebar />
                <Map />
            </div>
        );
    }
}
