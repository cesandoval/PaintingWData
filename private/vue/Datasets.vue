<template>
  <div>
    <div class = "page-title-section">
      <h1 class = "page-title">Datasets</h1>

      <div v-if="datafiles.length>0"
           class = "sorting-switches"
      >
        <a-switch v-model="sortDate" checked-children="date" un-checked-children="name" 
                  size="small"/>
        <br>
        <a-switch v-model="sortDown" 
                  size="small">
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
          v-for="datafile,index in datefileList"
          v-if="true" :key="datafile.id"
          :class="{selected:datafile.id===selectedDataset}"
          class="card col-sm-4"
          @click="()=> {setActiveDatasetId(datafile.id,index)}"
        >
          <a-card
            hoverable
          >
            <img
              slot="cover"
              alt="example"
              src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
            >
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


      <a-dropdown class = "actions">
        <a-menu slot="overlay" @click="handleDeleteClick(selectedDataset)">
          <a-menu-item key="1" >Delete Dataset</a-menu-item>
        </a-menu>
        <a-button>
          Actions <a-icon type="down" />
        </a-button>
      </a-dropdown>

      <div class = "datainfo-content">

        <div class = "info-cover-wrapper">
          <img src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" class="info-cover">
        </div>


        <div class = "info-text">

          <div class = "info-title">File name:  
            <span class = "info-digits"
          >{{ datafiles[selectedIndex].filename.split(".")[0] }}</span></div>
          <div>Created at:  
            <span class = "info-time"
          >{{ parseTime(datafiles[selectedIndex].createdAt) }}</span></div>
          <br>
          <div>Last updated at:  
            <span class = "info-digits"
          >{{ parseTime(datafiles[selectedIndex].updatedAt) }}</span></div>
          <div>Latitude:  
            <span class = "info-digits"
          >{{ (datafiles[selectedIndex].centroid.coordinates[0].toFixed(2)) }}</span></div>
          <div>Longitude:  
            <span class = "info-digits"
          >{{ (datafiles[selectedIndex].centroid.coordinates[1].toFixed(2)) }}</span></div>
          <div>Type of Geometry:  
            <span class = "info-digits"
          >{{ datafiles[selectedIndex].geometryType }}</span></div>
          <br>
          <div><strong>Properties</strong></div>
          <template>
            <div 
              class="demo-infinite-container"
            >
              <a-list
                :data-source="Object.keys(datafiles[selectedIndex].Datalayers[0].properties)"
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


</template>

<script>
import DatasetCard from '@/components/DatasetCard'
import infiniteScroll from 'vue-infinite-scroll'

export default {
  name: 'Datasets',

  components: { DatasetCard },
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
    })
  },
  computed: {
    datefileList() {
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
              console.log(o.filename[0])
              return o.filename[0]
            },
          ]).reverse()
        }
      }
    },
  },
  created() {
    // console.log('created')
  },
  methods: {
    setActiveDatasetId(id, index) {
      console.log('click ' + id)
      // squeeze tile display
      this.squeezeTiles()
      this.selectedDataset = id
      this.selectedIndex = index

      // highlight selected tile

      // display dataset info on the right side
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
    },
    parseCoord(coord) {
      return coord[0].toFixed(2) + ', ' + coord[1].toFixed(2)
    },
    handleDeleteClick(datasetId) {
      console.log(datasetId)
    },
  },
}
</script>

<style lang="scss" scoped>
.page-title-section {
  margin-top: 80px;
}

.actions {
  position: absolute;
  left: 11px;
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
  margin: 15px;
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

.info-cover {
  width: 100%;
}

.info-text {
  padding: 10px;

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
  height: 300px;
}
.demo-loading {
  position: absolute;
  bottom: 40px;
  width: 100%;
  text-align: center;
}
.demo-infinite-container {
  height: auto;
}

.ant-list-item {
  /deep/ {
    .ant-list-item-meta-content {
      padding-top: 5px;
    }
  }
}

.demo-infinite-container {
  /deep/ {
    .ant-spin-container {
      max-height: 150px;
      overflow-y: auto;
    }
  }
}
</style>
