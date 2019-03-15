import axios from 'axios'
import { appConfig, serverApi, hostConfig } from '../config/global'

export default {
  getInstance: () => {
    let baseURL = hostConfig.host

    return axios.create({
      baseURL,
      timeout: 10000,
    })
  },
}
