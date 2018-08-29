// /*global datavoxelId*/
import React from 'react'
// import * as Act from './store/actions.js'
import Sidebar from './sidebar/Sidebar' // origin is sidebar/sidebar
// import Options from './options/options'
import Map from './map/map'

import Loading from './components/Loading'

/**
 * Summary. The main meat of the mapping service.
 *
 * Description. Contains the Map, Sidebar and Options components. Also loads the
 * saved "state" of a map if the user saved it beforehand.
 *
 * @author PaintingWithData
 */
export default class App extends React.Component {
    /**
     * Summary. Loads a saved state if we've saved it before. By "saved it
     * before" we mean "clicked on `Save Userfile`" before closing out. Then,
     * when we start it up again, it retains whatever options we did.
     *
     * Description. HTTP GET request accesses `app/routers/appRouter.js` as
     * per usual, which then accesses a method in `app/controllers/userFileController.js`.
     * The Datauserfile model, in `app/models/datauserfile.js`, is where the
     * necessary saved states are stored.
     *
     * TODO: When the user closes out, automatically save.
     */
    componentDidMount() {
        /*
         * Promises. Fetches the saved state, and then updates the Redux variables
         * accordingly.
         */
        // fetch(`/importuserfile/${datavoxelId}`, {
        //     method: 'GET',
        //     credentials: 'include',
        // })
        //     .then(data => data.json())
        //     .then(newState => {
        //         Act.importUserfile(newState)
        //     })
        //     .catch(e => console.log('importUserfile() error', e))
        /*
         * TODO: The following should be ran when we don't have anything yet to
         * import.
         *     const data = {
         *         options: {
         *             opacity: 10, // 0 ~ 100
         *             knnValue: 1, // 0 ~ 8
         *             bgStyle: 'mapbox.dark',
         *         },
         *     }
         *     Act.importUserfile({ data })
         */
    }
    /**
     * Summary. Renders the three components in App: Options, Sidebar, and Map.
     */
    render() {
        return (
            <div className="mapMain">
                <Loading />
                {/* <Options /> */}
                <Sidebar />
                <Map />
            </div>
        )
    }
}
