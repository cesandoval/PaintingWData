import React from 'react'
import { connect } from 'react-redux'

import Modifications from './Modifications'
import Panels from './Panels'
// import * as Act from '../store/actions'

class Controls extends React.Component {
    constructor(props) {
        super(props)
    }

    componentWillReceiveProps() {}

    render() {
        return (
            <div id="sidebar-controls">
                <p className="control-name"> MODIFICATIONS </p>
                <Modifications />
                <p className="control-name"> PANELS </p>
                <Panels />
                <style jsx>{`
                    .control-name {
                        font-size: 18px;
                        padding: 0px;
                        margin-bottom: 2px;
                        font-weight: 800;
                        text-align: center;
                        vertical-align: middle;
                        font-family: 'Karla', sans-serif;
                    }
                `}</style>
            </div>
        )
    }
}

const mapStateToProps = s => {
    return {
        panelShow: s.interactions.panelShow,
    }
}

export default connect(mapStateToProps)(Controls)
