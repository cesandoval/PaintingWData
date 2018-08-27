<template>
  <div :class="{ squeezedContainer:selectedDataset!=null, }"
       class = "mainContainer"
  >
    <div class = "page-title-section">
      <h1 class = "page-title">Datasets</h1>

      <div v-if="datafiles.length>0"
           class = "sorting-switches"
      >
        <span class = "switch">Sort By</span>
        <a-switch v-model="sortDate" checked-children="date" un-checked-children="name" 
                  size="small" class = "switch"/>
        <a-switch v-model="sortDown" 
                  size="small" class = "switch">
          <a-icon slot="checkedChildren" type="arrow-down"/>
          <a-icon slot="unCheckedChildren" type="arrow-up"/>
        </a-switch>
      </div>

    </div>


    <div v-if="datafiles.length===0"
         class = "no-data"
    >
      No Data Uploaded.
    </div>
    


    <transition>
      <div 
        :class="{ squeezeddatasetlist: isSqueezed, }"
        class = "dataset-list">
        <span
          v-for="(datafile,index) in datafileList"
          v-if="datafile.deleted!==false&&datafile.Datalayers.length!=0"
          :key="datafile.id"
          :class="{selected:datafile.id===selectedDataset}"
          class="card col-sm-4"
          @click="()=> {setActiveDatasetId(datafile.id,index)}"
        >
          <a-card
            hoverable
          >

            <div class="map-thumbnail">

              <l-map :zoom="zoom" :center="getMapCenter(datafile)" :bounds="getBbox(datafile)">
                <l-tile-layer :url="url" :attribution="attribution"/>
                <l-polygon :lat-lngs="getBbox(datafile)" :weight="2" color="black" fill-color="rgb(255,255,255)"/>
              </l-map>
            </div>
            <a-card-meta
              :title="datafile.filename"
              :description="parseTime(datafile.createdAt)"/>
              
          </a-card>
        </span>
      </div>
    </transition>

    
    <div 
      v-if="isSqueezed"
      class = "dataset-info">
      <span
        class="unsqueeze"
        @click="()=> {unSqueezeTiles()}">
        <a-icon type="close" />
      </span>
       

      <div class = "datainfo-content">

        <div class = "col-sm-6 left-col">
          <a-dropdown class = "actions">
            <a-menu slot="overlay" @click="handleDeleteClick(selectedDataset)">
              <a-menu-item key="1" >Delete Dataset</a-menu-item>
            </a-menu>
            <a-button>
              Actions <a-icon type="down" />
            </a-button>
          </a-dropdown>

          <div class = "info-cover-wrapper">
            <a-icon v-if="selectedGeometries==null" 
                    type="loading"
                    class = "map-loading"/>
            <div class="map-thumbnail-preview">
              <l-map v-if="selectedGeometries!=null" 
                     :zoom="zoom" 
                     :center="getMapCenter(datafileList[selectedIndex])"
                     :bounds="getBbox(datafileList[selectedIndex])">
                <l-tile-layer :url="url" :attribution="attribution"/>

                <!-- polygons -->
                <template v-if="selectedGeoType=='Polygon'">
                  <l-polygon v-for="(geometry,index) in selectedGeometries"
                             :key="index"
                             :lat-lngs="geometry" :weight="1" color="black" 
                             fill-color="rgb(255,255,255)"/>
                </template>

                <template v-if="selectedGeoType=='Point'">
                  <l-marker v-for="(geometry,index) in selectedGeometries" :key="index"
                            :lat-lng="geometry"/>
                </template>


              </l-map>
            </div>
          </div>

          <div class = "info-text bottom-info">
            <div class = "info-title">File name:  
              <span class = "info-digits"
            >{{ datafileList[selectedIndex].filename.split(".")[0] }}</span></div>
            <div>Created at:  
              <span class = "info-time"
            >{{ parseTime(datafileList[selectedIndex].createdAt) }}</span></div>
            <br>
            <div>Last updated at:  
              <span class = "info-digits"
            >{{ parseTime(datafileList[selectedIndex].updatedAt) }}</span></div>
            <div>Latitude:  
              <span class = "info-digits"
            >{{ (datafileList[selectedIndex].centroid.coordinates[0].toFixed(2)) }}</span></div>
            <div>Longitude:  
              <span class = "info-digits"
            >{{ (datafileList[selectedIndex].centroid.coordinates[1].toFixed(2)) }}</span></div>
            <div>Type of Geometry:  
              <span class = "info-digits"
            >{{ datafileList[selectedIndex].geometryType }}</span></div>
          </div> 
        </div> 

        <div class = "col-sm-6 right-col">
          <div class = "info-text">
            <div><strong>Properties</strong></div>
            <template>
              <div 
                class="demo-infinite-container"
              >
                <a-list
                  :data-source="Object.keys(datafileList[selectedIndex].Datalayers[0].properties)"
                >
                  <a-list-item slot="renderItem" slot-scope="item, index">
                    <a-list-item-meta description="">
                      <a slot="title" :key="item">{{ item }}</a>
                      <a-button slot="avatar" shape="circle">{{ item.charAt(0).toUpperCase() }}</a-button>
                    </a-list-item-meta>
                    <div/>
                  </a-list-item>
                  <a-spin v-if="loading && !busy" class="demo-loading" />
                </a-list>
              </div>
            </template>

          </div> 
        </div> 






      </div>
      

      
    </div>
  </div>


</template>

<script>
import DatasetCard from '@/components/DatasetCard'
import Vue2Leaflet from 'vue2-leaflet'
import L from 'leaflet'

let { LMap, LTileLayer, LPolygon, LMarker } = Vue2Leaflet

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})

export default {
  name: 'Datasets',

  components: {
    DatasetCard,
    LMap,
    LTileLayer,
    LPolygon,
    LMarker,
  },

  data() {
    return Object.assign(server, {
      maps: {},
      isSqueezed: false,
      selectedDataset: null,
      selectedIndex: null,
      loading: false,
      busy: false,
      sortDate: true,
      sortDown: true,
      zoom: 13,
      url:
        'https://api.tiles.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWJvdWNoYXVkIiwiYSI6ImNpdTA5bWw1azAyZDIyeXBqOWkxOGJ1dnkifQ.qha33VjEDTqcHQbibgHw3w',

      attribution: '',
      selectedGeometries: null,
      selectedGeoType: null,
    })
  },
  computed: {
    datafileList() {
      if (this.sortDate) {
        if (this.sortDown) {
          return _.sortBy(this.datafiles, [
            function(o) {
              return o.createdAt
            },
          ]).reverse()
        } else {
          return _.sortBy(this.datafiles, [
            function(o) {
              return o.createdAt
            },
          ])
        }
      } else {
        if (this.sortDown) {
          return _.sortBy(this.datafiles, [
            function(o) {
              return o.filename[0]
            },
          ])
        } else {
          return _.sortBy(this.datafiles, [
            function(o) {
              return o.filename[0]
            },
          ]).reverse()
        }
      }
    },
  },
  created() {
    // console.log('created')
    // this.$http.get('/getThumbnailData/29').then(response => {
    //   console.log(response)
    // })
  },
  methods: {
    getBbox(datafile) {
      return datafile.bbox.coordinates[0].map(data => [data[1], data[0]])
    },
    getMapCenter(datafile) {
      return L.latLng(
        datafile.centroid.coordinates[1],
        datafile.centroid.coordinates[0]
      )
    },
    setActiveDatasetId(id, index) {
      console.log('click ' + id)
      // squeeze tile display
      this.squeezeTiles()
      this.selectedDataset = id
      this.selectedIndex = index
      this.selectedGeoType = this.datafileList[index].geometryType

      console.log(this.datafileList[index])

      this.queryMapGeometry(this.selectedDataset)

      // highlight selected tile

      // display dataset info on the right side
    },

    queryMapGeometry(datasetId) {
      this.$http.get('/getThumbnailData/' + datasetId).then(response => {
        if (this.selectedGeoType == 'Polygon')
          this.selectedGeometries = response.data.geoJSON.map(obj =>
            obj.coordinates[0].map(item => [item[1], item[0]])
          )
        else if (this.selectedGeoType == 'Point') {
          this.selectedGeometries = response.data.geoJSON.map(obj => [
            obj.coordinates[1],
            obj.coordinates[0],
          ])
        } else {
          //TODO: Load map of other type of data
        }
      })
    },

    parseTime(timeStr) {
      let timeLst = timeStr.split('T')
      let date = timeLst[0]
      let time = timeLst[1].split('.')[0]
      return date + ' ' + time
    },
    squeezeTiles() {
      this.isSqueezed = true
    },
    unSqueezeTiles() {
      this.isSqueezed = false
      this.selectedDataset = null
      this.selectedIndex = null
      this.selectedGeometries = null
      this.selectedGeoType = null
    },
    parseCoord(coord) {
      return coord[0].toFixed(2) + ', ' + coord[1].toFixed(2)
    },
    handleDeleteClick(datasetId) {
      let req = { userId: this.id, datafileId: datasetId }

      this.$http.post('/delete/dataset/', req).then(response => {
        console.log('deleted', req, response)
        if (response.data.success) {
          // deletion in the UI
          this.unSqueezeTiles()
          this.datafiles = this.datafiles.filter(item => item.id != datasetId)
        } else {
          // TODO: handle delete fail
        }
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.map-thumbnail {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.1);
  height: 200px;

  margin-bottom: 10px;
}

.map-thumbnail-preview {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.1);
  height: 100%;
  margin-bottom: 10px;
}

.page-title-section {
  margin-top: 80px;
}

.actions {
  position: absolute;
  left: 25px;
  top: 4px;
  border: none;
  padding: 0px;
}

.ant-switch-checked {
  background-color: rgba(0, 0, 0, 0.4);
}

.ant-switch {
  background-color: rgba(0, 0, 0, 0.4);
}

.sorting-switches {
  display: inline-block;
  float: right;

  margin-top: 30px;
}

.no-data {
  position: absolute;
  text-align: center;
  font-size: 20px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.page-title {
  margin: 20px;
  margin-left: 0px;
  display: inline-block;
}

.switch {
  float: left;
  margin-left: 12px;

  font-size: 12px;
}

.card {
  padding: 0px !important;
}

.dataset-list {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  float: left;
}

.left-col {
  height: 100%;
}

.dataset-info {
  position: absolute;
  width: 100%;
  left: 0px;
  top: 0px;
  bottom: 0px;
  right: 0px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 4px 4px 6px 0px rgba(0, 0, 0, 0.1);
  background-color: rgb(255, 255, 255);

  padding-top: 80px;

  z-index: 1000;
}
.datainfo-content {
  height: 70%;
  position: absolute;
  width: 90%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.right-col {
  height: 100%;
  position: relative;
}

.squeezeddatasetlist {
  width: 60%;
}

.card {
  /deep/ {
    .ant-card-body {
      padding: 10px;
    }
    .ant-card-meta-title {
      font-size: 14px;
    }
    .ant-card-meta-description {
      font-size: 11px;
    }
  }
}

.unsqueeze {
  cursor: pointer;
  position: absolute;
  top: 90px;
  right: 10px;
  transform: scale(2);

  z-index: 1001;
}

.unsqueeze:hover {
  opacity: 0.6;
}

.selected {
  background: rgba(231, 83, 50, 0.8);

  /deep/ {
    .ant-card {
      transform: scale(0.95);
    }
  }
}

.info-cover-wrapper {
  width: 100%;
  padding: 10px;
  margin-top: 30px;
  position: relative;
  height: 50%;
}

.squeezedContainer {
  height: 0px;
  min-height: 0px !important;
}

.info-cover {
  width: 100%;
}

.bottom-info {
  position: absolute;
  bottom: 0px;
  height: auto !important;
  width: 100%;
}

.info-text {
  padding: 10px;
  height: 100%;

  /deep/ {
    .info-title {
      font-weight: 700;
      font-size: 15px;
      text-overflow: ellipsis;
    }

    .info-time {
      font-size: 13px;
      color: rgba(0, 0, 0, 0.45);
    }

    .info-digits {
      color: rgba(0, 0, 0, 0.45);
    }
  }
}

.demo-infinite-container {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: auto;
  padding: 8px 24px;
  // height: 300px;
}
.demo-loading {
  position: absolute;
  bottom: 40px;
  width: 100%;
  text-align: center;
}

.ant-list-item {
  /deep/ {
    .ant-list-item-meta-content {
      padding-top: 5px;
    }
  }
}
.mainContainer {
  min-height: calc(100vh - 130px);
}

.demo-infinite-container {
  margin-top: 10px;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.01);
  /deep/ {
    .ant-spin-container {
      overflow-y: auto;
    }
  }
}

.map-loading {
  position: absolute;
  z-index: 100;
  left: 50%;
  top: 50%;
  transform: scale(2) translate(-50%, -50%);
  transform-origin: 0% 0%;
}
</style>

<style>
@import '~leaflet/dist/leaflet.css';
</style>
