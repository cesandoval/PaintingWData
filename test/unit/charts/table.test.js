import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15';
import { Table } from '../../../private/jsx/charts/table'

Enzyme.configure({ adapter: new Adapter() });

function setup() {
    const props = {
      addTodo: jest.fn()
    }

    const enzymeWrapper = shallow(<Table />)

    return {
      props,
      enzymeWrapper
    }
  }

describe('Charts', () => {
    describe('Table', () => {
      it('should render self and subcomponents', () => {
        const { enzymeWrapper } = setup()

        expect(enzymeWrapper.find('div').hasClass('header')).toBe(true)

        // expect(enzymeWrapper.find('h1').text()).toBe('todos')

        // const todoInputProps = enzymeWrapper.find('TodoTextInput').props()
        // expect(todoInputProps.newTodo).toBe(true)
        // expect(todoInputProps.placeholder).toEqual('What needs to be done?')
      })

    })
  })