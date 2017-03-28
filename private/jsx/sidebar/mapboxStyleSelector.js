import React from 'react';
import * as act from '../store/actions';
import { connect } from 'react-redux';

class MapboxStyleSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = { mapboxStyle: 'mapbox.light' }; // default mapbox.light

    this.changeStytle = this.changeStytle.bind(this);
  }

  changeStytle(e) {
    this.setState({ mapboxStyle: e.target.value });

    window.mapboxStyle = e.target.value;
    updateTiles()
  }

  render() {
    return ( < div className = "opacity-slider" >
      < div className = "row text-center" >
      < p className = "slider-name" > Map Stytle < /p> < /div > < div className = "row text-center" >
      < select value = { this.state.mapboxStyle }
      onChange = { this.changeStytle } >
      < option value = "mapbox.streets" > Streets < /option> < option value = "mapbox.light" > Light < /option > < option value = "mapbox.dark" > Dark < /option> < option value = "mapbox.satellite" > Satellite < /option > < option value = "mapbox.streets-satellite" > Streets - Satellite < /option> < option value = "mapbox.wheatpaste" > Wheatpaste < /option > < option value = "mapbox.streets-basic" > Streets - Basic < /option> < option value = "mapbox.comic" > Comic < /option > < option value = "mapbox.outdoors" > Outdoors < /option> < option value = "mapbox.run-bike-hike" > Run - Bike - Hike < /option > < option value = "mapbox.pencil" > Pencil < /option> < option value = "mapbox.pirates" > Pirates < /option > < option value = "mapbox.emerald" > Emerald < /option> < option value = "mapbox.high-contrast" > High - Contrast < /option > < /select>

      < /div> < /div >
    );
  }
}

export default connect(s => ({ map: s.map, geometries: s.map.geometries }))(MapboxStyleSelector);
