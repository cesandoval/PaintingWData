import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15' 
import { Cover } from '../../../private/jsx/mapN/Cover'
import * as Act from '../../../private/jsx/store/actions'
import * as t from '../../../private/jsx/store/types'

Enzyme.configure({ adapter: new Adapter() });

describe ('updateMapStyle', () => {
    it("should be called when changeMapStyle is called", () => {
        const wrapper = shallow(<Cover/>);
        const instance = wrapper.instance();
        // Mock the updateMapStyle function.
        instance.updateMapStyle = jest.fn();
        wrapper.update();
        // Calling changeMapStyle should call updateMapStyle exactly once w/ the same parameters.
        instance.changeMapStyle("Dark");
        expect(instance.updateMapStyle.mock.calls.length).toEqual(1);
        expect(instance.updateMapStyle).toBeCalledWith("Dark");
    })

    it("should return true only when a valid map style is passed in", () => {
        const wrapper = shallow(<Cover/>);
        const instance = wrapper.instance();
        // Mock the window namespace.
        Object.defineProperty(window, "refreshTiles", {value: () => ""});
        Object.defineProperty(window, "updateTiles", {value: () => ""});
        // This is actually kind of an integration test, and same for the one below
        expect(instance.updateMapStyle("mapbox.streets")).toBe(true); 
        expect(instance.updateMapStyle("mapbox.invalid_style")).toBe(false);
    })

    it("should return false when an invalid map style is passed in", () => {
        let wrapper = shallow(<Cover/>);
    })
})

describe ('exports', () => {
    it("should call triggerDownload with a specified second argument", () => {
        const wrapper = shallow(<Cover/>);
        const instance = wrapper.instance();
        // Mocks triggerDownload by returning its second argument; the type.
        instance.triggerDownload = jest.fn((exportFile, exportType) => exportType);
        instance.exportSVG = jest.fn(geoms => "");
        instance.exportJSON = jest.fn(layers => "");
        wrapper.update();
        // Now we test exportMap with different parameters.
        instance.exportMap('SVG');
        expect(instance.triggerDownload.mock.calls.length).toEqual(1);
        expect(instance.triggerDownload.mock.calls[0][1]).toBe("svg");
        instance.exportMap('GeoJSON');
        expect(instance.triggerDownload.mock.calls.length).toEqual(2);
        expect(instance.triggerDownload.mock.calls[1][1]).toBe("json");
    })
})