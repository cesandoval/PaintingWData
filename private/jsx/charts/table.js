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
        const tableData = this.state.tableData
        this.state.columns.unshift({
            Header: 'ID',
            id: 'ID',
            accessor: function(d) {
                return tableData.indexOf(d)
            },
            resizable: false,
            minWidth: 50,
            maxWidth: 75,
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
                />
            </div>
        )
    }
}

export default connect(s => ({
    tableData: s.datasets.tableData,
}))(Table)
