import store from '@/store';
import { PC } from '@/type';
import { message } from 'ant-design-vue';
import { nextTick } from 'vue';

// 配置 RTCPeerConnection 的 ICE（Interactive Connectivity Establishment，交互式连接建立） 服务器选项。
// ICE 服务器帮助客户端（浏览器）发现、收集和交换网络候选者
const pcOption = {
  iceServers: [{ urls: 'stun:stun.xten.com' }, { urls: 'stun:stun.voipbuster.com' }],
};

// 最大呼叫时间，单位：秒
const MAXCALLTIME = 15;

interface WebRtcType {
  // mode: sender / receiver
  mode: string;
  // type: videoCall
  type: string[];
}

export default function ({ mode, type }: WebRtcType) {
  let remoteVideo: HTMLMediaElement;
  let localVideo: HTMLMediaElement;
  let mediaStream: MediaStream;
  let remoteStream: MediaStream;
  let pc: PC;

  // 监听是否有新的 candidate 收集到
  const onicecandidate = (e: RTCPeerConnectionIceEvent) => {
    if (e.candidate) {
      store.state.socket?.emit('webRTC', {
        type: 'candidate',
        data: e.candidate,
        receiverId: store.state.currentSession?.receiverId,
      });
    }
  };

  // 建立连接后，接收到远端的音视频数据
  const ontrack = (e: RTCTrackEvent) => {
    nextTick(() => {
      remoteVideo = document.querySelector('#remote-video') as HTMLMediaElement;
      if (remoteVideo.srcObject !== e.streams[0]) {
        remoteVideo.srcObject = e.streams[0];
        remoteStream = e.streams[0];
      }
    });
  };

  // 监听 ICE 连接状态的变化
  const oniceconnectionstatechange = () => {
    if (pc.iceConnectionState === 'disconnected') {
      hangup();
      message.info('对方已挂断通话!');
    }
  };

  // 获取本地媒体流
  const getLocalMediaStream = async () => {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    } catch (err) {
      message.error('获取媒体流失败, 请检查摄像头和麦克风权限哦!');
      hangup();
    }

    nextTick(() => {
      localVideo = document.querySelector('#local-video') as HTMLMediaElement;
      localVideo.srcObject = mediaStream;
    });

    // 绑定本地媒体数据到pc对象上
    mediaStream.getTracks().forEach((track) => {
      pc.addTrack(track, mediaStream);
    });
  };

  // 断开连接，stop 所有 track
  const hangup = () => {
    if (pc.iceConnectionState === 'new') {  // 发送取消请求通知
      store.state.socket?.emit('webRTC', {
        type: 'videoReq',
        data: 'cancel',
        senderId: store.state.userInfo?.id,
        receiverId: store.state.currentSession?.receiverId,
      });
    }

    mediaStream?.getTracks().forEach((track) => track.stop());
    remoteStream?.getTracks().forEach((track) => track.stop());
    type = type.filter((item) => item !== 'videoCall');

    if (!type.length) pc.close();  // 判断是否还存在其它类型
    store.commit('setChatStatus', { type: 'videoCall', status: false });
    store.commit('setPC', null);
  };

  // 发送 answer sdp
  const createAnswer = async () => {
    // 创建一个 SDP answer
    const answer = await pc.createAnswer();
    // 该方法会将传入的 SDP 对象应用到指定的 PeerConnection 对象，从而更新本地设备的媒体信息和网络连接参数。
    await pc.setLocalDescription(answer);
    // 发送本地 SDP 到远端
    store.state.socket?.emit('webRTC', {
      type: 'answer',
      data: answer,
      senderId: store.state.userInfo?.id,
      receiverId: store.state.currentSession?.receiverId,
    });
  };

  // pc.createOffer() 创建一个 SDP（Session Description Protocol）offer
  // 它在指定的 PeerConnection 对象上生成一个包含本地媒体信息和网络参数的 SDP offer
  // SDP offer 包含有关媒体流和网络连接的信息，例如音视频编解码器、传输协议、ICE 候选地址等。
  // 通过创建 SDP offer，可以向另一个对等端发送邀请，以建立点对点的音视频通信连接
  const createOffer = async () => {
    // 获取本地sdp
    const offer = await pc.createOffer();
    // 绑定本地sdp 
    await pc.setLocalDescription(offer);
    // 发送本地sdp到远端
    store.state.socket?.emit('webRTC', {
      type: 'offer',
      data: offer,
      senderId: store.state.userInfo?.id,
      receiverId: store.state.currentSession?.receiverId,
    });
  };

  // 视频通话需要开启的监听以及挂载的方法
  const videoCallHander = () => {
    // 监听到远端传过来的媒体数据
    pc.ontrack = ontrack;
    // 绑定本地媒体流后创建 answer
    getLocalMediaStream().then(() => {
      // create在对方接受邀请后才调用，因为发起方在邀请过程中就需要打开摄像头，而接收方只有在接受后才打开
      // if (mode === 'sender') { createOffer() } else               严重怀疑要加上！！！！！
      if (mode === 'receiver') createAnswer();
    });

    // 创建offer的方法
    pc.createOfferFunc = createOffer;
    // 挂断视频通话的方法
    pc.hangup = hangup;
  };

  const init = () => {
    pc = new RTCPeerConnection(pcOption);
    store.commit('setPC', pc);
    // 修改当前聊天状态为视频通话状态
    store.commit('setChatStatus', { type: 'videoCall', status: true });
    // 监听 candidate
    pc.onicecandidate = onicecandidate;
    // 监听 ice connection 的状态改变
    pc.oniceconnectionstatechange = oniceconnectionstatechange;

    if (type.indexOf('videoCall') !== -1) {
      videoCallHander();
    }

    setTimeout(() => {
      if (pc?.iceConnectionState === 'new') {
        // new 说明还没有进入连接状态，自动挂断
        message.info('通话暂时无人接听哦!');
        hangup();
      }
    }, MAXCALLTIME * 1000);
  };

  init();
}
