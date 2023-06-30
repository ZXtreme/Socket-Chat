<template>
  <div class="friend">
    <!-- 好友列表 -->
    <friend-list></friend-list>
    <div class="logo-page" v-if="!store.state.currentFriend">
      <img :src="require('@/assets/img/logo.svg')" alt="" />
    </div>
    <!-- 好友个人资料卡片 -->
    <friend-window v-else-if="store.state.currentFriend.id !== -1"></friend-window>
    <!-- 好友申请列表 -->
    <friend-req-list v-else-if="store.state.currentFriend.id === -1"></friend-req-list>
  </div>
</template>

<script lang="ts">
import FriendList from '@/components/FriendList.vue'
import FriendWindow from '@/components/FriendWindow.vue'
import FriendReqList from '@/components/FriendReqList.vue'
import { useStore } from 'vuex'
import { defineComponent } from 'vue'
export default defineComponent({
  components: { FriendList, FriendWindow, FriendReqList },
  name: 'friend-page',
  setup() {
    const store = useStore()

    return {
      store,
    }
  },
})
</script>

<style scoped>
.friend {
  display: flex;
  width: 100%;
}

.logo-page {
  flex: 1;
  background-color: #f9f9f9;
}

.logo-page img {
  margin-top: calc(45vh - 65px);
  height: 130px;
  width: 130px;
}
</style>
