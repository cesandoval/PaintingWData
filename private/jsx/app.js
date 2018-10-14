// /*global datavoxelId*/
import React from 'react'
// import * as Act from './store/actions.js'
import Sidebar from './sidebar/Sidebar' // origin is sidebar/sidebar
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
    /**
     * Summary. Renders the three components in App: Options, Sidebar, and Map.
     */
    render() {
        const isEmbedUrl = window.location.pathname.split('/')[1] == 'embed'

        return (
            <div className="mapMain">
                <Loading />
                {/* <Options /> */}
                <Sidebar />
                <Map />
                <style jsx global>{`
                    .sidebar,
                    #PCoords,
                    #Cover,
                    body > nav {
                        display: ${isEmbedUrl ? 'none' : ''};
                    }

                    #mapCanvas {
                        width: ${isEmbedUrl ? '100vw !important' : ''};
                        top: ${isEmbedUrl ? '0 !important' : ''};
                    }
                `}</style>
            </div>
        )
    }
}
