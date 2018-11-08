import React from 'react'

import { Tabs } from 'antd'
const TabPane = Tabs.TabPane

import Layers from './Layers'
import Controls from './Controls'

export default class Sidebar extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <div className="sidebar">
                <Tabs>
                    <TabPane tab="Layers" key="1">
                        <Layers />
                    </TabPane>
                    <TabPane tab="Controls" key="2">
                        <Controls />
                    </TabPane>
                </Tabs>

                <style jsx>{`
                    :global(.ant-tabs-nav-scroll) {
                        text-align: center;
                    }

                    .sidebar {
                        z-index: 2000;
                        width: 280px;
                        background-color: white;
                        overflow: auto;
                        position: fixed;
                        left: 0;
                        top: 80px;
                        bottom: 0;

                        -webkit-box-shadow: 2px 0px 5px 0px rgba(0, 0, 0, 0.2);
                        -moz-box-shadow: 2px 0px 5px 0px rgba(0, 0, 0, 0.2);
                        box-shadow: 2px 0px 5px 0px rgba(0, 0, 0, 0.2);

                        :global(.ant-tabs) {
                            height: 100%;
                        }
                    }
                `}</style>
            </div>
        )
    }
}
