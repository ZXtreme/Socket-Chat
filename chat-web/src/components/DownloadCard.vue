<template>
  <div class="download-card" @click="download" :title="fileInfo.fileName">
    <div class="file-info">
      <div class="file-name">{{ fileInfo.fileName }}</div>
      <div class="file-size">{{ sizeShow }}</div>
    </div>
    <div class="file-cover">
      <img :src="require('@/assets/img/fileImg.png')" alt="" />
    </div>
    <!-- 进度 -->
    <div class="progress-bar" v-if="downing">
      <div class="done-part" :style="`width:${progress}%`"></div>
    </div>
  </div>
</template>

<script lang="ts">
import axios from 'axios'
import { message } from 'ant-design-vue'
import { computed, defineComponent, reactive, toRefs } from 'vue'
import { FileInfo } from '@/type'

export default defineComponent({
  name: 'download-card',
  props: {
    fileInfo: {
      type: Object,
      default: (): FileInfo => {
        return { fileName: '', size: 0 }
      },
    },
    file: String,
  },
  setup(props) {
    const state = reactive({
      // 下载进度
      progress: 0,
      // 是否正在下载
      downing: false,
    })
    const compute = {
      sizeShow: computed(() => {
        const size = props.fileInfo?.size
        if (typeof size != "number") return ''
        if (size < 1024) {
          return size + 'B'
        } else if (size < 1024 * 1024) {
          return (size / 1024).toFixed(2) + 'K'
        } else {
          return (size / 1024 / 1024).toFixed(2) + 'M'
        }
      }),
    }
    let cancelFunc: any = null

    // 点击下载的回调
    const download = () => {
      if (state.downing && cancelFunc) {
        // 取消下载
        state.downing = false
        message.info('取消下载')
        cancelFunc('cancel download')
      } else if (!state.downing) {
        // 下载
        state.downing = true
        message.info('开始下载, 再次点击可取消下载')
        let isLocal = /^blob/.test(props.file as string)
        if (isLocal) {  // blob 可直接下载
          createTag(props.file as string)
        } else {  // http 链接是直接预览，不可下载，需要获取对应的 blob
          axios
            .get(props.file as string, {
              responseType: 'blob',
              onDownloadProgress: (progressEvent) => {
                state.progress = (progressEvent.loaded / progressEvent.total) * 100
              },
              cancelToken: new axios.CancelToken((c) => {
                cancelFunc = c
              }),
            })
            .then((res) => {
              let blob = res.data
              let src = URL.createObjectURL(blob)
              createTag(src)
            })
            .catch((err) => {
              if (err.message == 'cancel download') return
              state.downing = false
              message.error('下载失败!')
            })
        }
      }

      // 创建a标签并下载
      function createTag(src: string) {
        let a = document.createElement('a')
        a.href = src
        a.download = props.fileInfo?.fileName

        a.click()
        message.success('下载成功')
        state.downing = false

        URL.revokeObjectURL(src)
      }
    }

    return {
      ...toRefs(state),
      ...compute,
      download,
    }
  },
})
</script>

<style scoped>
.download-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  height: 75px;
  width: 230px;
  background-color: #fff;
  padding: 0px 15px;
  border-radius: 5px;
  cursor: pointer;
}

.file-info {
  text-align: left;
}

.file-cover {
  width: 35px;
  min-width: 35px;
}

.file-cover img {
  object-fit: cover;
  width: 100%;
}

.file-name {
  color: black;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 150px;
}

.file-size {
  color: rgb(117, 117, 117);
  font-size: 13px;
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #ddd;
  height: 3px;
}

.done-part {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 3px;
  background-color: #98e165;
  transition: 0.1s width ease;
}
</style>
