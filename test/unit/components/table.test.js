import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'
import { Table } from '../../../private/jsx/charts/table'

Enzyme.configure({ adapter: new Adapter() })

function setup() {
    const props = {
        columns: jest.fn(),
        tableData: jest.fn(),
    }

    const enzymeWrapper = shallow(<Table {...props} />)

    return {
        props,
        enzymeWrapper,
    }
}

describe('Table components', () => {
    it('should render self and subcomponents', () => {
        const { enzymeWrapper } = setup()

        // Tests whether or not the main div was rendered
        expect(enzymeWrapper.find('div').hasClass('chartTable')).toBe(true)

        // Tests whether or not the reactTable was rendered
        expect(enzymeWrapper.find('ReactTable').exists()).toBe(true)
    })

    it('add new columns to the table', () => {
        // const { enzymeWrapper, props } = setup()
        const { enzymeWrapper } = setup()

        // Attach the table component
        let tableProps = enzymeWrapper.find('ReactTable').props()
        // Initial table length should be 1
        expect(tableProps.columns.length).toBe(1)

        // Add a column to the table
        enzymeWrapper.setState({
            columns: [{ Header: 'layerProp', accessor: 'layerVal' }],
        })
        // Redefine tableProps
        tableProps = enzymeWrapper.find('ReactTable').props()
        // New table length should be 2
        expect(tableProps.columns.length).toBe(2)
    })

    it('should set the props to the values specified', () => {
        const { enzymeWrapper } = setup()

        // Tests the initial properties for the table header
        const tableProps = enzymeWrapper.find('ReactTable').props()
        expect(tableProps.columns[0].Header).toBe('Voxel ID')
        expect(tableProps.columns[0].id).toBe('row')
        expect(tableProps.columns[0].maxWidth).toBe(60)
        expect(tableProps.columns[0].resizable).toBe(false)

        // Tests other props of ReactTable.
        expect(tableProps.showPaginationTop).toBe(false)
        expect(tableProps.showPaginationBottom).toBe(true)
        expect(tableProps.showPageJump).toBe(false)
        expect(tableProps.defaultPageSize).toBe(50)
        expect(tableProps.pageSizeOptions).toEqual([25, 50, 100, 500, 1000])
        expect(tableProps.className).toBe('-highlight')
    })
})

describe('Table componentWillReceiveProps()', () => {
    it('should maintain the first column on componentWillReceiveProps', () => {
        const { enzymeWrapper } = setup()
        let newProps = {
            tableData: [{ INCOME_OBJECTID: 130 }, { INCOME_OBJECTID: 305 }],
        }
        enzymeWrapper.setProps(newProps)
        // Tests the initial properties for the table header, even if new props are passed in.
        const tableProps = enzymeWrapper.find('ReactTable').props()
        expect(tableProps.columns[0].Header).toBe('Voxel ID')
        expect(tableProps.columns[0].id).toBe('row')
        expect(tableProps.columns[0].maxWidth).toBe(60)
        expect(tableProps.columns[0].resizable).toBe(false)
    })

    it('should modify to the appropriate tableData', () => {
        const { enzymeWrapper } = setup()
        let newProps = {
            tableData: [{ INCOME_OBJECTID: 130 }, { INCOME_OBJECTID: 305 }],
        }
        enzymeWrapper.setProps(newProps)
        // Tests
        const tableProps = enzymeWrapper.find('ReactTable').props()
        expect(tableProps.data).toEqual(newProps.tableData)
    })

    it('should have equality with Header and Accessor', () => {
        const { enzymeWrapper } = setup()
        let newProps = {
            tableData: [{ INCOME_OBJECTID: 130 }, { INCOME_OBJECTID: 305 }],
        }
        enzymeWrapper.setProps(newProps)
        // Tests
        const tableProps = enzymeWrapper.find('ReactTable').props()
        expect(tableProps.columns[1].Header).toEqual(
            tableProps.columns[1].accessor
        )
    })
})
