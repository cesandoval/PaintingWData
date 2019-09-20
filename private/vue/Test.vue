<template>
  <div>
    <h1>Layers</h1>
    <a-rate :default-value="3" />
    <label>sort by date</label>
    <a-switch v-model="sortDate" />
    <span v-show="acitveDataset" id="datasetPreview">
      <h3>Hover Card {{ acitveDataset }}</h3>
    </span>
    <hr >
    <span
      v-for="datafile in datefileList"
      v-if="datafile.visible"
      :key="datafile.filename"
      class="card"
      @mouseover="
        () => {
          setActiveDatasetId(datafile.filename)
        }
      "
      @mouseout="
        () => {
          setActiveDatasetId('')
        }
      "
    >
      <a-card hoverable style="width: 300px">
        <img
          slot="cover"
          alt="example"
          src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
        >
        <ul slot="actions" class="ant-card-actions">
          <li style="width: 33.3333%;"><a-icon type="setting" /></li>
          <li style="width: 33.3333%;"><a-icon type="edit" /></li>
          <li style="width: 33.3333%;"><a-icon type="ellipsis" /></li>
        </ul>
        <a-card-meta
          :title="datafile.filename"
          :description="`This is the description. The Date ${datafile.date}`"
        >
          <a-avatar
            slot="avatar"
            src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
          />
        </a-card-meta>
      </a-card>
    </span>
  </div>
</template>

<script>
import TestCard from '@/components/TestCard'

//  { datafiles, id, userSignedIn, user, layerAlert: layerAlert ? true : false}
const server = {
  // from server side
  datafiles: [
    {
      filename: 'dataset AAA',
      date: '3',
      visible: true,
    },
    {
      filename: 'dataset BBB',
      date: '1',
      visible: true,
    },
    {
      filename: 'dataset CCC',
      date: '2',
      visible: true,
    },
    {
      filename: 'dataset DDD',
      date: '4',
      visible: false,
    },
  ],
}

export default {
  name: 'Test',

  components: { TestCard },
  data() {
    return Object.assign(server, {
      maps: {},
      sortDate: false,
      acitveDataset: '',
    })
  },
  computed: {
    datefileList() {
      return this.sortDate ? _.sortBy(this.datafiles, ['date']) : this.datafiles
    },
  },
  mounted() {
    console.log(this.datafiles)
  },
  methods: {
    setActiveDatasetId(datasetId) {
      console.log(`setActiveDatasetId(${datasetId})`)
      this.acitveDataset = datasetId
    },
  },
}
</script>

<style lang="scss" scoped>
.card {
  display: inline-block;
  margin: 10px;
}

.ant-rate {
  /deep/ {
    .ant-rate-star {
      color: green;
    }
  }
}
</style>
