import React from 'react'
import Enzyme, { shallow, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15' 
import { App } from '../../../private/jsx/app'

Enzyme.configure({ adapter: new Adapter() });

describe("render()", () => {
    it("should have a .mapMain element", () => {
        const wrapper = shallow(<App />);
        expect(wrapper.find(".mapMain").length).toEqual(1);
    })
})