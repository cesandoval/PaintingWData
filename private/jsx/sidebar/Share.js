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
            snapshotPreviewImg: '',
            snapshots: [],
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
            .then(res => res.json())
            .then(({ snapshots }) => {
                console.log('getSnapshots res', { snapshots })
                this.checked.snapshotsLoaded = true

                this.setState({
                    snapshots,
                })
            })
            .catch(e => console.error(e))
    }

    deleteSnapshot = hash => {
        console.log('deleteSnapshots start')
        const hashs = [hash]

        fetch('/deleteSnapshots/', {
            //Important: I don't know why this isn't authenticating, but I'll ask Carlos...
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                hashs,
            }),
        })
            .then(res => res.json())
            .then(res => {
                console.log('deleteSnapshots res', { res })
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

    copySnapshotLink = hash => {
        const shareLink = `https://s3.amazonaws.com/data-voxel-snapshots/${hash}.jpg`
        const inputDom = document.querySelector('#snapshot-link')
        inputDom.value = shareLink
        this.execCopy(inputDom)
    }

    execCopy = inputDom => {
        inputDom.select()
        document.execCommand('copy')
        message.success('Link Has Been Copied')
    }

    takeSnapshot = e => {
        console.log('takeSnapshot', e)
        this.setState({
            snapshotModalVisible: true,
        })

        const mapCanvas = document.querySelector('#mapCanvas canvas')

        const snapshotPreviewImg = {
            snapshotPreviewImg: mapCanvas.toDataURL('image/png'),
        }
        this.setState(snapshotPreviewImg)
    }

    handleSnapshotTaking = () => {
        this.setState({
            snapshotTaking: true,
        })

        const snapshotName =
            document.querySelector('#snapshotTakingName').value ||
            `${datavoxelId}-${Date.now()}`

        // if (Date.now() > 0) return true
        window
            .takeSnaptshot(datavoxelId, true, snapshotName)
            .then(() => {
                this.setState({
                    snapshotModalVisible: false,
                    snapshotTaking: false,
                })
            })
            .catch(e => {
                console.error(e)
                this.setState({
                    snapshotTaking: false,
                })
            })
    }

    handleCancelSnapshotTaking = () => {
        this.setState({
            snapshotModalVisible: false,
            snapshotTaking: false,
        })
    }

    snapshotDOM = ({ name, hash, image, createdAt }) => {
        const createAtDate = new Date(createdAt).toDateString()

        return (
            <div
                className="snapshot"
                style={{
                    backgroundImage: `url('${image}')`,
                }}
                key={hash}
            >
                <span className="snapshot-tool">
                    <i
                        className="fas fa-trash"
                        onClick={() => this.deleteSnapshot(hash)}
                    />
                    <i
                        className="fas fa-link"
                        onClick={() => this.copySnapshotLink(hash)}
                    />
                </span>
                <div className="desc">
                    <span className="name">{name}</span>
                    <span className="time">{createAtDate}</span>
                </div>

                <style jsx>{`
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

                        --snapshot-tool-opacity: 0;
                        &:hover {
                            --snapshot-tool-opacity: 1;
                        }

                        .snapshot-tool {
                            position: absolute;
                            right: 0;
                            margin-right: 20px;
                            margin-top: 6px;
                            opacity: var(--snapshot-tool-opacity);
                            transition: 0.5s opacity ease-out;

                            cursor: pointer;

                            > i + i {
                                margin-left: 12px;
                            }
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
                    }
                `}</style>
            </div>
        )
    }

    render() {
        // /* Testing snapshot UI */
        // const snapshotImage = `https://s3.amazonaws.com/data-voxel-images/${datavoxelId}.jpg`

        const snapshotPreviewImg =
            this.state.snapshotPreviewImg ||
            `https://s3.amazonaws.com/data-voxel-images/${datavoxelId}.jpg`

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
                    <img src={snapshotPreviewImg} />
                    <div className="name">
                        <Input
                            id="snapshotTakingName"
                            addonBefore="Name"
                            defaultValue="Case AbCd"
                        />
                    </div>
                </Modal>

                <div className="snapshots">
                    {this.state.snapshots.map(
                        ({ name, hash, image, createdAt }) => {
                            return this.snapshotDOM({
                                name,
                                hash,
                                image,
                                createdAt,
                            })
                        }
                    )}
                    <div className="snapshot add" onClick={this.takeSnapshot}>
                        <i className="fas fa-plus fa-3x" />
                    </div>
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

                        .snapshots {
                            overflow-y: scroll;
                            height: 500px;
                        }

                        .snapshot.add {
                            $sh: 140px;
                            margin: 10px 10px;
                            width: 260px;
                            height: $sh + 2px;

                            $r: 5px;
                            border: 1px solid #ccc;
                            border-radius: $r;
                            cursor: pointer;

                            text-align: center;
                            i {
                                line-height: 140px;
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
