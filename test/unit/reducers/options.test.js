import reducer from '../../../private/jsx/store/reducers/options.js'
import * as t from '../../../private/jsx/store/types'
import axios from 'axios'

const DEFAULT_BGSTYLE = "mapbox.light";
const DEFAULT_OPACITY = 50;
const DEFAULT_KNN = 0;

describe("MAP_SET_BGSTYLE", () => {
    it("Should return whatever's passed in, or the default on invalid input", () => {
        // Return what you want when valid.
        expect(
            reducer(undefined, {
                type: t.MAP_SET_BGSTYLE,
                value: "mapbox.dark"
            }).bgStyle
        ).toEqual("mapbox.dark");
        // Return the default value when an invalid occurs.
        expect(
            reducer(undefined, {
                type: t.MAP_SET_BGSTYLE,
                value: 35
            }).bgStyle
        ).toEqual(DEFAULT_BGSTYLE);
        expect(
            reducer(undefined, {
                type: t.MAP_SET_BGSTYLE,
                value: null
            }).bgStyle
        ).toEqual(DEFAULT_BGSTYLE);
    })
})

describe("MAP_SET_OPACITY", () => {
    it("Should return whatever's passed in, or the default on invalid input", () => {
        // Return what you want when valid.
        expect(
            reducer(undefined, {
                type: t.MAP_SET_OPACITY,
                value: 90
            }).opacity
        ).toEqual(90);
        // Return the default value when an invalid occurs.
        expect(
            reducer(undefined, {
                type: t.MAP_SET_OPACITY,
                value: "Invalid"
            }).opacity
        ).toEqual(DEFAULT_OPACITY);
        // It's above 100, so it's invalid.
        expect(
            reducer(undefined, {
                type: t.MAP_SET_OPACITY,
                value: 101
            }).opacity
        ).toEqual(DEFAULT_OPACITY);
    })
})

describe("MAP_SET_KNN", () => {
    it("Should return whatever's passed in, or the default on invalid input", () => {
        // Return what you want on valid.
        expect(
            reducer(undefined, {
                type: t.MAP_SET_KNN,
                value: 6
            }).knnValue
        ).toEqual(6);
        // Return the default value when an invalid occurs.
        expect(
            reducer(undefined, {
                type: t.MAP_SET_KNN,
                value: "Invalid"
            }).knnValue
        ).toEqual(DEFAULT_KNN);
        expect(
            reducer(undefined, {
                type: t.MAP_SET_KNN,
                value: false
            }).knnValue
        ).toEqual(DEFAULT_KNN);
        // It's below 0, so it's invalid.
        expect(
            reducer(undefined, {
                type: t.MAP_SET_KNN,
                value: -22
            }).knnValue
        ).toEqual(DEFAULT_KNN);
    })
})