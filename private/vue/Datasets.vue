<template>
  <div :class="{ squeezedContainer:selectedDataset!=null||uploadProcess!=0, }"
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

        <span class="card col-sm-4 adding-panel">
          <a-button type="dashed" class="adding-btn" @click="()=> {startUploading()}">
            <a-icon type="plus" class="adding-icon"
          /></a-button>
        </span>

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



    <!-- project creation page 1 -->
    <transition>
      <div v-if="uploadProcess==1"
           class="making making1">
        <span
          class="unselectProject"
          @click="()=> {unselectProject()}">
          <a-icon type="close" />
        </span>
        <div class="making1-wrapper">
          <span class="making-title">Upload Data</span>
          <span class="making1-desc">
            Upload a shapefile* to create a new data layer. The shapefile should include numerical attribute data that you’d like to visualize. After you upload the file, you will be prompted to provide a name, location and description of your layer and to select a data attribute for your layer to represent. Each layer can represent one attribute.
          </span>
          <span class="making1-desc">
            Upload a shapefile* to create a new data layer. The shapefile should include numerical attribute data that you’d like to visualize. After you upload the file, you will be prompted to provide a name, location and description of your layer and to select a data attribute for your layer to represent. Each layer can represent one attribute.
          </span>


          <a-button type="primary" @click="() => {unselectProject(2)}">Upload Data</a-button>
        </div>
      </div>
    </transition>


    <!-- file upload page 2 -->
    <transition>
      <div v-if="uploadProcess==2"
           class="making making1">
        <span
          class="unselectProject"
          @click="()=> {unselectProject()}">
          <a-icon type="close" />
        </span>


        <div class="making-wrapper">
          <template v-if="!submitting">
            <a-form @submit="handleSubmit">

              <a-form-item
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 12 }"
                :field-decorator-options="{rules: [{ required: true, message: 'Please input your dataset name!' }]}"
                label="Dataset Name"
                field-decorator-id="name"
              >
                <a-input v-model="formName"/>
              </a-form-item>

              <a-form-item
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 12 }"
                :field-decorator-options="{rules: [{ required: true, message: 'Please input your dataset description!' }]}"
                label="Description"
                field-decorator-id="desc"
              >
                <a-textarea v-model="formDesc" :rows="2" placeholder="Data Description"/>
              </a-form-item>

              <a-form-item
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 12 }"
                label="Keywords"

              >
                <template>
                  <div>
                    <template v-for="(tag, index) in tags">
                      <a-tooltip v-if="tag.length > 20" :key="tag" :title="tag">
                        <a-tag :key="tag" :closable="true" @afterClose="() => handleCloseTag(tag)">
                          {{ `${tag.slice(0, 20)}...` }}
                        </a-tag>
                      </a-tooltip>
                      <a-tag v-else :key="tag" :closable="true" @afterClose="() => handleCloseTag(tag)">
                        {{ tag }}
                      </a-tag>
                    </template>
                    <a-input
                      v-if="inputVisible"
                      ref="input"
                      :style="{ width: '78px' }"
                      :value="inputValue"
                      type="text"
                      size="small"
                      @change="handleInputChange"
                      @blur="handleInputConfirm"
                      @keyup.enter="handleInputConfirm"
                    />
                    <a-tag v-else style="background: #fff; borderStyle: dashed;" @click="showInput">
                      <a-icon type="plus" /> New Tag
                    </a-tag>
                  </div>
                </template>
              </a-form-item>

              <a-form-item
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 12 }"
                label="Publicity"
                field-decorator-id="public"
              >
                <a-switch v-model="formPublicity" checked-children="Public" un-checked-children="Private"/>
              </a-form-item>

              <a-form-item
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 12 }"
                label="Dataset"
                field-decorator-id="zipfile"

              >
                <div class="dropbox">

                  <a-upload-dragger 
                    :file="file"
                    :before-upload="beforeUpload"
                    name="file"
                    action=""
                    items=""
                    @change="handleFileUpload()"
                    @remove="handleRemove"
                  >
                    <p class="ant-upload-drag-icon">
                      <a-icon type="inbox" />
                    </p>
                    <p class="ant-upload-text">Click or drag file to this area to upload</p>
                    <p class="ant-upload-hint">*Currently, Painting with Data supports polygon shapefiles only. Shapefiles must be compressed in a ZIP file. The ZIP file should include these files:.dbf file, .prj file, .shp file, .shx files. Do not include /shd.xml file in the ZIP.</p>
                  </a-upload-dragger>

                </div>
              </a-form-item>
              
              <a-form-item
                :wrapper-col="{ span: 12, offset: 5 }"
              >
                <a-button v-if="file && formName!=null && formName!='' && !submitting" type="danger" html-type="submit">
                  Submit
                </a-button>
              </a-form-item>

            </a-form>
          </template>

          <template v-if="submitting">
            <a-icon type="loading" class="loading"/>
          </template>


        </div>



      </div>
    </transition>





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
      uploadProcess: 0,
      formName: '',
      formDesc: '',
      submitting: false,
      file: null,
      formPublicity: false,
      tags: [],
      inputVisible: false,
      inputValue: '',
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
    handleCloseTag(removedTag) {
      const tags = this.tags.filter(tag => tag !== removedTag)
      console.log(tags)
      this.tags = tags
    },
    showInput() {
      this.inputVisible = true
      this.$nextTick(function() {
        this.$refs.input.focus()
      })
    },

    handleInputChange(e) {
      this.inputValue = e.target.value
    },

    handleInputConfirm() {
      const inputValue = this.inputValue
      let tags = this.tags
      if (inputValue && tags.indexOf(inputValue) === -1) {
        tags = [...tags, inputValue]
      }
      console.log(tags)
      Object.assign(this, {
        tags,
        inputVisible: false,
        inputValue: '',
      })
    },

    handleRemove(file) {
      this.file = null
    },
    beforeUpload(file) {
      this.file = file
      return false
    },

    handleFileUpload() {
      // this.file = this.$refs.file.files[0];
      console.log('selected file')
    },

    handleSubmit(e) {
      e.preventDefault()
      this.submitting = true

      const { file } = this
      console.log('file', file)
      console.log('dataset_name', this.formName)
      console.log('dataset_desc', this.formDesc)
      console.log('dataset_public', this.formPublicity)
      console.log('tags', this.tags)

      let formData = new FormData()
      formData.append('file', file)

      /*
        Additional POST Data
      */
      formData.append('dataset_name', this.formName)
      formData.append('dataset_desc', this.formDesc)
      formData.append('dataset_public', this.formPublicity)
      formData.append('dataset_tags', this.tags)

      console.log('formData', formData)

      // TODO: call api to upload data
      // this.$http.post('/DATASET_UPLOAD_ROUTER', formData).then(response => {
      //   console.log('submitted', req, response)
      //   document.location.reload()
      // })
    },

    startUploading() {
      console.log('upload data')
      this.uploadProcess = 1
    },

    unselectProject(num) {
      this.uploadProcess = num ? num : 0
      this.submitting = false
    },

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

  height: 269.5px;
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

.adding-icon {
  left: 50%;
  position: absolute;
  top: 50%;
  border-radius: 0px;
  transform: scale(3) translate(-50%, -50%);
  transform-origin: 0% 0%;
  padding: 15px;
  opacity: 0.4;
}

.adding-icon:hover {
  opacity: 1 !important;
  cursor: pointer;
}

.adding-btn {
  width: calc(100% - 20px);
  height: calc(100% - 20px);
  margin: 10px;
}

.making {
  position: absolute;
  left: 0px;
  top: 0px;
  bottom: 0px;
  right: 0px;
  background-color: white;
  z-index: 1000;
}

.unselectProject {
  z-index: 1000;
  position: absolute;
  right: 10px;
  top: 90px;
  transform: scale(2);
  cursor: pointer;
}

.unselectProject:hover {
  opacity: 0.6;
}

.making-wrapper {
  position: absolute;
  top: 80px;
  left: 0px;
  right: 0px;
  bottom: 100px;
  padding: 50px;
}

.making1-wrapper {
  padding: 20px;
  width: 70%;
  height: 70%;
  min-width: 300px;
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
}

.making-title {
  text-align: center;
  font-size: 26px;
  display: inherit;
  font-weight: 500;
  margin-bottom: 0px;
}

.loading {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: scale(3) translate(-50%, -50%);
  transform-origin: 0% 0%;
}

.ant-btn-danger {
  color: white;
  background-color: #e75332;
  border-color: #e75332;
}

.ant-btn-primary {
  position: absolute;
  background-color: #e75332;
  border-color: #e75332;
  left: 50%;
  bottom: 70px;
  transform: translate(-50%);
}

.ant-upload-drag-icon .anticon {
  color: #e75332 !important;
}
</style>

<style>
@import '~leaflet/dist/leaflet.css';
</style>
