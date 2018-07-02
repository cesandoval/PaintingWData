/*global project*/
import Pixels from '../../private/jsx/pixels'
import axios from 'axios'
import input from './test-files/parseDataJSON-input-3.js'
import output from './test-files/parseDataJSON-output-3.js'

describe('pixels.js', () => {
  it('should parse a geoJSON to build pixels', () => { 
    const datavoxelId = 3
    const dataJSON = input;
    console.log(dataJSON);
    const parsedGeoJSON = Pixels.parseDataJSON(dataJSON)
    const expected = output
    expect(parsedGeoJSON).to.deep.equal(expected);
  });

  it('should compare an addition', () => {
    // console.log(Pixels.parseDataJSON({}), 8383838338383)
    const parsedGeoJSON = 1+1
    
    expect(parsedGeoJSON).to.equal(2);
  });
});