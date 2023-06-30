<template>
  <div class="index">
    <!-- 侧边栏 -->
    <side-bar></side-bar>

    <!-- 好友/聊天/文件 三个部分 -->
    <router-view></router-view>

    <!-- 图片预览 -->
    <picture-viewer></picture-viewer>
    <!-- 好友删除时的右键菜单 -->
    <right-click-menu></right-click-menu>
    <!-- 视频通话 -->
    <video-req-dialog></video-req-dialog>
    <!-- 消息提示音 -->
    <tone-cmp ref="toneCmp"></tone-cmp>
  </div>
</template>

<script lang="ts">
import { api_getLogin } from '@/api/user'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import SideBar from '@/components/SideBar.vue'
import PictureViewer from '@/components/PictureViewer.vue'
import RightClickMenu from '@/components/RightClickMenu.vue'

import { defineComponent, onMounted } from 'vue'
import VideoReqDialog from '@/components/VideoReqDialog.vue'
import ToneCmp from '@/components/ToneCmp.vue'

import useSocketMsgHandler from '@/hooks/socketMsgHandler'
import useSessionList from '@/hooks/sessionList'

export default defineComponent({
  name: 'HomeView',
  components: {
    SideBar,
    PictureViewer,
    RightClickMenu,
    VideoReqDialog,
    ToneCmp,
  },
  setup() {
    const store = useStore()
    const router = useRouter()

    onMounted(async () => {
      // 如果 vuex 中没有用户信息，则判断是否处于登录状态
      if (!store.state.userInfo) {
        const res = await api_getLogin()
        if (res) store.commit('setUserInfo', res.userInfo)
        else router.push('/login')
      }
    })

    useSocketMsgHandler()
    useSessionList()

    return {}
  },
})
</script>

<style scoped>
.index {
  display: flex;
  height: 100vh;
  background-size: cover;
  position: relative;
}
</style>
