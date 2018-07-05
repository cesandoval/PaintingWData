import reducer from '../../private/jsx/store/reducers/interactions.js'
import * as t from '../../private/jsx/store/types'
import axios from 'axios'

describe('REDUCER \"interactions.js\"', () => {
    it('should ', () => {
        expect(
            reducer(undefined, {
                type: t.SET_LOADING,
                value: null,
            }).loading
        ).toBeFalsy();

        expect(
            reducer(undefined, {
                type: t.SET_LOADING,
                value: false,
            }).loading
        ).toBeFalsy();

        expect(
            reducer(undefined, {
                type: t.SET_LOADING,
                value: true,
            }).loading
        ).toBeTruthy(); 
    })
})
