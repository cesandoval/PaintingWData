import reducer from '../../../private/jsx/store/reducers/interactions.js'
import * as t from '../../../private/jsx/store/types'
import axios from 'axios'

// SET_LOADING
describe('reducer: \"interactions.js\", case: SET_LOADING', () => {
    it('should be true on null', () => {
        expect(
            reducer(undefined, {
                type: t.SET_LOADING,
                value: null,
            }).loading
        ).toBeTruthy();
    })
    it ('should be false when false', () => {
        expect(
            reducer(undefined, {
                type: t.SET_LOADING,
                value: false,
            }).loading
        ).toBeFalsy();

    })
    it ("should be true on true", () => {
        expect(
            reducer(undefined, {
                type: t.SET_LOADING,
                value: true,
            }).loading
        ).toBeTruthy(); 
    })
})
// SET_PANELSHOW
describe('reducer: \"interactions.js\", case: SET_PANELSHOW', () => {
    it('should be \"PCoords\" on null', () => {
        expect(
            reducer(undefined, {
                type: t.SET_PANELSHOW,
                value: null,
            }).panelShow
        ).toEqual("PCoords");
    })
    it ('should, if not null, be the string passed in', () => {
        expect(
            reducer(undefined, {
                type: t.SET_PANELSHOW,
                value: "Hello, world!",
            }).panelShow
        ).toEqual("Hello, world!");
    })
})
// SET_ACTIVENODE
describe('reducer: \"interactions.js\", case: SET_ACTIVENODE', () => {
    it('should be \"\" on null', () => {
        expect(
            reducer(undefined, {
                type: t.SET_ACTIVENODE,
                value: null,
            }).activeNode
        ).toEqual("");
    })
    it ('should, if not null, be the string passed in', () => {
        expect(
            reducer(undefined, {
                type: t.SET_ACTIVENODE,
                value: "Hello, world!",
            }).activeNode
        ).toEqual("Hello, world!");
    })
})
// SET_REFRESHVOXELS
describe('reducer: \"interactions.js\", case: SET_REFRESHVOXELS', () => {
    it('should be false on null', () => {
        expect(
            reducer(undefined, {
                type: t.SET_REFRESHVOXELS,
                value: null,
            }).refreshVoxels
        ).toBeFalsy();
    })
    it ('should be false when false', () => {
        expect(
            reducer(undefined, {
                type: t.SET_REFRESHVOXELS,
                value: false,
            }).refreshVoxels
        ).toBeFalsy();

    })
    it ("should be true on true", () => {
        expect(
            reducer(undefined, {
                type: t.SET_REFRESHVOXELS,
                value: true,
            }).refreshVoxels
        ).toBeTruthy(); 
    })
})


