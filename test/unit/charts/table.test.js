import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15';
import { Table } from '../../../private/jsx/charts/table'

Enzyme.configure({ adapter: new Adapter() });

function setup() {
    const props = {
        columns: jest.fn(),
        tableData: jest.fn()
    }

    const enzymeWrapper = shallow(<Table {...props}/>)

    return {
        props,
        enzymeWrapper
    }
  }

describe('Charts', () => {
    describe('Table', () => {
        it('should render self and subcomponents', () => {
            const { enzymeWrapper } = setup()

            // Tests whether or not the main div was rendered
            expect(enzymeWrapper.find('div').hasClass('chartTable')).toBe(true)

            // Tests whether or not the reactTable was rendered
            expect(enzymeWrapper.find('ReactTable').exists()).toBe(true)

            // Tests the initial properties for the table header
            const tableProps = enzymeWrapper.find('ReactTable').props()
            expect(tableProps.columns[0].Header).toBe('Voxel ID')
            expect(tableProps.columns[0].id).toBe('row')
            expect(tableProps.columns[0].maxWidth).toBe(60)
            expect(tableProps.columns[0].resizable).toBe(false)
        })
        
        it('add new columns to the table', () => {
            const { enzymeWrapper, props } = setup()

            // Attach the table component
            let tableProps = enzymeWrapper.find('ReactTable').props()
            // Initial table length should be 1
            expect(tableProps.columns.length).toBe(1)

            // Add a column to the table
            enzymeWrapper.setState({ columns: [{Header: 'layerProp', accessor: 'layerVal'}] })
            // Redefine tableProps
            tableProps = enzymeWrapper.find('ReactTable').props()
            // New table length should be 2
            expect(tableProps.columns.length).toBe(2)

        })
      })
  })