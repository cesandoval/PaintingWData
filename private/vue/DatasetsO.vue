<template>
  <div class="container">
  <div style="margin-top: 10px; margin-left: 0; width: 100vw;" class="container spacing-large">
    <div class="row spacing">
      <div class="col-md-9">
        <h1>Layers</h1>
      </div>
    </div>
    <!-- if (layerAlert) -->
    <template v-if="layerAlert">
      <div role="alert" class="alert alert-danger">{{layerAlert}}</div>
    </template>
    <div class="row">
      <div class="col-md-6">
        <h4 class="spacing">This is your library of layers. Select layers below that you would like to add to a voxel project.</h4>
        <p>To compute a voxel first select the set of layers you want to combine. To select a layer click on it once, to deselect click it again.</p>
      </div>
    </div>
    <div class="row">
      <div class="col-md-6 spacing">
        <!-- //- if datafiles.length == 0 -->
        <template v-if="datafiles.length == 0">
          <p role="alert" style="margin-top:20px" class="spacing-large">No layers found  &nbsp;</p><br>
          <div><a href="/upload">
              <div class="btn btn btn-outline-primary">Upload a layer</div></a></div>
        </template>
        <!-- //- if datafiles.length != 0 -->
        <template v-if="datafiles.length != 0">
          <div><a href="/upload">
              <div class="btn btn btn-outline-primary">Upload a layer</div></a></div>
        </template>
      </div>
    </div>
  </div>
  <div class="container">
    <div class="row"></div>
    <!-- 
      //- for datafile in datafiles
       //- if datafile.Datalayers[0]
    -->
    <template v-for="datafile in datafiles" v-if="datafile.Datalayers[0]">
      <div class="col-sm-6 col-md-4">
        <div selected="false" style="z-index: 1;" class="thumbnail datalayer">
          <div class="caption">
            <div style="height: 3px; width: 70%; margin-left: 15%; display: block; padding-bottom: 20px;"></div>
          </div>
          <div :id="`map_${datafile.id}`" style="width: 90%; height: 300px; margin:0 auto;" class="leafletMap"></div>
          <div style="padding-left: 5%;" class="caption">
            <div class="layername">
              <h3 style="font-weight: 700;">{{datafile.Datalayers[0].userLayerName}}</h3><br/>
              <label class="layer-label">Layer Name</label>
              <p display="inline" class="label-body">{{datafile.Datalayers[0].layername}}</p>
            </div>
            <div class="userlayername">
              <label class="layer-label">User Layer Name</label>
              <p display="inline" class="label-body">{{datafile.Datalayers[0].userLayerName}}</p>
            </div>
            <div class="property">
              <label class="layer-label">Data Property</label>
              <p class="label-body">{{datafile.Datalayers[0].rasterProperty}}</p>
            </div>
            //- if datafile.Datalayers[0].location.length > 0
            <template v-if="datafile.Datalayers[0].location.length &gt; 0">
              <div class="location">
                <label class="layer-label">Layer Location</label>
                <p class="label-body">{{datafile.Datalayers[0].location}}</p>
              </div>
            </template>
          </div>
          <p class="label-body text-center"><a id="modal-toggle" data-toggle="modal" :data-target="`#mapView_${datafile.id}`" :data-map-id="datafile.id" class="modal-button btn">View Layer</a></p>
        </div>
      </div>
      <div :id="`mapView_${datafile.id}`" tabindex="-1" role="dialog" data-backdrop="false" data-container="body" aria-labelledby="gridSystemModalLabel" style="z-index: 10000;" @show.bs.modal="showBSModal" @hidden.bs.modal="hiddenBSModal" class="modal fade bs-example-modal-lg">
        <div role="document" class="modal-dialog modal-lg">
          <div style="z-index: 10000!important;" class="modal-content">
            <div class="modal-header">
              <button type="button" data-dismiss="modal" :data-map-id="datafile.id" aria-label="Close" class="close"><span aria-hidden="true">&times;</span></button>
              <div class="row spacing">
                <h1 class="center">{{datafile.Datalayers[0].userLayerName}}</h1>
              </div>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6">
                  <!--
                    //- script.
                      //- var id = {{datafile.id};}
                      //- var size = #{size};
                  -->
                  <div :id="`map_thumbnail_${datafile.id}`" style="width: 400px; height: 400px; margin:0 auto;" class="spacing"></div>
                </div>
                <div class="col-md-6">
                  <label class="layer-label">Layer Name
                    <p display="inline" class="label-body">{{datafile.Datalayers[0].layername}}</p>
                  </label>
                  <div class="property">
                    <label class="layer-label">EPSG Code
                      <p class="label-body">{{datafile.Datalayers[0].epsg}}</p>
                    </label>
                  </div>
                  <template v-if="datafile.Datalayers[0].description.length &gt; 0">
                    <div class="description">
                      <label class="layer-label">Layer Description</label>
                      <p class="label-body">{{datafile.Datalayers[0].description}}</p>
                    </div>
                  </template>
                  <label class="layer-label">Uploaded On
                    <p class="label-body">{{new Date(datafile.Datalayers[0].createdAt).toUTCString()}}</p>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
  <!-- //- if datafiles.length != 0 -->
  <template v-if="datafiles.length != 0">
    <div class="container spacing-large">
      <div class="row">
        <div class="col-md-6">
          <div class="row">
            <h1 class="spacing-large">Compute a Voxel</h1>
          </div>
          <div class="row">
            <form method="post" action="/layers">
              <input type="text" name="voxelname" placeholder="Project name..." class="pull-right form-control form-input-line"/>
              <input style="width: 100%" name="datalayerIds" id="selectedLayers" type="hidden" class="form-control hidden"/><br>
              <div class="row spacing">
                <div class="col-md-3">
                  <p style="font-size: 11pt; display: inline; vertical-align: middle; line-height: 20px; padding-right: 10px;" class="sans">Density</p>
                </div>
                <div class="col-md-9">
                  <p style="font-size: 11pt; display: inline; vertical-align: middle; line-height: 20px; padding-right: 10px;" class="sans">  10000 </p>
                  <input style="display: inline-block; vertical-align: middle;" data-slider-handle="round" name="voxelDensity" data-slider-min="10000" data-slider-max="60000" data-slider-value="40000" class="slider"/>
                  <p style="font-size: 11pt; display: inline; vertical-align: middle; line-height: 20px; padding-left: 10px;" class="sans">    60000 </p>
                </div>
              </div><br>
              <div class="row spacing">
                <div class="col-md-3">
                  <div class="input-group-btn">
                    <button type="submit" name="layerButton" value="compute" class="btn btn-outline-primary">Compute</button>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="input-group-btn text-center">
                    <button type="submit" name="layerButton" value="delete" formaction="/layers" class="btn btn-outline-primary">Delete Layer</button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </template>
  <div class="spacing-large"></div>
</div>
  
</template>

<script>


export default {
  name: 'layers',
  data() {
    return Object.assign(server, {
      currId: '',
      maps: {},
    })
  },
  created() {
    //- console.log('created')
  },
  methods: {
    requestMap(id, callback, size) {
      $.ajax({
        url: '/getMapData/' + id,
        type: 'GET',
        cache: false,
        processData: false,
        contentType: false,
        success: function(data) {
          console.log('===============')
          if (typeof data.error === 'undefined') {
            console.log('success')
            console.log(data.epsg)
            $map.removeClass('temporary_map_visuals')
            $map.empty()
            let bBox = JSON.parse(data.bBox)
            let geoJSON = JSON.stringify(data.geoJSON)
            this.renderFields(data.fields)
            this.renderEPSG(data.epsg)

            let centroid = JSON.stringify(data.centroid)
            callback(bBox, JSON.parse(geoJSON), JSON.parse(centroid), size)
          } else {
            console.log('ERRORS: ' + data.error)
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log('the errors happened here')
          console.log('ERRORS: ' + textStatus)
        },
      })
    },
    embedMap(id, centroid) {
      const map = L.map(id).setView(centroid, 11)
      L.tileLayer(
        'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYWJlbGJlenUiLCJhIjoiY2l6a2RyZjl6MDQ3aDJxbDR5YzVnZ2hqNCJ9.bcFsqoSDlmSmPc9mazBM5Q',
        {
          maxZoom: 18,
          attribution:
            'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
          id: 'mapbox.light',
        }
      ).addTo(map)
      return map
    },
    hiddenBSModal() {
      console.log('hiddenBSModal')
      if (this.maps['map_thumbnail_' + this.currId] != null) {
        console.log('Removing map' + 'map_thumbnail_' + this.currId)
        this.maps['map_thumbnail_' + this.currId].remove()
      }

      console.log('Removing map ' + this.currId)
      let $map = $('#map_thumbnail_' + this.currId)
      $map.empty()
    },
    showBSModal() {
      console.log('showBSModal')
      let mapId = $(e.relatedTarget).data('map-id')
      if ($(this).attr('id') == 'mapView_' + mapId) {
        console.log('Found element.')
      } else {
        console.log('Not right element ' + $(this).attr('id'))
        return
      }

      this.currId = mapId
      let $dropdown = $($('select')[0])
      let $epsg = $('#epsg')
      let $map = $('#map_thumbnail_' + this.currId)

      if ($map.hasClass('temporary_map_visuals'))
        console.log('Map already has subclasses.')
      else {
        console.log('Adding visuals to map.')
        $map.addClass('temporary_map_visuals')
        //$map.append('<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i><span class="sr-only">Loading...</span>');
      }

      $.ajax({
        url: '/getThumbnailData/' + this.currId,
        type: 'GET',
        cache: false,
        processData: false,
        contentType: false,
        success: function(data) {
          if (typeof data.error === 'undefined') {
            console.log('success')
            $map.removeClass('temporary_map_visuals')
            $map.empty()
            let bBox = data.bBox
            let geoJSON = JSON.stringify(data.geoJSON)

            let centroid = JSON.stringify(data.centroid)
            this.renderMap(bBox, JSON.parse(geoJSON), JSON.parse(centroid))
          } else {
            console.log('ERRORS: ' + data.error)
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log('the errors happened here')
          console.log('ERRORS: ' + textStatus)
        },
      })
    },
    renderMap(boundingBox, geoJSON, centroid) {
      var centroid = centroid
      var geoJSON = geoJSON
      let bBox = boundingBox
      let mapIndex = 'map_thumbnail_' + this.currId
      console.log('Current id is ' + mapIndex)

      this.maps[mapIndex] = this.embedMap(mapIndex, centroid.coordinates.reverse())

      bBoxCoords = []
      bBox.coordinates[0].forEach(function(feature, i) {
        bBoxCoords.push(feature.reverse())
      })

      this.maps[mapIndex].fitBounds(bBoxCoords)

      let myStyle = {
        color: 'white',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.65,
        // 'fillColor': '#ff7800'
        fillColor: '#D34031',
      }

      L.geoJson(geoJSON, {
        style: myStyle,
      }).addTo(this.maps[mapIndex])
    },
    renderEPSG(epsg) {
      $epsg.val(epsg)
    },
    renderFields(fields) {
      fields.forEach(function(field, index) {
        $dropdown.append('<option>' + field + '</option>')
      })
    },
  },
}

</script>

<style scoped>

.thumbnail {
  border-radius: 0px;
  border: 3px solid #ff5d44;
  /*border: none;*/
  
  opacity:0.9;
  transition: 1s ease;
}

.thumbnail:hover {
  opacity:1;
  transition: 1s ease;

  border: 3px solid #D34031;
}

.thumbnail .datalayer {
  padding: 0;
}

.thumbnail { 
  padding: 0;
}

.leaflet-touch .leaflet-control-layers, .leaflet-touch .leaflet-bar {
  border: none;
  border-radius: 0;
}

.leaflet-bar a:last-child, .leaflet-bar a:first-child {
  border-radius: 0;
  color: #D34031;
}

.leaflet-bar a:hover {
  background-color: #ff5d44;

  transition: 1s ease;
}

.leaflet-container .leaflet-control-attribution {
  background-color: transparent;
}

</style>