import * as Act from '../../private/jsx/store/actions'
import * as t from '../../private/jsx/store/types'

describe("reducer actions", () => {
    it("should create an action to add a dataset", () => {
        const payload = {}
        const expectedAction = { 
            type: t.IMPORT_DATASETS, 
            ...payload 
        }
        
        expect(Act.importDatasets(payload)).toEqual(expectedAction);

    })

    it("should create an action to load table data", () => {
        const payload = {value:{'asthma NY DBF_Population': 22990, 'asthma NY DBF_Rate': 29.600000381469727}}
        const expectedAction = { 
            type: t.LOAD_TABLE_DATA, 
            ...payload 
        }
        console.log(Act.loadTableData(payload))
        
        expect(Act.loadTableData(payload)).toEqual(expectedAction);

    })
})