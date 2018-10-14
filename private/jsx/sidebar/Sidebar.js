import React from 'react'

import { Tabs } from 'antd'
const TabPane = Tabs.TabPane

import Layers from './Layers'
import Controls from './Controls'
import Share from './Share'

export default class Sidebar extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <div className="sidebar">
                <Tabs>
                    <TabPane tab={<i className="fas fa-database" />} key="1">
                        <Layers />
                    </TabPane>
                    <TabPane tab={<i className="fas fa-wrench" />} key="2">
                        <Controls />
                    </TabPane>
                    <TabPane tab={<i className="fas fa-share-alt" />} key="3">
                        <Share />
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
