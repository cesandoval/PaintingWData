import React from 'react'
import { connect } from 'react-redux'

import { Icon, Spin } from 'antd'

class Loading extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const loadingIcon = (
            <Icon type="loading" style={{ fontSize: 42 }} spin />
        )

        return (
            <div>
                <div id="loading">
                    <Spin indicator={loadingIcon} />
                </div>
                <style jsx>{`
                    #loading {
                        display: ${this.props.loading ? '' : 'none'};

                        position: fixed;
                        height: 100vh;
                        width: 100vw;

                        background-color: #0000001f;

                        z-index: 3000;
                        text-align: center;

                        :global(.ant-spin) {
                            position: absolute;
                            top: calc(50vh - 84px);
                            color: #e75332;
                        }
                    }
                `}</style>
            </div>
        )
    }
}

export default connect(s => ({
    loading: s.interactions.loading,
}))(Loading)
