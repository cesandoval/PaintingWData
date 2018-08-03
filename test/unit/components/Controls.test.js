import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15' 
import { Controls } from '../../../private/jsx/sidebarN/Controls'

Enzyme.configure({ adapter: new Adapter() });

describe("Controls.js render()", () => {
    it("should have exactly one div #sidebar-controls", () => {
        const wrapper = shallow(<Controls />);
        expect(wrapper.find("#sidebar-controls").length).toBe(1);
    })
    
    it("#sidebar-control should have two children with id .control-name", () => {
        const wrapper = shallow(<Controls/>);
        expect(wrapper.find("#sidebar-controls").children('.control-name').length).toEqual(2);
    })
})
