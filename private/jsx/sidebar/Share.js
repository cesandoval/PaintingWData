/*global datavoxelId*/
// /*global userSignedIn */

import React from 'react'
import { connect } from 'react-redux'

// import * as Act from '../store/actions.js'

import { Input, Modal, message } from 'antd'

message.config({
    top: 100,
    duration: 2,
    maxCount: 1,
})

class Share extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            snapshotModalVisible: false,
            snapshotTaking: false,
        }

        this.checked = {
            snapshotsLoaded: false,
        }

        console.log('<Share/> start')
        this.getSnapshots()
    }

    getSnapshots = () => {
        console.log('getSnapshots start')

        fetch('/getSnapshots/', {
            //Important: I don't know why this isn't authenticating, but I'll ask Carlos...
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                id: datavoxelId,
            }),
        })
            .then(res => {
                console.log('getSnapshots success', { res })
                this.checked.snapshotsLoaded = true
            })
            .catch(e => console.error(e))
    }

    componentWillReceiveProps() {
        if (!this.checked.snapshotsLoaded) this.getSnapshots()
    }

    copyEmbedLink = () => {
        const inputDom = document.querySelector('#project-embeddable-link')
        this.execCopy(inputDom)
    }

    copySnapshotLink = snapshotLink => {
        const inputDom = document.querySelector('#snapshot-link')
        inputDom.value = snapshotLink
        this.execCopy(inputDom)
    }

    execCopy = inputDom => {
        inputDom.select()
        document.execCommand('copy')
        message.success('Link is Copied')
    }

    takeSnapshot = e => {
        console.log('takeSnapshot', e)
        this.setState({
            snapshotModalVisible: true,
        })
    }

    handleSnapshotTaking = () => {
        this.setState({
            snapshotTaking: true,
        })
        setTimeout(() => {
            this.setState({
                snapshotModalVisible: false,
                snapshotTaking: false,
            })
        }, 2000)
    }

    handleCancelSnapshotTaking = () => {
        this.setState({
            snapshotModalVisible: false,
        })
    }

    render() {
        // /* Testing snapshot UI */
        const snapshotImage =
            'https://s3.amazonaws.com/data-voxel-images/18.jpg'

        const snapshotLink = 'https://s3.amazonaws.com/data-voxel-images/18.jpg'

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
                        value={`${window.location.origin}/embed/${datavoxelId}`}
                        readOnly
                        addonAfter={<i className="fas fa-link" />}
                    />
                </div>
                <p>Snapshots</p>

                {/* invisible input DOM only for copy function */}
                <input id="snapshot-link" value="snapshotLink" readOnly />

                <Modal
                    wrapClassName="snapshot-taking-modal"
                    title="Taking Snapshot"
                    visible={this.state.snapshotModalVisible}
                    onOk={this.handleSnapshotTaking}
                    confirmLoading={this.state.snapshotTaking}
                    onCancel={this.handleCancelSnapshotTaking}
                >
                    <img src={snapshotImage} />
                    <div className="name">
                        <Input addonBefore="Name" defaultValue="Case AbCd" />
                    </div>
                </Modal>

                <div
                    className="snapshot"
                    style={{
                        backgroundImage: `url('${snapshotImage}')`,
                    }}
                >
                    <span
                        className="share-link"
                        onClick={() => this.copySnapshotLink(snapshotLink)}
                    >
                        <i className="fas fa-link" />
                    </span>
                    <div className="desc">
                        <span className="name">Case ABCDEFG</span>
                        <span className="time">2018 Aug 20</span>
                    </div>
                </div>

                <div className="snapshot add" onClick={this.takeSnapshot}>
                    <i className="fas fa-plus fa-3x" />
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

                        #snapshot-link {
                            opacity: 0;
                            position: fixed;
                            user-select: none;
                        }

                        .snapshot {
                            $sh: 140px;
                            margin: 10px 10px;
                            width: 260px;
                            height: $sh + 2px;

                            $r: 5px;
                            border: 1px solid #ccc;
                            border-radius: $r;
                            cursor: pointer;

                            background-size: cover;
                            background-position: center center;

                            --share-link-opacity: 0;
                            &:hover {
                                --share-link-opacity: 1;
                            }

                            .share-link {
                                position: absolute;
                                right: 0;
                                margin-right: 20px;
                                margin-top: 6px;
                                opacity: var(--share-link-opacity);
                                transition: 0.5s opacity ease-out;
                            }

                            .desc {
                                $h: 34px;
                                bottom: 0px;
                                background: #ffffff8c;
                                height: $h;
                                margin-top: $sh - $h;
                                border-radius: 0px 0px $r $r;
                                border: 0px solid #ccc;
                                border-top-width: 1px;

                                span {
                                    line-height: $h;
                                }

                                .name {
                                    float: left;
                                    margin-left: $r;
                                }

                                .time {
                                    float: right;
                                    margin-right: $r;
                                }
                            }

                            &.add {
                                text-align: center;
                                i {
                                    line-height: 140px;
                                }
                            }
                        }
                    }
                `}</style>
                <style jsx global>{`
                    .snapshot-taking-modal {
                        img {
                            width: 100%;
                        }
                        .name {
                            margin: 20px 0px;
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

export default connect(mapStateToProps)(Share)
