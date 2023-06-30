<template>
  <scroll-box class="file" listenHeight topDisabled :bottomDisabled="disabled"
    @touchBottom="getFileList(Number(fileList[fileList.length - 1][fileList[fileList.length - 1].length - 1].createdAt))">
    <div class="file-group" v-for="item in fileList" :key="item[0].createdAt">
      <div class="group-date">{{ timeHandler(item[0].createdAt) }}</div>
      <div class="group-container">
        <div class="group-item" v-for="i in item" :key="i.createdAt"
          :title="`大小: ${i.size} B\n创建时间戳: ${i.createdAt}\n地址: ${i.src}`">
          <div class="item-cover">
            <!-- 图片 -->
            <img v-if="i.type === 1" :src="i.src" alt="" @click.stop="checkImg" />
            <!-- 文件 -->
            <img v-else-if="i.type === 2" :src="require('@/assets/img/fileImg.png')" alt="" />
          </div>
          <div class="file-name">{{ i.fileName }}</div>
        </div>
      </div>
    </div>
    <loading class="loading" v-show="isLoading"></loading>
  </scroll-box>
</template>

<script lang="ts">
import { api_getFileList } from '@/api/files'
import ScrollBox from '@/components/ScrollBox.vue'
import Loading from '@/components/Loading.vue'
import Pubsub from 'pubsub-js'
import moment from 'moment'
import { computed, defineComponent, onMounted, reactive, toRefs } from 'vue'
import { FileItem } from '@/type'

export default defineComponent({
  components: { ScrollBox, Loading },
  name: 'file-page',
  setup() {
    const state: State = reactive({
      // 二维文件信息数组
      fileList: [],
      // 禁止加载新数据
      disabled: false,
      // 加载新数据中
      isLoading: false
    })
    const compute = {
      timeHandler: computed(() => {
        return function (time: string) {
          return moment(parseInt(time)).format('yyyy-MM-DD')
        }
      })
    }

    onMounted(() => {
      getFileList()
    })

    // 请求文件列表
    const getFileList = async (lastTime?: number) => {
      state.disabled = true
      state.isLoading = true

      const res = await api_getFileList({ lastTime })

      if (res) {
        groupByTime(res.list)
        state.disabled = res.list.length < 30
      }
      state.isLoading = false
    }

    // 将新增列表按照时间进行分组
    const groupByTime = (newList: FileItem[]) => {
      newList.forEach((item) => {
        if (!state.fileList.length) {
          state.fileList.push([item])
        } else {
          const time = state.fileList[state.fileList.length - 1][0].createdAt
          //  判断是否在同一天内创建的文件
          if (moment(parseInt(time)).isSame(moment(parseInt(item.createdAt)), 'date')) {
            state.fileList[state.fileList.length - 1].push(item)
          } else {
            state.fileList.push([item])
          }
        }
      })
    }

    const checkImg = (e: MouseEvent) => {
      Pubsub.publish('viewPicture', e.target)
    }

    return {
      ...toRefs(state),
      ...compute,
      checkImg,
      groupByTime,
      getFileList,
    }
  },
})

interface State {
  disabled: boolean
  fileList: FileItem[][],
  isLoading: boolean
}
</script>

<style scoped>
.file {
  padding: 10px 30px;
  height: 100vh;
  width: 100%;
  overflow: auto;
}

.group-date {
  text-align: left;
  font-weight: 600;
  font-size: 19px;
  margin: 20px 10px 2px;
}

.group-container {
  display: flex;
  flex-wrap: wrap;
}

.group-item {
  width: 90px;
  text-align: center;
  overflow: hidden;
  margin: 10px 5px;
  cursor: pointer;
}

.file-name {
  -webkit-line-clamp: 2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}

.item-cover img {
  border-radius: 5px;
  height: 70px;
  width: 70px;
  object-fit: cover;
}

.loading {
  margin: 10px 0;
}
</style>
