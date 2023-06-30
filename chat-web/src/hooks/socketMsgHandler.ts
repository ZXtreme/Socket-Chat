import { useStore } from 'vuex'
import { io } from 'socket.io-client'
import { FailMsg, FriendReqMsg, LoginMsg, MsgType, ReceiveMsg, SuccessMsg, WebRtcMsg } from '@/type'
import Pubsub from 'pubsub-js'
import { message, notification } from 'ant-design-vue'
import { ComponentInternalInstance, getCurrentInstance } from 'vue'
import ToneCmp from '@/components/ToneCmp.vue'
import { useRouter } from 'vue-router'

export default function () {
  const store = useStore()
  const router = useRouter()
  const { proxy } = getCurrentInstance() as ComponentInternalInstance

  // 建立 websocket 连接，此处本来根据跨域应该为 const socket = io('/socket.io')
  // 但是 socket.io 的请求地址默认自带 socket.io，所以此处只要传入'/'
  const socket = io('/')
  store.commit('setSocket', socket)

  // 接收聊天信息
  socket.on('chat', (data: ReceiveMsg) => {
    const toneCmp = proxy?.$refs.toneCmp as typeof ToneCmp
    toneCmp.playTone()
    Pubsub.publish('chat', data)

    if (data.type === 5) {
      // 视频邀请
      Pubsub.publish('videoReq', {
        senderId: data.talkerId,
      })
    }
  })

  // 视频相关事件
  socket.on('webRTC', (data: WebRtcMsg) => {
    Pubsub.publish('webRTC', data)
  })

  // 接收通知信息
  socket.on('message', (msg: MsgType) => {
    switch (msg.msgType) {
      case 'chat':            // 发送成功或失败信息
        chatHandler(msg as SuccessMsg | FailMsg)
        break
      case 'login':           // 登录
        LoginHandler(msg as LoginMsg)
        break
      case 'friendRequest':   // 好友请求
        friendReqHandler(msg as FriendReqMsg)
        break
    }
  })

  // 登录信息处理
  const LoginHandler = (msg: LoginMsg) => {
    switch (msg.status) {
      case 'success':
        // 将通知发送给 sessionList，以更新 sessionList
        Pubsub.publish('notice', msg)
        break
      case 'logout':         // 未登录
        store.state.socket?.disconnect()
        router.push('/login')
        break
      case 'force_logout':   // 被异地登录挤下线
        message.warning('您的账号已在别的地方登录!')
        store.state.socket?.disconnect()
        router.push('/login')
        break
    }
  }

  // 处理好友请求的回调
  const friendReqHandler = (msg: FriendReqMsg) => {
    notification.open({
      message: '添加好友请求',
      description: `${msg.userInfo.userName}:\n${msg.content}`,
      key: `${msg.msgType}+${msg.userInfo.id}`,   // 通知类型 + 用户id
      onClick: () => {
        // 点击后跳转到好友页
        store.commit('setCurrentFriend', { id: -1 })
        router.push('/friend')
        notification.close(`${msg.msgType}+${msg.userInfo.id}`)
      },
    })
  }

  // 聊天的回调
  const chatHandler = (msg: SuccessMsg | FailMsg) => {
    if (msg.status === 'success') {
      // 成功
      Pubsub.publish('sendMsgSuccess', msg)
    } else {
      // 失败
      message.error(msg.content)
      Pubsub.publish('sendMsgFail', msg)
    }
  }
}