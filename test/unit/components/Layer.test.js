/*
TODO: Tests to implement.
- Make sure nothing is rendered if this.props.showSidebar is false.
- Make sure this.state.node.color really is changed to a new (VALID) color hex upon this.changeColor.
- Make sure this.state.node.visibility is a Boolean, and it is changed upon check/uncheck.
 */
import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'
import { Layer } from '../../../private/jsx/sidebar/Layer'

Enzyme.configure({ adapter: new Adapter() })

describe('render', () => {
    it('should render nothing iff this.props.showSidebar == false', () => {
        let wrapper = shallow(<Layer showSidebar={false} />)
        expect(wrapper.html()).toEqual(null)
        wrapper = shallow(<Layer showSidebar={true} />)
        expect(wrapper.hasClass('layers__single')).toBe(true)
    })
})

describe('inputs: handleCheckedEvent and changeColor', () => {
    it('should have two input nodes', () => {
        const wrapper = shallow(<Layer />)
        // const instance = wrapper.instance()
        // Check if there are two inputs, corresponding to handleCheckedEvent and changeColor.
        expect(wrapper.find('input').length).toEqual(2)
    })
    /*
    // Functionality of changeColor.
    describe("this.changeColor", () => {
        it("should call this.changeColor upon onChange of the first input", () => {
            const wrapper = shallow(<Layer />);
            const instance = wrapper.instance();
            // Mocks Act.nodeUpdate.
            Act.nodeUpdate = jest.fn();
            // Mocks the event.
            const mockedEvent = { target: {value: "#FF00FF"}}
            wrapper.find({ name: "color" }).simulate("change", mockedEvent);
            expect(instance.changeColor).toHaveBeenCalled();
        })
    })
    // Functionality of handleCheckedEvent.
    describe("this.handleCheckedEvent", () => {

    })
    */
})
