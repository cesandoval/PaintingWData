<template>
  <div 
    :class="{ squeezedContainer:selectedProject!=null||makingProcess!=0, }"
    class = "mainContainer"
  
  >
    <div class = "page-title-section">
      <h1 class = "page-title">Projects</h1>

      <div v-if="datavoxels.length>0"
           class="sorting-Switches"
      >
        <span class = "switch">Sort By</span>
        <a-switch v-model="sortDate" checked-children="date" un-checked-children="name" 
                  size="small"
                  class = "switch"/>
        <a-switch v-model="sortDown"
                  size="small"
                  class = "switch">
          <a-icon slot="checkedChildren" type="arrow-down"/>
          <a-icon slot="unCheckedChildren" type="arrow-up"/>
        </a-switch>
      </div>

    </div>

    <!-- <div v-if="datavoxels.length===0"
         class = "no-data"
    >
      No Project Created.
    </div> -->

    <!-- project thumbnail list -->
    <transition>
      <div 
        class = "dataset-list">

        <!-- adding project btn -->
        <!-- <span class="card col-sm-4 adding-panel">
          <a-icon type="plus" class="adding-icon"
                  @click="()=> {startMaking()}"
          />
        </span> -->
        <span class="card col-sm-4 adding-panel">
          <a-button type="dashed" class="adding-btn" @click="()=> {startMaking()}">
            <a-icon type="plus" class="adding-icon"
          /></a-button>
        </span>


        <span

          v-for="(datafile,index) in projectList"
          :key="datafile.id"
          :class="{selected:datafile.id===selectedProject}"
          class="card col-sm-4"
          @click="()=> {setActiveProjId(datafile.id,index)}"
        >
          <a-card
            hoverable
          >
            <div class="card-images">
              <img
                v-if="datafile.Datavoxelimage!=null"
                slot="cover"
                :src="parsePreviewImg(datafile.Datavoxelimage.DatavoxelId)[0]"
                class = "thumbnail-img"
              >
              <div v-else>
                <a-icon 
                  type="picture"
                  class="preview-ph"
                />
                <span class="preview-ph-text">Preview not available yet.</span>
              </div>

            </div>
            <a-card-meta
              :title="datafile.voxelname?datafile.voxelname:'Untitled'"
              :description="parseTime(datafile.createdAt)"/>
              
          </a-card>
        </span>
      </div>
    </transition>


    <!-- project info pop-up -->
    <transition>
      <div v-if="selectedProject!=null"
           class = "project-info">

        <img
          v-if="projectList[selectedIndex].Datavoxelimage!=null"
          :src="parsePreviewImg(projectList[selectedIndex].Datavoxelimage.DatavoxelId)[1]"
          class = "preview-img"
        >

        <span
          class="unselectProject"
          @click="()=> {unselectProject()}">
          <a-icon type="close" />
        </span>

        <div class = "info-text ">

          <div class = "col-sm-6 info-text-left">
            <div class = "info-title">
              {{ projectList[selectedIndex].voxelname?projectList[selectedIndex].voxelname:'Untitled' }}</div>

            <a-dropdown class = "actions">
              <a-menu slot="overlay">
                <a-menu-item key="1" @click.native="handleDeleteClick(selectedProject)">Delete Project</a-menu-item>
                <a-menu-item key="2" >
                  <!-- <a-checkbox default-checked @change="handlePublicity">Public</a-checkbox> -->
                  <a-checkbox :default-checked="projectList[selectedIndex].public" @change="handlePublicity">Public</a-checkbox>

                </a-menu-item>
              </a-menu>
              <a-button>
                Actions <a-icon type="down" />
              </a-button>
            </a-dropdown>

            <a-button class = "open-btn"
                      @click="openProject(selectedProject)"
            
            >Open Project</a-button>


            <div class = "info-bottom-left">

              <div>Created at:  
                <span class = "info-time"
              >{{ parseTime(projectList[selectedIndex].createdAt) }}</span></div>
              <div>Last updated at:  
                <span class = "info-digits"
              >{{ parseTime(projectList[selectedIndex].updatedAt) }}</span></div>

            </div>
            <br>
          </div>
          <div class = "col-sm-6 info-text-right">

            <div><strong>Layers</strong></div>
            <template>
              <div 
                class="demo-infinite-container"
              >
                <a-list
                  :data-source="projectList[selectedIndex].Datajsons"
                >

                  <a-list-item slot="renderItem" slot-scope="item, index"
                  >

                    <a-list-item-meta :description="item.rasterProperty"
                    >
                      <a slot="title" :key="item.datafileId">{{ item.layername }}</a>
                      <a-button slot="avatar" shape="circle">{{ item.layername.charAt(0).toUpperCase() }}</a-button>
                    </a-list-item-meta>
                    <div/>
                  </a-list-item>
                </a-list>
              </div>
            </template>
          </div>
        </div>
      </div>
    </transition>

    <!-- project creation page 1 -->
    <transition>
      <div v-if="makingProcess==1"
           class="making making1">
        <span
          class="unselectProject"
          @click="()=> {unselectProject()}">
          <a-icon type="close" />
        </span>
        <div class="making1-wrapper">
          <span class="making-title">Create Project</span>
          <span class="making1-desc">
            With Painting with Data, users can create an interactive map and explore relationships between georeferenced datasets leading to sound, informed policy or business decisions. Painting with Data utilizes voxels, which are a two-dimensional representation of a three-dimensional overlay, to compute different variables into a single map. Through an easy-to-use online interface, users can upload spatial datasets, or use the datasets available in the platform, creating spatial models that allow them to iteratively think about the correlations among datasets, and build spatial models on the fly. The spatial models can then be easily shared and built in collaboration with numerous users or citizens.
          </span>
          <a-button type="primary" @click="() => {createProjectMode()}">Create Project</a-button>
        </div>
      </div>
    </transition>

    <!-- project creation page 2 -->
    <transition>
      <div v-if="makingProcess>=2"
           class="making making2">
        <span
          class="unselectProject"
          @click="()=> {unselectProject()}">
          <a-icon type="close" />
        </span>

        <div class="making2-wrapper">
          <span class="making-title">Select Dataset</span>

          <div class="container making2-cols">
            <div class="col-sm-6 making2-section">
              <div class="col-header">
                <span>Datasets</span>
              </div>
              <div v-if="mydataset && mydataset.length>0" class="dataset-wrapper"> 
                <a-list
                  :data-source="mydataset"
                >
                  <a-list-item 
                    v-if="item.deleted!==false&&item.Datalayers.length!=0" slot="renderItem" 
                    slot-scope="item, index"
                    @click="()=> {datasetSelection(item,index)}">
                    <a-list-item-meta description="">
                      <a slot="title" :key="item.filename">{{ item.filename }}</a>
                      <a-button slot="avatar" shape="circle">{{ item.filename.charAt(0).toUpperCase() }}</a-button>
                    </a-list-item-meta>
                    <div/>
                  </a-list-item>
                <!-- <a-spin v-if="loading && !busy" class="demo-loading" /> -->
                </a-list>
              </div>
              <div v-else>
                <a-icon type="loading" class="loading"/>
              </div>
            </div>

            <div class="col-sm-6 making2-section">
              <div class="col-header">
                <span>Selected Properties</span>
              </div>
              <div class="property-viewer">

                <template>
                  <div>
                    <a-collapse 
                      v-if="Object.keys(selectedLayers).length"
                      :active-key="Object.keys(selectedLayers)"
                      @change="_onChange">

                      <a-collapse-panel 
                        v-for="(dataKey) in Object.keys(selectedLayers)"
                        :key="dataKey">
                        <template slot="header">
                          {{ dataById(dataKey).filename }}
                          <a-icon type="delete" class="delete-data"
                                  @click="()=> {deleteData(dataKey)}"
                          />
                        </template>

                        <a-list
                          :data-source="selectedLayers[dataKey]"
                        >

                          <a-list-item slot="renderItem" slot-scope="item, index">
                            <a-list-item-meta description="">
                              <a slot="title" :key="item">{{ item }}</a>
                              <a-button slot="avatar" shape="circle">{{ item.charAt(0).toUpperCase() }}</a-button>
                            </a-list-item-meta>
                            <a-icon type="delete" class="delete-prop"
                                    @click="()=> {deleteProp(dataKey,item)}"/>

                            <div/>
                          </a-list-item>

                        </a-list>

                      </a-collapse-panel>

                    </a-collapse>
                  </div>
                </template>


              </div>



            </div>

          </div>

          <a-button v-if="Object.keys(selectedLayers).length>0" type="primary"
                    @click="() => {projectInfoPage()}">Next</a-button>

        </div>
      </div>
    </transition>



    <!-- project creation page 3 -->
    <transition>
      <div v-if="makingProcess==3"
           class="making making3">
        <span
          class="unselectProject"
          @click="()=> {unselectProject(2)}">
          <a-icon type="close" />
        </span>

        <div class="making3-wrapper">
          <div class = "col-left">
            <div class="col-left-title"><strong>{{ mydataset[selectedDatasetIndex].filename }}</strong></div>

            <div class="map-wrapper">
              <a-icon 
                v-if="true" 
                type="loading"
                class = "loading"/>

              <l-map 
                v-if="selectedGeometries!=null"
                :zoom="zoom" 
                :center="getMapCenter(mydataset[selectedDatasetIndex])"
                :bounds="getBbox(mydataset[selectedDatasetIndex])">
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
          <div class = "col-right">
            <div class="col-right-title"><strong>Select Property</strong></div>
            <div class="property-wrapper">
              <template>
                <a-table 
                  :row-selection="rowSelection"
                  :columns="columns" :data-source="formatProperties(mydataset[selectedDatasetIndex].Datalayers[0].properties)" :pagination ="false">
                  <a slot="name" slot-scope="text" href="#">{{ text }}</a>
                </a-table>
              </template>
            </div>
          </div>
        </div>
        <a-button type="primary" @click="() => {selectProperties()}">Add To Selection</a-button>
      
      </div>
    </transition>

    <!-- project creation page 4 -->
    <transition>
      <div v-if="makingProcess==4"
           class="making making4">
        <span
          class="unselectProject"
          @click="()=> {pageJumper(2)}">
          <a-icon type="close" />
        </span>
      
        <div class="making4-wrapper">

          <template v-if="!submitting">
            <a-form :auto-form-create="()=>{formInit()}" @submit="handleSubmit">
              <a-form-item
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 12 }"
                :field-decorator-options="{rules: [{ required: true, message: 'Please input your project name!' }]}"
                label="Project Name"
                field-decorator-id="name"
              >
                <a-input v-model="formName"/>

              </a-form-item>

              <a-form-item
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 12 }"
                label="Voxel Density"
                field-decorator-id="density"
              >
                <a-col :span="26">
                  <a-slider :min="10000" :max="40000" v-model="formDensity"/>
                </a-col>
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
                :wrapper-col="{ span: 12, offset: 5 }"
              >
                <a-button v-if="formName!=null && formName!='' && !submitting" type="danger" html-type="submit">
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




</div></template>

<script>
import Vue2Leaflet from 'vue2-leaflet'
import L from 'leaflet'

let { LMap, LTileLayer, LPolygon, LMarker } = Vue2Leaflet

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})

const columns = [
  {
    title: 'Property',
    dataIndex: 'name',
    scopedSlots: { customRender: 'name' },
  },
  // {
  //   title: 'Age',
  //   dataIndex: 'age',
  // }, {
  //   title: 'Address',
  //   dataIndex: 'address',
  // }
]

export default {
  name: 'Projects',

  components: {
    LMap,
    LTileLayer,
    LPolygon,
    LMarker,
  },
  data() {
    return Object.assign(server, {
      maps: {},
      sortDate: true,
      sortDown: true,
      selectedProject: null,
      selectedIndex: null,
      selectedDatasetIndex: null,
      makingProcess: 0,
      mydataset: null,
      zoom: 13,
      selectedGeometries: null,
      selectedGeoType: null,
      attribution: '',
      columns: columns,
      selectedLayers: {},
      currentDatasetId: null,
      currentProperties: [],
      formName: null,
      formPublicity: false,
      formDensity: 10000,
      submitting: false,

      url:
        'https://api.tiles.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWJvdWNoYXVkIiwiYSI6ImNpdTA5bWw1azAyZDIyeXBqOWkxOGJ1dnkifQ.qha33VjEDTqcHQbibgHw3w',

      text: `this is a test data
        `,
      customStyle:
        'background: #f7f7f7;border-radius: 4px;margin-bottom: 24px;border: 0;overflow: hidden',
    })
  },

  computed: {
    projectList() {
      if (this.sortDate) {
        if (this.sortDown) {
          return _.sortBy(this.datavoxels, [
            function(o) {
              return o.createdAt
            },
          ]).reverse()
        } else {
          return _.sortBy(this.datavoxels, [
            function(o) {
              return o.createdAt
            },
          ])
        }
      } else {
        if (this.sortDown) {
          return _.sortBy(this.datavoxels, [
            function(o) {
              return o.voxelname[0]
            },
          ])
        } else {
          return _.sortBy(this.datavoxels, [
            function(o) {
              return o.voxelname[0]
            },
          ]).reverse()
        }
      }
    },

    rowSelection() {
      return {
        onChange: (selectedRowKeys, selectedRows) => {
          this.currentProperties = selectedRows.map(item => item.name)
        },
      }
    },

    encodedLayers() {
      let output = {}
      Object.keys(this.selectedLayers).forEach(k => {
        output[k] = this.selectedLayers[k].join(';')
      })

      return JSON.stringify(output)
    },
  },
  created() {},
  methods: {
    formInit() {
      console.log('form created')
    },

    handleSubmit(e) {
      e.preventDefault()

      let req = {
        voxelname: this.formName,
        datalayerIds: this.encodedLayers,
        voxelDensity: this.formDensity,
        public: this.formPublicity,
        layerButton: 'compute',
      }

      this.submitting = true
      this.$http.post('/datasets', req).then(response => {
        console.log('submitted', req, response)
        document.location.reload()
      })
    },

    handleSelectChange(type, value) {
      console.log(type, value)
    },

    _onChange(index) {
      console.log(index)
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

    setActiveProjId(id, index) {
      console.log('click ' + id)
      this.selectedProject = id
      this.selectedIndex = index
    },
    parseTime(timeStr) {
      let timeLst = timeStr.split('T')
      let date = timeLst[0]
      let time = timeLst[1].split('.')[0]
      return date + ' ' + time
    },
    unselectProject(num) {
      this.selectedProject = null
      this.selectedIndex = null
      this.selectedDatasetIndex = null
      this.currentProperties = []
      this.currentDatasetId = null
      this.makingProcess = num ? num : 0
      num ? null : (this.selectedLayers = {})
      this.selectedGeometries = null
      this.selectedGeoType = null
      this.formName = null
      this.formPublicity = false
      this.formDensity = 10000
    },
    pageJumper(num) {
      this.makingProcess = num
    },
    handleDeleteClick(projectId) {
      let req = { userId: this.id, dataVoxelId: projectId }
      this.$http.post('/delete/project/', req).then(response => {
        console.log('deleted', req, response)
        if (response.data.success) {
          // deletion in the UI
          this.unselectProject()
          this.datavoxels = this.datavoxels.filter(item => item.id != projectId)
        } else {
          // TODO: handle delete fail
        }
      })
    },

    handlePublicity(e) {
      // `req: {userId: integer, datavoxelId: integer, public: boolean}`
      // projectList[selectedIndex].public

      let req = {
        userId: +this.id,
        datavoxelId: this.selectedProject,
        public: e.target.checked,
      }

      this.$http.post('/voxelPrivacy/', req).then(response => {
        console.log('publicity', req, response)
      })
    },

    openProject(projectId) {
      window.location = '/app/' + projectId
    },
    parsePreviewImg(ThumbnailId) {
      let thumbnailBase = 'https://s3.amazonaws.com/data-voxel-images/'
      let previewBase = 'https://s3.amazonaws.com/data-voxel-preview/'

      return [
        thumbnailBase + ThumbnailId + '.jpg',
        previewBase + ThumbnailId + '.jpg',
      ]
    },

    dataById(id) {
      let data = this.mydataset.filter(item => item.id == id)
      return data.length > 0 ? data[0] : null
    },

    deleteData(id) {
      let dupSelectedLayers = Object.assign({}, this.selectedLayers)
      delete dupSelectedLayers[id]
      this.selectedLayers = dupSelectedLayers
    },

    deleteProp(dataid, prop) {
      this.selectedLayers[dataid].splice(
        this.selectedLayers[dataid].indexOf(prop),
        1
      )

      if (this.selectedLayers[dataid].length == 0) {
        this.deleteData(dataid)
      }
    },

    // show project-making landing page
    startMaking() {
      this.makingProcess = 1
      this.selectedDatasetIndex = null
      this.currentProperties = []
      this.currentDatasetId = null
      this.mydataset = null
    },

    // show project-making page
    createProjectMode() {
      this.makingProcess = 2
      this.selectedDatasetIndex = null
      this.currentProperties = []
      this.currentDatasetId = null
      this.mydataset = null
      this.queryDatasets()
    },

    // query dataset api
    queryDatasets() {
      if (!this.mydataset)
        this.$http.get('/datasets/').then(response => {
          this.mydataset = response.data.datafiles
        })
    },

    // open up the dataset selection pop-up box
    datasetSelection(data, index) {
      this.makingProcess = 3
      this.selectedDatasetIndex = index
      this.currentProperties = []
      this.currentDatasetId = data.id
      this.selectedGeoType = data.geometryType

      this.queryMapGeometry(data.id)
    },

    selectProperties() {
      if (this.currentProperties.length > 0) {
        this.selectedLayers[this.currentDatasetId] = this.currentProperties
      }

      this.unselectProject(2)
      console.log(this.dataById(46), this.selectedLayers)
    },

    projectInfoPage() {
      if (Object.keys(this.selectedLayers).length > 0) {
        this.makingProcess = 4
      }
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
    formatProperties(properties) {
      return Object.keys(properties).map(item => ({ name: item }))
    },
  },
}
</script>


<style lang="scss" scoped>
.ant-form {
  position: absolute;
  width: 500px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

a {
  color: black;
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

.making {
  position: absolute;
  left: 0px;
  top: 0px;
  bottom: 0px;
  right: 0px;
  background-color: white;

  z-index: 1000;
}

.making1-desc {
}

.making-title {
  text-align: center;
  font-size: 26px;
  display: inherit;
  font-weight: 500;
  margin-bottom: 0px;
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

.adding-panel {
  // height: 269.5px;
}

.preview-ph {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: scale(3) translate(-50%, -50%);
  transform-origin: 0% 0%;
}

.preview-ph-text {
  position: absolute;
  opacity: 0.6;
  font-size: 14px;
  bottom: 10px;
  text-align: center;

  width: 100%;
}

.preview-img {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.3;
}

.open-btn {
  position: absolute;
  right: 15px;
  border: none;
  top: 50px;
  color: #e75332;
}
.page-title-section {
  margin-top: 80px;
}

.mainContainer {
  min-height: calc(100vh - 130px);
}

.squeezedContainer {
  height: 0px;
  min-height: 0px;
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

.project-info {
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  height: 99%;
  background: white;
  z-index: 1000;
}

.actions {
  position: absolute;
  left: 15px;
  top: 50px;
  border: none;
  padding: 0px;
  background: none;
}

.card-images {
  height: 200px;
  overflow: hidden;
  position: relative;

  background-color: rgba(0, 0, 0, 0.03);
  margin-bottom: 10px;
}

.ant-switch-checked {
  background-color: rgba(0, 0, 0, 0.4);
}

.ant-switch {
  background-color: rgba(0, 0, 0, 0.4);
}

.sorting-Switches {
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

.card {
  padding: 0px !important;
  height: 269.5px !important;
}

.dataset-list {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  float: left;
}

.switch {
  float: left;
  margin-left: 12px;

  font-size: 12px;
}

.dataset-info {
  position: relative;
  width: 40%;
  float: left;
  border: 1px solid rgba(0, 0, 0, 0.1);
  min-height: calc(100vh - 300px);
  margin-bottom: 20px;
  box-shadow: 4px 4px 6px 0px rgba(0, 0, 0, 0.1);
}
.datainfo-content {
  height: calc(100% - 20px);
  overflow-y: auto;
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
  top: 10px;
  right: 10px;
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
}

.thumbnail-img {
  object-fit: cover;
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0px;
  top: 0px;

  transform: scale(1.3);
}

.info-cover {
  width: 100%;
}

.info-text {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  min-width: 350px;
  width: 80%;
  height: 60%;
  min-height: 400px;

  /deep/ {
    .info-title {
      font-weight: 700;
      font-size: 30px;
      text-overflow: ellipsis;

      overflow: hidden;
      white-space: nowrap;
    }

    .info-time {
      font-size: 13px;
      color: rgba(0, 0, 0, 0.45);
    }

    .info-digits {
      color: rgba(0, 0, 0, 0.45);
    }

    .info-text-left {
      height: 100%;
    }
    .info-text-right {
      border-left: 1px solid rgba(0, 0, 0, 0.1);
      height: 100%;
      overflow-y: auto;
    }

    .info-bottom-left {
      position: absolute;
      left: 15px;
      bottom: 0px;
    }
  }
}

.demo-infinite-container {
  border-radius: 4px;
  overflow: auto;
  padding: 8px 24px;
}
.demo-loading {
  position: absolute;
  bottom: 40px;
  width: 100%;
  text-align: center;
}

.loading {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: scale(3) translate(-50%, -50%);
  transform-origin: 0% 0%;
}

.demo-infinite-container {
  height: auto;
}

.ant-list-item {
  background-color: rgba(255, 255, 255, 0.7);
  padding: 12px;
  border-radius: 5px;

  /deep/ {
    .ant-list-item-meta-content {
    }

    .ant-list-item-meta-description {
      font-size: 12px;
    }

    .ant-list-item-meta-title {
      margin-top: 5px;
    }
  }
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

.making2-wrapper {
  position: absolute;
  top: 80px;
  left: 0px;
  right: 0px;
  bottom: 0px;

  padding: 50px;
}

.making3-wrapper {
  position: absolute;
  top: 80px;
  left: 0px;
  right: 0px;
  bottom: 100px;
  padding: 50px;
}

.making4-wrapper {
  position: absolute;
  top: 80px;
  left: 0px;
  right: 0px;
  bottom: 100px;
  padding: 50px;
}

.making2-section {
  background-color: rgba(0, 0, 0, 0.01);
  border: 1px solid rgba(0, 0, 0, 0.1);

  height: 100%;
}

.making2-cols {
  height: calc(100% - 120px);
}

.col-header {
  font-size: 20px;
  margin: 10px;
  margin-bottom: 10px;
  text-align: center;
}

.dataset-wrapper {
  height: calc(100% - 50px);
  overflow-y: auto;

  /deep/ {
    .ant-list-item:hover {
      cursor: pointer;
      opacity: 0.7;
    }
  }
}

.col-left {
  width: 50%;
  float: left;
  height: 100%;
  position: relative;
}
.col-right {
  width: 50%;
  float: left;
  height: 100%;
  position: relative;

  padding-left: 20px;
}
.col-right-title {
  position: absolute;
  z-index: 1;
  left: 20px;
}
.col-left-title {
  position: absolute;
  z-index: 1;
  left: 0px;
  font-size: 20px;
}

.property-wrapper {
  height: calc(100% - 40px);
  margin-top: 40px;
  overflow-y: auto;
}

.map-wrapper {
  position: absolute;
  height: calc(100% - 40px);
  width: 100%;
  top: 40px;
  background-color: rgba(0, 0, 0, 0.1);
}

.property-viewer {
  overflow: auto;
  height: calc(100% - 50px);
}

.delete-data {
  position: absolute;
  right: 29px;
  top: 15px;
}

.delete-prop {
  cursor: pointer;
}

.adding-btn {
  width: calc(100% - 20px);
  height: calc(100% - 20px);
  margin: 10px;
}
</style>

<style>
@import '~leaflet/dist/leaflet.css';
</style>
