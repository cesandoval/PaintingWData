import React from 'react'
import { connect } from 'react-redux'

import { Tabs } from 'antd'
const TabPane = Tabs.TabPane

import Layers from './Layers'
import Controls from './Controls'

export class Sidebar extends React.Component {
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
                `}</style>
            </div>
        )
    }
}

export default connect(s => ({
    loading: s.interactions.loading,
}))(Sidebar)
