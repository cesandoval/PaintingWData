import * as Act from '../../private/jsx/store/actions'
import * as t from '../../private/jsx/store/types'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
// import fetchMock from 'fetch-mock'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe("reducer actions", () => {
    // afterEach(() => {
    //     fetchMock.reset()
    //     fetchMock.restore()
    // })

    it("should return the corresponding reducer given the action creator", () => {
        const expectedActions = [ 
            { type: t.IMPORT_USERFILE }
        ]
        const store = mockStore({ todos: [] })
        return store.dispatch(Act.importUserfile()).then(() => {
            expect(store.getActions()).toEqual(expectedActions);
        })
    })
})