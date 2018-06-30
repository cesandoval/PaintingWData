<template
  @click="()=> {unSqueezeTiles()}">
  <div>
    <h1>Datasets</h1>

    <transition>
      <div 
        :class="{ squeezeddatasetlist: isSqueezed, }"
        class = "dataset-list">
        <span
          v-for="datafile in datafiles"
          v-if="true" :key="datafile.id"
          :class="{selected:datafile.id===selectedDataset}"
          class="card col-sm-4"
          @click="()=> {setActiveDatasetId(datafile.id)}"
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

      
    </div>
  </div>


  </div>


</template>

<script>
import DatasetCard from '@/components/DatasetCard'

export default {
  name: 'Datasets',

  components: { DatasetCard },
  data() {
    return Object.assign(server, {
      maps: {},
      isSqueezed: false,
      selectedDataset: null,
    })
  },
  created() {
    // console.log('created')
  },
  methods: {
    setActiveDatasetId(id) {
      console.log('click ' + id)
      // squeeze tile display
      this.squeezeTiles()
      this.selectedDataset = id

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
      console.log('squeeze')
      this.isSqueezed = true
    },
    unSqueezeTiles() {
      console.log('unsqueeze')
      this.isSqueezed = false
      this.selectedDataset = null
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
  float: left;
}

.dataset-info {
  position: relative;
  width: 30%;
  float: left;
  border: 1px solid rgba(0, 0, 0, 0.1);
  min-height: calc(100vh - 300px);
  margin-bottom: 20px;

  box-shadow: 4px 4px 6px 0px rgba(0, 0, 0, 0.1);
}

.squeezeddatasetlist {
  width: 70%;
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
</style>
