<template
  @click="()=> {unSqueezeTiles()}">
  <div>
    <h1>Datasets</h1>

    <transition>
      <div 
        :class="{ squeezeddatasetlist: isSqueezed, }"
        class = "dataset-list">
        <span
          v-for="datafile,index in datafiles"
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
        X
      </span>
      <div class = "datainfo-content">

        <div class = "info-cover-wrapper">
          <img src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" class="info-cover">
        </div>

        <div class = "info-text">
          <div class = "info-title">{{ datafiles[selectedIndex].filename }}</div>
          <div class = "info-time">{{ parseTime(datafiles[selectedIndex].createdAt) }}</div>
          <br>
          <div>updatedAt:  
            <span class = "info-digits"
          >{{ parseTime(datafiles[selectedIndex].updatedAt) }}</span></div>
          <div>Latlng:  
            <span class = "info-digits"
          >{{ parseCoord(datafiles[selectedIndex].centroid.coordinates) }}</span></div>
          <div>epsg:  
            <span class = "info-digits"
          >{{ datafiles[selectedIndex].epsg }}</span></div>
          <div>geometryType:  
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
                    <a-avatar slot="avatar" src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
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
    })
  },
  computed: {
    byNameDatafiles() {
      return _.sortBy(this.datafiles, [
        function(o) {
          return o.filename
        },
      ])
    },
    byNameDatafilesReverse() {
      return _.sortBy(this.datafiles, [
        function(o) {
          return -o.filename
        },
      ])
    },
    byDateDatafiles() {
      return _.sortBy(this.datafiles, [
        function(o) {
          return o.createdAt
        },
      ])
    },
    byDateDatafilesReverse() {
      return _.sortBy(this.datafiles, [
        function(o) {
          return -o.createdAt
        },
      ])
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
  },
}
</script>

<style lang="scss" scoped>
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
  transform: translateY(-5px);
  box-shadow: 0px 2px 7px rgba(0, 0, 0, 0.3);
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
