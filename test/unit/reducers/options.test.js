import reducer from '../../../private/jsx/store/reducers/options.js'
import * as t from '../../../private/jsx/store/types'

// const DEFAULT_BGSTYLE = 'mapbox.light'
// const DEFAULT_OPACITY = 50
// const DEFAULT_KNN = 0

describe('MAP_SET_BGSTYLE', () => {
    it("Should return whatever's passed in, or the default on invalid input", () => {
        // Return what you want when valid.
        expect(
            reducer(undefined, {
                type: t.MAP_SET_BGSTYLE,
                value: 'mapbox.dark',
            }).bgStyle
        ).toEqual('mapbox.dark')
    })
})

describe('MAP_SET_OPACITY', () => {
    it("Should return whatever's passed in, or the default on invalid input", () => {
        // Return what you want when valid.
        expect(
            reducer(undefined, {
                type: t.MAP_SET_OPACITY,
                value: 90,
            }).opacity
        ).toEqual(90)
    })
})

describe('MAP_SET_KNN', () => {
    it("Should return whatever's passed in, or the default on invalid input", () => {
        // Return what you want on valid.
        expect(
            reducer(undefined, {
                type: t.MAP_SET_KNN,
                value: 6,
            }).knnValue
        ).toEqual(6)
    })
})
