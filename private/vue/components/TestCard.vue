<template>
  <div>
    <a-card
      hoverable
      style="width: 300px"
    >
      <img
        slot="cover"
        alt="example"
        src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
      >
      <ul slot="actions" class="ant-card-actions">
        <li style="width: 33.3333%;"><a-icon type="setting" /></li>
        <li style="width: 33.3333%;"><a-icon type="edit" /></li>
        <li style="width: 33.3333%;"> <a-icon type="ellipsis" /></li>
      </ul>
      <a-card-meta
        title="Card title"
        description="This is the description">
        <a-avatar slot="avatar" src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
      </a-card-meta>
    </a-card>
  </div>
</template>

<script>
export default {
  name: 'DatasetName',
  components: {},
  data() {
    return {
      maps: {},
    }
  },
  created() {
    // console.log('created')
  },
  methods: {},
}
</script>

<style lang="scss" scoped>
</style>
