import React from 'react'
import { connect } from 'react-redux'

import * as Act from '../store/actions'

class Panels extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            panels: {
                VPL: {
                    title: 'VPL',
                    img:
                        'https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png',
                    desc: 'Compute & Connect Data By Draggable Tool',
                    more:
                        'https://en.wikipedia.org/wiki/Visual_programming_language',
                },
                PCoords: {
                    title: 'Parallel Coordinates',
                    img:
                        'https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png',
                    desc: 'Visualize Filtered Data by Coordinates',
                    more: 'https://github.com/syntagmatic/parallel-coordinates',
                },
                TABLE: {
                    title: 'Table',
                    img:
                        'https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png',
                    desc: 'See data Table of each layer',
                },
                'Chart:Bar': {
                    title: 'Bar Chart',
                    img:
                        'https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png',
                    desc: 'Analyze and Filter Data by Bar Chart',
                },
                'Chart:Density': {
                    title: 'Density Chart',
                    img:
                        'https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png',
                    desc: 'Analyze and Filter Data by Density Chart',
                },
            },
        }
    }

    setActivePanel = panelName => {
        console.log(`setActivePanel(${panelName})`, { panelName })
        if (this.props.panelShow == panelName) Act.setPanelShow({ value: '' })
        else Act.setPanelShow({ value: panelName })
    }

    render() {
        const panels = this.state.panels
        console.log(this.props)

        return (
            <div id="sidebar-panels">
                {Object.entries(panels).map(([key, panel]) => {
                    const { title, img, desc } = panel
                    const activePanel =
                        this.props.panelShow === key ? 'active' : ''

                    return (
                        <div
                            className={`panelCard ${activePanel}`}
                            key={key}
                            onClick={() => {
                                this.setActivePanel(key)
                            }}
                        >
                            <span
                                className="panelImg"
                                style={{ backgroundImage: `url(${img})` }}
                            />
                            <span className="panelInfo">
                                <span className="panelTitle">{title}</span>
                                <span className="panelDesc">{desc}</span>
                            </span>
                            {/* <p>123</p> */}
                        </div>
                    )
                    // return this.panel(panel)
                })}
                <style jsx>{`
                    .panelCard {
                        margin: 5px 10px;
                        width: 260px;
                        height: 82px;
                        border: 1px solid #ccc;
                        border-radius: 3px;
                        cursor: pointer;
                        transition: border-color 0.5s;

                        &.active {
                            border-color: #e75332;
                            box-shadow: 0px 0px 3px 1px #e7533250;
                        }

                        > span {
                            display: inline-block;
                            float: left;
                        }

                        $imgSize: 70px;
                        .panelImg {
                            width: $imgSize;
                            height: $imgSize;
                            margin: 5px;
                            background-position: center center;
                            background-repeat: no-repeat;
                            border-radius: 3px;
                        }

                        .panelInfo {
                            width: 160px;

                            margin-top: 1px;
                            margin-left: 5px;

                            > span {
                                display: block;
                            }

                            .panelTitle {
                                font-size: 16px;
                            }

                            .panelDesc {
                                font-size: 10px;
                            }
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
    }
}

export default connect(mapStateToProps)(Panels)
