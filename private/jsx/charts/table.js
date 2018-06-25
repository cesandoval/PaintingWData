import React from 'react'
import { connect } from 'react-redux'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
// import * as Act from '../store/actions'

class Table extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            columns: [],
            tableData: [],
        }
    }

    componentWillReceiveProps(newProps) {
        this.props = newProps
        const firstRowHeaders = Object.keys(this.props.tableData[0])
        const columns = firstRowHeaders.map(function(headerValue) {
            return { Header: headerValue, accessor: headerValue }
        })
        this.setState({ columns: columns, tableData: newProps.tableData })
    }

    render() {
        this.state.columns.unshift({
            Header: 'Voxel ID',
            id: 'row',
            maxWidth: 60,
            // filterable: false,
            resizable: false,
            Cell: row => {
                return <div>{row.index + 1}</div>
            },
        })
        return (
            <div>
                <ReactTable
                    data={this.state.tableData}
                    columns={this.state.columns}
                    showPaginationTop={false}
                    showPaginationBottom={true}
                    showPageJump={false}
                    defaultPageSize={50}
                    pageSizeOptions={[25, 50, 100, 500, 1000]}
                    className="-highlight"
                    style={{
                        // This will force the table body to overflow and scroll, since there is not enough room
                        height: '72.5vh',
                    }}
                    filterable
                />
            </div>
        )
    }
}

export default connect(s => ({
    tableData: s.datasets.tableData,
}))(Table)
