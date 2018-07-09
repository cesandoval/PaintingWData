import Vue from 'vue'
import Antd from 'vue-antd-ui'
import axios from 'axios'
import 'vue-antd-ui/dist/antd.css'

Vue.prototype.$http = axios
Vue.use(Antd)

export default Vue
