<template>
  <div class="friend-req-list">
    <div class="req-head">新的好友</div>
    <!-- topDisabled 触顶时是否禁止调用 touchTop 事件的回调 -->
    <!--bottomDisabled 触顶时是否禁止调用 touchBottom 事件的回调 -->
    <scroll-box class="scroll-box" listenHeight ref="scrollBox" topDisabled :bottomDisabled="bottomDisabled"
      :bottomDistance="30" @touchBottom="getFriendReqList(Number(friendReqList[friendReqList.length - 1].createdAt))">
      <div class="req-list" v-if="friendReqList.length > 0">
        <div class="req-item" v-for="item in friendReqList" :key="item.id">
          <div class="avatar"><img :src="item.user.avatar" alt="" /></div>
          <div class="item-info">
            <div class="info-left">
              <div class="name">{{ item.user.userName }}</div>
              <div class="content">{{ item.content }}</div>
            </div>
            <div class="accept" v-if="item.handle === 0" @click="addFriendFaq(item)">接受</div>
            <div class="accepted" v-else>已添加</div>
          </div>
        </div>
        <loading v-if="isLoading"></loading>
      </div>
      <div v-else class="tips">暂无好友请求哦</div>
    </scroll-box>
  </div>
</template>

<script lang="ts">
import { api_getFriendReqList } from '@/api/friendRequest'
import { api_addFriend } from '@/api/friend'
import ScrollBox from '@/components/ScrollBox.vue'
import Loading from '@/components/Loading.vue'
import { reactive, toRefs, defineComponent, onMounted } from 'vue'
import { useStore } from 'vuex'
import { FriendRequest } from '@/type'

export default defineComponent({
  components: { ScrollBox, Loading },
  name: 'friend-req-list',
  setup() {
    const store = useStore()
    const state: State = reactive({
      // 好友请求列表
      friendReqList: [],
      bottomDisabled: false,
      isLoading: false,
    })

    // 生命周期
    onMounted(() => {
      getFriendReqList()
    })

    // 请求列表数据，分页加载：如果触底且 bottomDisabled 为假，请求新的数据并更新 bottomDisabled
    const getFriendReqList = async (lastTime?: number) => {
      state.bottomDisabled = true // 正在请求新数据，防止再次调用
      state.isLoading = true // 设置状态为加载中
      const res = await api_getFriendReqList({ lastTime })
      if (res) {
        state.friendReqList.push(...res.list)
        state.bottomDisabled = res.list.length < 20   // 一次返回 20 条数据，如果小于 20 条表示后续没有数据了
      }
      state.isLoading = false
    }

    // 接受好友请求的回调
    const addFriendFaq = async (item: FriendRequest) => {
      const res = await api_addFriend({ requestId: item.id })
      if (res) {
        store.commit('addFriend', res.userInfo)
        item.handle = 1
      }
    }

    return {
      ...toRefs(state),
      addFriendFaq,
      getFriendReqList,
    }
  },
})

interface State {
  friendReqList: FriendRequest[]
  bottomDisabled: boolean,
  isLoading: boolean
}
</script>

<style scoped>
.friend-req-list {
  width: 100%;
  background: url('@/assets/img/chat_background.png') 0 0 no-repeat;
  background-size: 100%;
}

.req-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 55px;
  border-bottom: 1px solid #ddd;
  padding: 0 27px;
  font-size: 18px;
  background-color: #f9f9f9;
}

.scroll-box {
  padding: 20px 0;
  height: calc(100vh - 55px);
  overflow: auto;
}

.req-list {
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0px 50px -12px rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  width: 490px;
  margin: 0 auto;
}

.req-item {
  text-align: left;
  display: flex;
  width: 490px;
  padding: 10px 20px;
  border-bottom: 1px solid #eee;
  margin: 0 auto;
}

.avatar {
  height: 45px;
  width: 45px;
  min-width: 45px;
}

.avatar img {
  width: 100%;
  height: 100%;
  border-radius: 5px;
  object-fit: cover;
}

.item-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  align-items: center;
  width: 100%;
  margin-left: 10px;
}

.content {
  color: rgb(126, 126, 126);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 5px;
}

.accept {
  padding: 5px 11px;
  border-radius: 3px;
  /* background-color: #1aad19; */
  background-color: #3fa7e4;
  color: white;
  cursor: pointer;
  width: 46px;
}

.accept:hover {
  background-color: #2495ce;
}

.accepted {
  width: 46px;
  text-align: center;
  color: rgb(126, 126, 126);
}

.tips {
  margin-top: 50px;
  text-align: center;
  color: rgb(126, 126, 126);
}
</style>
