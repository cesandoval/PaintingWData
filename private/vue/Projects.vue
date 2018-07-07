<template>
  <div 
    :class="{ squeezedContainer:selectedProject!=null, }"
    class = "mainContainer"
  
  >
    <div class = "page-title-section">
      <h1 class = "page-title">Projects</h1>

      <div v-if="datavoxels.length>0"
           class="sortingSwitches"
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


    <div v-if="datavoxels.length===0"
         class = "no-data"
    >
      No Data Uploaded.
    </div>


    <transition>
      <div 
        class = "dataset-list">
        <span
          v-for="(datafile,index) in projectList"
          :key="datafile.id"
          :class="{selected:datafile.id===selectedProject}"
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
              :title="datafile.voxelname?datafile.voxelname:'Untitled'"
              :description="parseTime(datafile.createdAt)"/>
              
          </a-card>
        </span>
      </div>
    </transition>


    <transition>
      <div v-if="selectedProject!=null"
           class = "project-info">

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
              <a-menu slot="overlay" @click="handleDeleteClick(selectedProject)">
                <a-menu-item key="1" >Delete Project</a-menu-item>
                <a-menu-item key="2" >                  
                  <a-checkbox :checked="projectList[selectedIndex].public">Public</a-checkbox>
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


  </div>
  
</template>

<script>
export default {
  name: 'Projects',

  components: {},
  data() {
    return Object.assign(server, {
      maps: {},
      sortDate: true,
      sortDown: true,
      selectedProject: null,
      selectedIndex: null,
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
    console.log(this.datavoxels)
  },
  methods: {
    setActiveDatasetId(id, index) {
      console.log('click ' + id)
      // squeeze tile display
      this.selectedProject = id
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
    unselectProject() {
      this.selectedProject = null
      this.selectedIndex = null
    },
    handleDeleteClick(datasetId) {
      console.log(datasetId)
    },
    openProject(projectId) {
      window.location = '/app/' + projectId
    },
  },
}
</script>


<style lang="scss" scoped>
.open-btn {
  position: absolute;
  right: 15px;
  border: none;
  top: 50px;
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
  bottom: 0px;
  left: 0px;
  right: 0px;
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

.ant-switch-checked {
  background-color: rgba(0, 0, 0, 0.4);
}

.ant-switch {
  background-color: rgba(0, 0, 0, 0.4);
}

.sortingSwitches {
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
.demo-infinite-container {
  height: auto;
}

.ant-list-item {
  /deep/ {
    .ant-list-item-meta-content {
    }

    .ant-list-item-meta-description {
      font-size: 12px;
    }
  }
}
</style>
