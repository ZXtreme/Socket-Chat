import store from "@/store";
import { onBeforeMount } from "vue";
import useWebrtc from './webrtc'

import useSubscribe from './subscribe'
import { WebRtcMsg } from "@/type";

// refer：https://blog.csdn.net/m0_60259116/article/details/124597552
export default function () {
  onBeforeMount(() => {
    useSubscribe([{ msgName: 'webRTC', callback: (name: string, msg: WebRtcMsg) => rtcCallback(msg) }])
  })
}

const rtcCallback = (msg: WebRtcMsg) => {
  switch (msg.type) {
    case 'videoReq':  // 收到视频通话请求
      reqHandler(msg);
      break;
    case 'offer':     // 收到了一个 offer sdp
      offerHandler(msg)
      break;
    case 'answer':    // 收到了一个 answer sdp
      answerHandler(msg)
      break;
    case 'candidate': // 收到了一个 ICE candidate
      candidateHandler(msg)
      break;
  }
}

const reqHandler = (msg: WebRtcMsg) => {
  if (msg.data === 'refuse') {
    // 拒绝，挂断pc
    store.state.pc?.hangup && store.state.pc.hangup()
  } else if (msg.data === 'accept') {
    // 接受，发送本地sdp
    store.state.pc?.createOfferFunc && store.state.pc.createOfferFunc()
  } else if (msg.data === 'cancel') {
    // 取消
    PubSub.publish('videoReq', msg)
  }
}

const offerHandler = async (msg: WebRtcMsg) => {
  useWebrtc({ mode: 'receiver', type: ['videoCall'] })
  const pc = store.state.pc;
  pc?.setRemoteDescription(new RTCSessionDescription(msg.data as RTCSessionDescriptionInit))
}

const answerHandler = (msg: WebRtcMsg) => {
  const pc = store.state.pc;
  pc?.setRemoteDescription(new RTCSessionDescription(msg.data as RTCSessionDescriptionInit))
}

const candidateHandler = (msg: WebRtcMsg) => {
  const pc = store.state.pc
  pc?.addIceCandidate(msg.data as RTCIceCandidate)
}
