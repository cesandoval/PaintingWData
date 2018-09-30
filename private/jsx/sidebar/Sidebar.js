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
                        :global(.ant-tabs) {
                            height: 100%;
                        }
                    }
                `}</style>
            </div>
        )
    }
}
