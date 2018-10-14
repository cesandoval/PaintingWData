/*global datavoxelId*/
// /*global userSignedIn */

import React from 'react'
import { connect } from 'react-redux'

// import * as Act from '../store/actions.js'

import { Input, message } from 'antd'

message.config({
    top: 100,
    duration: 2,
    maxCount: 1,
})

class Controls extends React.Component {
    constructor(props) {
        super(props)
    }

    componentWillReceiveProps() {}

    copyEmbedLink = () => {
        const copyText = document.querySelector('#project-embeddable-link')
        copyText.select()
        document.execCommand('copy')
        message.success('Embeddable Link is Copied')
    }

    render() {
        return (
            <div id="sidebar-share">
                <p>Embed Link</p>
                <div
                    style={{ marginBottom: 16 }}
                    className="embed-link"
                    onClick={this.copyEmbedLink}
                >
                    <Input
                        id="project-embeddable-link"
                        placeholder="embeddable link"
                        onClick={this.copyEmbedLink}
                        style={{ width: '80%' }}
                        value={`paintingwithdata.com/embed/${datavoxelId}`}
                        readOnly
                        addonAfter={<i className="fas fa-link" />}
                    />
                </div>

                <style jsx>{`
                    #sidebar-share {
                        text-align: center;
                        .embed-link {
                            cursor: pointer;
                        }
                        p {
                            margin-top: 10px;
                            margin-bottom: 5px;
                            font-size: 16px;
                        }
                    }
                `}</style>
            </div>
        )
    }
}

const mapStateToProps = s => {
    return {
        vpl: s.vpl,
        options: s.options,
    }
}

export default connect(mapStateToProps)(Controls)
