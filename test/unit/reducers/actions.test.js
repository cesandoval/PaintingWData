import * as Act from '../../../private/jsx/store/actions'
import store from '../../../private/jsx/store/store'
import * as t from '../../../private/jsx/store/types'
import update from 'immutability-helper'

/**
 * The following unit tests are to check if the action matches with the type.
 * E.g.: the action "importDatasets" corresponds to "t.IMPORT_DATASETS".
 */

beforeEach(() => {
    store.dispatch = jest.fn().mockImplementation(payload => payload);
})

describe("reducer actions", () => {
    let addPayload = {
        "type": "NODE_ADD",
        "nodeKey": "1cgfa87pjt",
        "node": {
          "name": "Asthma_ED_Visit_4",
          "type": "DATASET",
          "options": {},
          "filter": {
            "max": 104096,
            "min": 0,
            "maxVal": 104096,
            "minVal": 0
          },
          "position": {
            "x": 50,
            "y": 100
          },
          "color": "#bcbd22",
          "opacity": 0.5,
          "visibility": true,
          "translate": {
            "x": 50,
            "y": 100
          },
          "nodeKey": "1cgfa87pjt"
        }
      }

    // importUserfile
    it("should importUserfile", () => {
        const payload = {}
        const expectedAction = { 
            type: t.IMPORT_USERFILE, 
            ...payload 
        }
        expect(Act.importUserfile(payload)).toEqual(expectedAction);
    })
    // TODO: importDatasets (error: d3)
    it("should create an action to add a dataset", () => {
        const payload = {}
        const expectedAction = { 
            type: t.IMPORT_DATASETS, 
            ...payload 
        }
        expect(Act.importDatasets(payload)).toEqual(expectedAction);
    })
    
    // loadTableData
    it("should create an action to load table data", () => {
        const payload = {value:{'asthma NY DBF_Population': 22990, 'asthma NY DBF_Rate': 29.600000381469727}}
        const expectedAction = { 
            type: t.LOAD_TABLE_DATA, 
            ...payload 
        }
        expect(Act.loadTableData(payload)).toEqual(expectedAction);
    })
    // TODO: mapInit (error: cannot read property "buildmapbox" of undefined)
    it("should mapInit", () => {
        window.PaintGraph = jest.fn(() => new Promise(resolve => resolve()));
        const payload = {}
        const expectedAction = { 
            type: t.MAP_INIT, 
            ...payload 
        }
        expect(Act.mapInit(payload)).toEqual(expectedAction);
    })
    // mapSetBgStyle
    it("should mapSetBgStyle", () => {
        const payload = {}
        const expectedAction = { 
            type: t.MAP_SET_BGSTYLE, 
            ...payload 
        }
        
        expect(Act.mapSetBgStyle(payload)).toEqual(expectedAction);
    })
    // mapSetOpacity
    it("should mapSetOpacity", () => {
        const payload = {}
        const expectedAction = { 
            type: t.MAP_SET_OPACITY, 
            ...payload 
        }
        
        expect(Act.mapSetOpacity(payload)).toEqual(expectedAction);
    })
    // mapSetKNN
    it("should mapSetKNN", () => {
        const payload = {}
        const expectedAction = { 
            type: t.MAP_SET_KNN, 
            ...payload 
        }
        expect(Act.mapSetKNN(payload)).toEqual(expectedAction);
    })
    // nodeAdd
    it("should nodeAdd", () => {
        const payload = {nodeKey: "1cgfa87pjt"}
        const expectedAction = { 
            type: t.NODE_ADD, 
            ...payload 
        }
        
        expect(Act.nodeAdd(payload)).toEqual(expectedAction);
    })
    // nodeRemove
    it("should nodeRemove", () => {
        Act.nodeAdd(addPayload)
        // global.state = initialState
        const payload = {nodeKey: "1cgfa87pjt"}
        const expectedAction = { 
            type: t.NODE_REMOVE, 
            ...payload 
        }
        expect(Act.nodeRemove(payload)).toEqual(expectedAction);
    })
    // TODO: nodeUpdate (error: line 97)
    it("should nodeUpdate", () => {
        const payload = {}
        const expectedAction = { 
            type: t.NODE_UPDATE, 
            ...payload 
        }
        
        expect(Act.nodeUpdate(payload)).toEqual(expectedAction);
    })
    // TODO: nodeOptionUpdate (line 113)
    it("should nodeOptionUpdate", () => {
        const payload = {}
        const expectedAction = { 
            type: t.NODE_OPTION_UPDATE, 
            ...payload 
        }
        
        expect(Act.nodeOptionUpdate(payload)).toEqual(expectedAction);
    })
    // nodeOutput
    it("should nodeOutput", () => {
        const payload = {}
        const expectedAction = { 
            type: t.NODE_OUTPUT, 
            ...payload 
        }
        
        expect(Act.nodeOutput(payload)).toEqual(expectedAction);
    })
    // linkAdd
    it("should linkAdd", () => {
        const payload = {}
        const expectedAction = { 
            type: t.LINK_ADD, 
            ...payload 
        }
        
        expect(Act.linkAdd(payload)).toEqual(expectedAction);
    })
    // linkRemove
    it("should linkRemove", () => {
        const payload = {}
        const expectedAction = { 
            type: t.LINK_REMOVE, 
            ...payload 
        }
        
        expect(Act.linkRemove(payload)).toEqual(expectedAction);
    })
    // TODO: setActiveNode (error: line 188, links)
    it("should setActiveNode", () => {
        const payload = {}
        const expectedAction = { 
            type: t.SET_ACTIVENODE, 
            ...payload 
        }
        
        expect(Act.setActiveNode(payload)).toEqual(expectedAction);
    })
    // setLoading
    it("should setLoading", () => {
        const payload = {}
        const expectedAction = { 
            type: t.SET_LOADING, 
            ...payload 
        }
        
        expect(Act.setLoading(payload)).toEqual(expectedAction);
    })
    // setPanelShow
    it("should setPanelShow", () => {
        const payload = {}
        const expectedAction = { 
            type: t.SET_PANELSHOW, 
            ...payload 
        }
        
        expect(Act.setPanelShow(payload)).toEqual(expectedAction);
    })
    // setRefreshVoxels
    it("should setRefreshVoxels", () => {
        const payload = {}
        const expectedAction = { 
            type: t.SET_REFRESHVOXELS, 
            ...payload 
        }
        
        expect(Act.setRefreshVoxels(payload)).toEqual(expectedAction);
    })
    // saveUserFile
    it("should saveUserFile", () => {
        // Create a mock function for fetch
        global.fetch = jest.fn(() => new Promise(resolve => resolve()));

        const payload = {}
        const expectedAction = { 
            type: t.SAVE_USERFILE, 
            ...payload 
        }
        
        expect(Act.saveUserFile(payload)).toEqual(expectedAction);
    })
})