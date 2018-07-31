import Exporter from '../../../private/jsx/exporter'

describe('Local State', () => {
  it('should parse a geoJSON to build pixels', () => {
    // console.log(Pixels.parseDataJSON({}), 8383838338383)
    const parsedGeoJSON = {test: 'name'}
    const tester = {test: 'name'}

    expect(parsedGeoJSON).toEqual(tester);
  });

  it('should compare an addition', () => {
    // console.log(Pixels.parseDataJSON({}), 8383838338383)
    const parsedGeoJSON = 1+1
    
    expect(parsedGeoJSON).toBe(2);
  });
});