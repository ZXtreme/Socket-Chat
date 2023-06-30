<div align="center">
  <img width="130px" style="margin-bottom:24px;" src="./public/logo.svg">
<h1>Socket-Chat-Web</h1>

<p>基于 Vue3 的 Web 端的在线聊天工具</p>
</div>

## 🎃 Socket-Chat-Web 端

Socket-Chat 的 web 端，基于 vue3 + socket.io + webrtc 实现，目前实现了基本的用户登陆注册、会话列表、好友列表、好友增删、好友聊天、表情包和文件的发送与接收、视频通话等功能。后期会继续完善现有功能。

## ✨ 项目 Web 端简介

### socket.io 建立双向通信
  ```
  (0) 使用了 express-socket.io-session 中间件使得在 socket.io 中能够通过 socket.request.session 获取用户 session
    const sharedsession = require('express-socket.io-session')
    process.io = io("ws://localhost:3010")
    process.io.use(sharedsession(session))
  (1) 访问 /index 页面时进行 socket 连接，服务器判断是否带有 session(判断是否登录)，若没有则断开 socket 连接(/getlogin 请求会自动跳转到登录页面)
  (2) 判断是否为异地登录，若 当前 session 的用户 id 已经连接上 socket，则强制断开旧用户的 socket 并 logout
  (3) 将当前 socketId 和用户信息进行保存，便于后续其他操作可以通过 用户id 找到所连接的 socket
  (4) socket.on 监听客户端发送的各种事件并进行处理

  client：
    import { io } from 'socket.io-client'
    const socket = io("ws://localhost:3010")
    socket.on('hello', () => { ... })         接收服务器发来的消息
    socket.emit('chat', 'hello world')        向服务器发送消息
  server：
    const http = require('http')
    const socketIO = require('socket.io')
    const server = http.createServer(app);
    const io = socketIO(server);
    io.on('connection', (socket) => {         与 socket.io 建立连接
      socket.on('chat', (msg) => {            监听 chat 事件
        ...
        io.emit('hello', msg);                广播消息给所有客户端(包括自己)
        // socket.emit('hello', msg)          将消息发送到连接到该 socket 的客户端
      });
    });
    server.listen(3010, () => { ... });
  ```


### 无感登陆

> 登录(实现了无感登陆)：使用了 express-session 中间件，并设置了 cookie 的 maxAge
> 
> (1) 首次登录：将 用户id 写入 req.session，客户端自动保存 cookie
> 
> (2) 二次登录：在请求 index 页面时，发送 /getlogin 请求(自动携带cookie)，如果 cookie 未过期，则直接返回用户信息，无需再次登录；若 cookie 过期(或首次登录，cookie 不存在)，则返回401，跳转到登录页面

### 性能优化

> 分页加载(聊天记录、好友列表、文件列表)
> 
> 懒加载(自定义表情)

### pubsub-js 监听的事件
  - chat           接收其它用户发送的消息
  - videoReq       视频通话请求
  - rightMenu      右键菜单 
  - viewPicture    查看大图
  - addEmoticon    收藏表情
  - notice         系统通知
  - sendMsg        监听输入框发送的消息
  - sendMsgSuccess 发送消息成功
  - sendMsgFail    发送消息失败
  - webRTC         监听视频通话

### webrtc 实现视频通话
  ```
  (1) 使用 socket.io 实现信令服务器，用于传输 SDP(Session Description Protocol)、candidate 等信令数据，视频双方建立与信令服务器的连接
  (2) 双方都创建各自的 pc(RTCPeerConnection)，并获取本地媒体流，将媒体流 add 到 pc 上
  ```
   ![交换SDP](/md-assets/exchange-sdp.png)
  ```
  -- 媒体协商阶段，交换双方 SDP
  (3) A(请求者) createOffer -> setLocalDescription -> 发送 offer SDP 到信令服务器 -> 转发到 B(接收者) 
  (4) B setRemoteDescription 将对方发送过来的 offer SDP 应用到本地的 pc 上
  (5) B createAnswer -> setLocalDescription -> 发送 answer SDP 到信令服务器 -> 转发到 A
  (6) A setRemoteDescription 将对方发送过来的 answer SDP 应用到本地的 pc 上
  -- 建立网络连接阶段
  (7) 监听 icecandidate 事件，通过 ICE 服务器收集 candidate -> 发送 candidate 到信令服务器 -> 转发到另一方 -> addIceCandidate
  (8) 通过收集到的 candidate 建立连接，成功连接后通过监听 track 事件接收远端的音视频数据
  (9) 监听 iceconnectionstatechange 事件，若为 disconnected 则挂断通话
  ```

### 可展示 emoji 表情的输入框
  - 使用 contenteditable 将 div 变为 可编辑框
  - 插入节点：Selection 对象 removeAllRanges() 并 addRange() 将光标移到指定位置处  
        -->  deleteContents() 删除选区范围内的内容
        -->  insertNode(node) 在选区范围内插入新的节点
        -->  输入框 focus() 重新获取焦点并 collapse(false) 将光标定位到 Range 的结束位置
  - paste 事件，判断 e.clipboardData?.files[0] 是否存在，存在则直接发送该文件，不存在则创建文本节点，在当前光标位置插入该节点
  - keydown 事件，若为 Enter 按键，则发送当前编辑的内容，若为 ctrl + Enter，则对编辑的内容进行换行
  - keyup 事件，若按下的为方向键，更新 Range 对象的值(用于插入 emoji)
  - input 事件，由于 contenteditable 末尾换行必须至少存在一个 \n，当 innerHTML 末尾不为 \n 时，手动添加一个 \n，否则 ctrl + Enter 无法换行
  - click 事件，鼠标点击切换光标，更新 Range 对象的值(用于插入 emoji)

### 主要目录结构
```
src
├─ App.vue
├─ index.d.ts
├─ main.ts
├─ shims-vue.d.ts
├─ type.ts                            主要数据对象类型
├─ api                                http 请求的发送
├─ assets                             资源文件
├─ components
│  ├─ AddFriendModal.vue              添加好友
│  ├─ ChatInput.vue                   可添加表情的输入框
│  ├─ DownloadCard.vue                文件卡片
│  ├─ EmojiDialog.vue                 emoji 选择框
│  ├─ FriendList.vue                  好友列表
│  ├─ FriendReqList.vue               好友请求列表
│  ├─ FriendWindow.vue                好友个人信息展示
│  ├─ Loading.vue                     加载动画
│  ├─ MoreMenu.vue                    更多菜单
│  ├─ PictureViewer.vue               图片大图展示
│  ├─ RightClickMenu.vue              右键菜单
│  ├─ ScrollBox.vue                   滚动盒子
│  ├─ SessionList.vue                 正在进行对话的好友列表
│  ├─ SideBar.vue                     侧边栏
│  ├─ ToneCmp.vue                     消息提示音
│  ├─ UploadCmp.vue                   文件上传
│  ├─ VideoReqDialog.vue              视频通话请求
│  └─ chatWindow          
│      ├─ ChatWindow.vue              对话窗口
│      └─ children
│          ├─ ChatTopBar.vue          顶部栏
│          ├─ InputBox.vue            输入区域
│          ├─ NotiDialog.vue          系统通知
│          ├─ VideoWindow.vue         视频通话窗口
│          └─ chatDialog
│             ├─ ChatDialog.vue       聊天消息显示
│             ├─ NotificationTag.vue  显示发送时间显示
│             ├─ talkerItem.vue       对方消息显示
│             └─ userItem.vue         己方消息显示
│
├─ directive                          自定义指令
│  ├─ clickOutside.ts                 点击外部区域
│  └─ imgLazyLoad.ts                  懒加载
│
├─ hooks
│  ├─ aUploadHook.ts                  文件上传
│  ├─ sessionList.ts                  会话管理
│  ├─ socketMsgHandler.ts             socket 消息管理
│  ├─ subscribe.ts                    pubsub-js 事件订阅
│  ├─ webrtc.ts                       视频通话具体处理函数
│  └─ webrtcHandler.ts                视频通话管理
│
├─ router                             vue-router
├─ store                              vuex
├─ utils
│  ├─ antDesign.ts                    Ant Design 按需引入
│  ├─ request.ts                      axios 请求配置
│  └─ utils.ts                        若干辅助函数
│
└─ views
   ├─ Chat.vue                        聊天
   ├─ File.vue                        文件
   ├─ Friend.vue                      好友
   ├─ Index.vue                       主页
   └─ Login.vue                       登录注册
```

## 📄 补充
待开发项：
  - 群聊
  - 语音输入
  - 语音通话
所有核心功能均已实现，以下是目前暂未实现的非核心功能，将会在后续逐步完善：
  - 好友列表和聊天列表的搜索框功能
  - 更多菜单中修改资料和密码没实现
  - 账号详细资料的填写（如：个性签名、备注、地区）