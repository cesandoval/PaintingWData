/*global datavoxelId*/

import React from 'react'
import { connect } from 'react-redux'

import * as Act from '../store/actions.js'

import { Button } from 'antd'

import Modifications from './Modifications'
import Panels from './Panels'
// import * as Act from '../store/actions'

class Controls extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            saving: false,
        }
    }

    componentWillReceiveProps() {}

    saveMemory = () => {
        const { vpl, options } = this.props

        const memory = {
            vpl,
            options,
            voxelId: datavoxelId,
        }

        this.setState({
            saving: true,
        })

        fetch('/saveuserfile/', {
            //Important: I don't know why this isn't authenticating, but I'll ask Carlos...
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(memory),
        })
            .then(res => {
                console.log('saveMemory success', { res })
                Act.setModified({ value: false })
            })
            .catch(e => console.error(e))
            .then(() => {
                setTimeout(() => {
                    this.setState({
                        saving: false,
                    })
                }, 1300)
            })
    }

    render() {
        return (
            <div id="sidebar-controls">
                <p className="control-name"> ADJUSTMENTS </p>
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
                <div
                    id="save"
                    className={this.props.modified ? 'modified' : ''}
                >
                    <Button
                        loading={this.state.saving}
                        icon="save"
                        onClick={this.saveMemory}
                    >
                        Save
                    </Button>
                </div>
                <style jsx>{`
                    #save {
                        margin-top: 10px;
                        width: 100%;
                        text-align: center;

                        &.modified :global(button) {
                            border-left-color: #32e781;
                            border-left-width: 4px;
                            transition-duration: 1s;
                        }

                        :global(.ant-btn) {
                            color: #000000a6;
                            border-color: #d9d9d9;
                        }
                    }
                `}</style>
            </div>
        )
    }
}

const mapStateToProps = s => {
    return {
        panelShow: s.interactions.panelShow,
        vpl: s.vpl,
        options: s.options,
        modified: s.memory.modified,
    }
}

export default connect(mapStateToProps)(Controls)
