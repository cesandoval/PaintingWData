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

        <!-- TODO: adding project btn -->
        <span class="card col-sm-4 adding-panel">
          <a-icon type="plus" class="adding-icon"
                  @click="()=> {startMaking()}"
          />
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
                  <a-list-item slot="renderItem" slot-scope="item, index" 
                               @click="()=> {datasetSelection(item)}">
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
            </div>

          </div>
        </div>
      </div>
    </transition>

    <!-- project creation page 2 -->
    <transition>
      <div v-if="makingProcess==2"
           class="making">
        <span
          class="unselectProject"
          @click="()=> {unselectProject()}">
          <a-icon type="close" />
        </span>


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
                <l-map v-if="selectedGeometries!=null" 
                       :zoom="zoom" 
                       :center="getMapCenter(mydataset[selectedDatasetIndex])"
                       :bounds="getBbox(mydataset[selectedDatasetIndex])">
                  <l-tile-layer :url="url" :attribution="attribution"/>

                  <!-- polygons -->
                  <!-- <template>
                  <l-polygon 
                    v-for="(geometry,index) in selectedGeometries"
                    :key="index"
                    :lat-lngs="geometry" :weight="1" color="black" 
                    fill-color="rgb(255,255,255)"/>
                </template> -->

                </l-map>

              </div>
              <div class = "col-right"/>
            </div>
          </div>
        </transition>



      </div>
</transition></div></template>

<script>
import Vue2Leaflet from 'vue2-leaflet'
import L from 'leaflet'

let { LMap, LTileLayer, LPolygon } = Vue2Leaflet

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})

export default {
  name: 'Projects',

  components: {
    LMap,
    LTileLayer,
    LPolygon,
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
      center: L.latLng(47.41322, -1.219482),
      selectedGeometries: null,
      url:
        'https://api.tiles.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWJvdWNoYXVkIiwiYSI6ImNpdTA5bWw1azAyZDIyeXBqOWkxOGJ1dnkifQ.qha33VjEDTqcHQbibgHw3w',
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
  },
  created() {
    // console.log('created')
    // console.log(this.datavoxels)
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
      this.makingProcess = num ? num : 0
      this.selectedGeometries = null
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

    // show project-making landing page
    startMaking() {
      this.makingProcess = 1
      this.selectedDatasetIndex = null
      this.mydataset = null
    },

    // show project-making page
    createProjectMode() {
      this.makingProcess = 2
      this.selectedDatasetIndex = null
      this.mydataset = null
      this.queryDatasets()
    },

    // query dataset api
    queryDatasets() {
      if (!this.mydataset)
        this.$http.get('/datasets/').then(response => {
          console.log('layers', response)
          this.mydataset = response.data.datafiles
        })
    },

    // open up the dataset selection pop-up box
    datasetSelection(data) {
      this.makingProcess = 3
      console.log(data)
      this.selectedDatasetIndex = data.id

      this.queryMapGeometry(data.id)
    },

    queryMapGeometry(datasetId) {
      console.log('query dataset ', datasetId)

      this.$http.get('/getThumbnailData/' + datasetId).then(response => {
        this.selectedGeometries = response.data.geoJSON.map(obj =>
          obj.coordinates[0].map(item => [item[1], item[0]])
        )

        console.log(this.selectedGeometries)
      })
    },
  },
}
</script>


<style lang="scss" scoped>
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
  border: 0.1px solid black;
  background-color: rgba(0, 0, 0, 0.05);
}

.adding-icon:hover {
  opacity: 1 !important;
  cursor: pointer;
}

.adding-panel {
  height: 269.5px;
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

.making2-section {
  background-color: rgba(0, 0, 0, 0.01);
  border: 1px solid rgba(0, 0, 0, 0.1);

  height: 100%;
}

.making2-cols {
  height: calc(100% - 50px);
}

.col-header {
  font-size: 20px;
  margin: 10px;
  margin-bottom: 10px;
  text-align: center;
}

.dataset-wrapper {
  height: calc(100% - 50px);

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
}
.col-right {
  width: 50%;
  float: left;
}
</style>
