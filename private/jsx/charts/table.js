import React from 'react'
import { connect } from 'react-redux'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
// import * as Act from '../store/actions'

// var science = require('science')

class Table extends React.Component {
    constructor(props) {
        super(props)
        // this.state = { densityData: [], histogramData: [] }
    }

    componentWillReceiveProps(newProps) {
        this.props = newProps
        console.log(newProps.tableData, 234234325436464) //
    }

    render() {
        const data = []
        for (let i = 0; i < 100; i++) {
            data.push({
                name: 'Tanner Linsley',
                age: i,
                friend: {
                    name: 'Jason Maurer',
                    age: i,
                },
            })
        }

        const columns = [
            {
                Header: 'Name',
                accessor: 'name', // String-based value accessors!
            },
            {
                Header: 'Age',
                accessor: 'age',
                Cell: props => <span className="number">{props.value}</span>, // Custom cell components!
            },
            {
                id: 'friendName', // Required because our accessor is not a string
                Header: 'Friend Name',
                accessor: d => d.friend.name, // Custom value accessors!
            },
            {
                id: 'friendAge',
                Header: 'Friend Age', // Custom header components!
                accessor: d => d.friend.age,
            },
        ]

        return (
            <div>
                <ReactTable
                    data={data}
                    columns={columns}
                    showPagination={false}
                    showPaginationTop={false}
                    showPaginationBottom={false}
                    showPageJump={false}
                    // defaultPageSize={50}
                    // className="-striped -highlight"
                />
            </div>
        )
    }
}

export default connect(s => ({
    // datasets: s.datasets,
    // layers: s.datasets.layers,
    // geometries: s.map.geometries,
    // nodes: s.vpl.nodes,
    // pcoordsValue: s.options.pcoordsValue,
    // panelShow: s.interactions.panelShow,
    tableData: s.datasets.tableData,
}))(Table)
