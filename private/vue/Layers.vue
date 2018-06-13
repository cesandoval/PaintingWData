<template lang="pug">
  .container
    .container(style = "margin-top: 10px; margin-left: 0; width: 100vw;").spacing-large
      .row.spacing
        .col-md-9
          h1 Layers

      //- if (layerAlert)
      template(v-if="layerAlert")
        .alert.alert-danger(role='alert') {{layerAlert}}

      .row
        .col-md-6
          h4.spacing This is your library of layers. Select layers below that you would like to add to a voxel project.
          p To compute a voxel first select the set of layers you want to combine. To select a layer click on it once, to deselect click it again.


      .row
        .col-md-6.spacing
          //- if datafiles.length == 0
          template(v-if="datafiles.length == 0")
            p.spacing-large(role='alert' style = "margin-top:20px" ) No layers found  &nbsp;
            <br>
            div
              a(href = "/upload")
                .btn.btn.btn-outline-primary Upload a layer
          //- if datafiles.length != 0
          template(v-if="datafiles.length != 0")
            div
              a(href = "/upload")
                .btn.btn.btn-outline-primary Upload a layer

    .container
      .row
      //- for datafile in datafiles
        //- if datafile.Datalayers[0]
      template(v-for="datafile in datafiles", v-if="datafile.Datalayers[0]")
          .col-sm-6.col-md-4
            .thumbnail.datalayer(selected = "false", style="z-index: 1;")
              .caption
                div(style="height: 3px; width: 70%; margin-left: 15%; display: block; padding-bottom: 20px;")
              div(:id="`map_${datafile.id}`", class = "leafletMap", style="width: 90%; height: 300px; margin:0 auto;")
              .caption(style="padding-left: 5%;")
                  .layername
                    h3(style="font-weight: 700;") {{datafile.Datalayers[0].userLayerName}}
                    br
                    label.layer-label Layer Name
                    p(display='inline').label-body {{datafile.Datalayers[0].layername}}
                  .userlayername
                    label.layer-label User Layer Name
                    p(display='inline').label-body {{datafile.Datalayers[0].userLayerName}}
                  .property
                    label.layer-label Data Property
                    p.label-body {{datafile.Datalayers[0].rasterProperty}}
                  //- if datafile.Datalayers[0].location.length > 0
                  template(v-if="datafile.Datalayers[0].location.length > 0")
                    .location
                      label.layer-label Layer Location
                      p.label-body {{datafile.Datalayers[0].location}}

              p.label-body.text-center
                a.modal-button.btn(id="modal-toggle", data-toggle="modal", :data-target="`#mapView_${datafile.id}`", :data-map-id="datafile.id") View Layer

          div.modal.fade.bs-example-modal-lg(:id="`mapView_${datafile.id}`" tabindex="-1" role="dialog" data-backdrop="false" data-container="body" aria-labelledby="gridSystemModalLabel", style="z-index: 10000;" @show.bs.modal="showBSModal" @hidden.bs.modal="hiddenBSModal")
            div.modal-dialog.modal-lg(role="document")
              div.modal-content(style="z-index: 10000!important;")
                div.modal-header
                  button(type="button", class="close", data-dismiss="modal", :data-map-id="datafile.id", aria-label="Close")
                    span(aria-hidden="true") &times;
                  .row.spacing
                    h1.center {{datafile.Datalayers[0].userLayerName}}
                div.modal-body
                  .row
                    .col-md-6
                      //- script.
                        //- var id = {{datafile.id};}
                        //- var size = #{size};
                      div(:id="`map_thumbnail_${datafile.id}`", style="width: 400px; height: 400px; margin:0 auto;").spacing
                    .col-md-6
                      label.layer-label Layer Name
                        p(display='inline').label-body {{datafile.Datalayers[0].layername}}
                      .property
                        label.layer-label EPSG Code
                          p.label-body {{datafile.Datalayers[0].epsg}}
                      //- if datafile.Datalayers[0].description.length > 0
                      template(v-if="datafile.Datalayers[0].description.length > 0")
                        .description
                          label.layer-label Layer Description
                          p.label-body {{datafile.Datalayers[0].description}}
                      label.layer-label Uploaded On
                        p.label-body {{new Date(datafile.Datalayers[0].createdAt).toUTCString()}}


    //- if datafiles.length != 0
    template(v-if="datafiles.length != 0")
      .container.spacing-large
        .row
          .col-md-6
            .row
                h1.spacing-large Compute a Voxel
            .row
              form(method='post', action='/layers')
                input.pull-right.form-control.form-input-line(type='text', name= 'voxelname', placeholder='Project name...')
                input.form-control.hidden(style="width: 100%", name = "datalayerIds" ,id="selectedLayers", type='hidden')
                <br>
                .row.spacing
                  .col-md-3
                    p.sans(style="font-size: 11pt; display: inline; vertical-align: middle; line-height: 20px; padding-right: 10px;") Density
                  .col-md-9
                    p.sans(style="font-size: 11pt; display: inline; vertical-align: middle; line-height: 20px; padding-right: 10px;")   10000 
                    input.slider(style="display: inline-block; vertical-align: middle;" data-slider-handle="round", name='voxelDensity', data-slider-min='10000', data-slider-max='60000', data-slider-value='40000')
                    p.sans(style="font-size: 11pt; display: inline; vertical-align: middle; line-height: 20px; padding-left: 10px;")     60000 
                <br>

                .row.spacing
                  .col-md-3
                    .input-group-btn
                      button.btn.btn-outline-primary(type='submit', name="layerButton", value="compute") Compute
                  .col-md-3
                    .input-group-btn.text-center
                      button.btn.btn-outline-primary(type='submit', name="layerButton", value="delete", formaction="/layers") Delete Layer
    
    div.spacing-large
  
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
      map = L.map(id).setView(centroid, 11)
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
      if (maps['map_thumbnail_' + this.currId] != null) {
        console.log('Removing map' + 'map_thumbnail_' + this.currId)
        maps['map_thumbnail_' + this.currId].remove()
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

      maps[mapIndex] = this.embedMap(mapIndex, centroid.coordinates.reverse())

      bBoxCoords = []
      bBox.coordinates[0].forEach(function(feature, i) {
        bBoxCoords.push(feature.reverse())
      })

      maps[mapIndex].fitBounds(bBoxCoords)

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
      }).addTo(maps[mapIndex])
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