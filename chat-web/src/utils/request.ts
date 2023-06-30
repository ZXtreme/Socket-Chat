import axios from 'axios'
import type { AxiosResponse } from 'axios'

import { message } from 'ant-design-vue'

const client = axios.create({
  baseURL: '/api',
  timeout: 30000,
  withCredentials: true, // 启用跨域请求时是否发送凭据（如 cookies）
})

// 请求拦截
client.interceptors.request.use(config => {
  return config
}, err => {
  return Promise.reject(err)
})

// 响应拦截
client.interceptors.response.use((response: AxiosResponse) => {
  if (response.status !== 200 || response.data.code !== 200) {
    // 请求失败
    if (!response.data.unshow) {
      message.error(response.data.msg || '请求失败!')
    }
    return false
  }
  return response.data
}, err => {
  return Promise.reject(err)
})

export default client