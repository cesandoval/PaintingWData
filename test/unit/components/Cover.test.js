import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15' 
import { Cover } from '../../../private/jsx/mapN/Cover'
import * as Act from '../../../private/jsx/store/actions'
import * as t from '../../../private/jsx/store/types'

describe ('updateMapStyle', () => {
    it("should be called when changeMapStyle is called", () => {
        let wrapper = shallow(<Cover/>);
        // Mock the updateMapStyle function.
        wrapper.instance().updateMapStyle = jest.fn();
        wrapper.update();
        // Calling changeMapStyle should call updateMapStyle exactly once w/ the same parameters.
        wrapper.instance().changeMapStyle("Dark");
        expect(wrapper.instance().updateMapStyle.mock.calls.length).toEqual(1);
        expect(wrapper.instance().updateMapStyle).toBeCalledWith("Dark");
    })

    it("should return true when a valid map style is passed in", () => {
        // This is actually kind of an integration test, and same for the one below.
        let wrapper = shallow(<Cover/>);
        
    })

    it("should return false when an invalid map style is passed in", () => {
        let wrapper = shallow(<Cover/>);
    })
})

describe ('exports', () => {
    it("should do nothing if an invalid case is passed in", () => {
        
    })

    it("should call triggerDownload with a specified second argument", () => {
        let wrapper = shallow(<Cover/>);
        // Mocks triggerDownload by returning its second argument; the type.
        wrapper.instance().triggerDownload = jest.fn((exportFile, exportType) => exportType);
        wrapper.instance().exportSVG = jest.fn(geoms => "");
        wrapper.instance().exportJSON = jest.fn(layers => "");
        wrapper.update();

        expect(wrapper.instance().exportMap('SVG')).toEqual("svg");
        expect(wrapper.instance().exportMap('GeoJSON')).toEqual("json");
    })
})