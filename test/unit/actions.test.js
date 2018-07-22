import * as Act from '../../private/jsx/store/actions'
import * as t from '../../private/jsx/store/types'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe("reducer actions", () => {
    afterEach(() => {
        fetchMock.reset()
        fetchMock.restore()
    })

    it("should return the corresponding reducer given the action creator", () => {
        const expectedActions = [ 
            { type: t.IMPORT_DATASETS }
        ]
        const store = mockStore({ todos: [] })
        return store.dispatch(Act.importDatasets()).then(() => {
            expect(store.getActions()).toEqual(expectedActions);
        })
    })
})