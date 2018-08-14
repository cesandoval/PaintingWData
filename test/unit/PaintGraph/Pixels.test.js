//import input from './test-files/parseDataJSON-input-3.js'
//import output from './test-files/parseDataJSON-output-3.js'

describe('pixels.js', () => {
    // The code below is commented out UNTIL we fix the "global project" variable issue, which this relies on.
    /*
  it('should parse a geoJSON to build pixels', () => { 
    const datavoxelId = 3
    const dataJSON = input;
    console.log(dataJSON);
    const parsedGeoJSON = Pixels.parseDataJSON(dataJSON)
    const expected = output
    expect(parsedGeoJSON).to.deep.equal(expected);
  });
  */
    it('should compare an addition', () => {
        // console.log(Pixels.parseDataJSON({}), 8383838338383)
        const parsedGeoJSON = 1 + 1

        expect(parsedGeoJSON).toEqual(2)
    })
})
