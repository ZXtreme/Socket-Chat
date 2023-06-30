<div align="center">
  <img width="130px" style="margin-bottom:24px;" src="../chat-web/public/logo.svg">
<h1>Socket-Chat-Server</h1>

<p>基于 Vue3 的 Web 端的在线聊天工具</p>
</div>

## Socket-Chat-Server 端

Socket-Chat的服务器，基于 express + mysql + socket.io 实现，目前实现了基本的用户登陆注册、会话列表逻辑、好友增删、视频通话等功能，后期会继续完善现有功能。

## 项目 server 端简介

- utils/db.js 采用sequelize连接数据库
  - const sequelize = new DB.Sequelize(...) 连接数据库
models 定义数据库表结构
  - const User = sequelize.define(...) 定义表结构
  - User.sync() 数据库创建对应表结构，已存在则不变
- dao(数据访问对象，Data Access Object) 对数据库信息进行增删查改
  - User.findOne({...}) 查找满足条件的第一条记录
  - User.findAll({...}) 查找满足条件的所有记录
  - User.create({...})  插入一条新记录
  - User.destroy({...}) 删除符合条件的记录
  - User.update({...}) 更新符合条件的记录
  - User1.belongsTo(User2, { foreignKey: 'xx', targetKey: 'xxx' }) 表 User1 和表 User2 的连接
  - {...} 中的属性：
    ```
    attributes: ['a','b'] 需要返回的属性名
    order: [              返回的顺序
      ['id', 'DESC']
    ]
    offset: number        偏移值，从符合条件的第 offset 条开始返回
    limit: number         返回数据限制的最大条数
    raw: true             设置为 true，即返回原始数据，只能访问每个字段的值，不能使用 Sequelize 模型实例对象的方法
    where: {              返回的数据应该符合的条件
      id: id
    }
    ```
- controllers 定义请求所需要调用的函数，函数中接受请求参数、对参数进行检查、调用对应的 dao、作出响应
  - 密码采用 md5 加密  
- routes 将请求接口与 controllers 中的函数对应
  - user：账号登录与注册
     ```
    post  /signin                   注册用户
    post  /login                    用户登录
    get   /getLogin                 判断用户是否处于登录状态，若是则返回用户信息
    get   /logout                   退出登录
    get   /get_user_info            根据 id 查询用户
    ```
  - session：会话列表管理
    ```
    get   /get_session_list         获取 session 列表
    get   /reset_unread             更新会话内容、未读消息数量和时间
    ```
  - notification：通知列表管理
    ```
    get   /get_noti_list            获取系统通知记录
    ```
  - friend：好友列表管理
    ```
    get   /add_friend               添加好友
    get   /get_friend_list          获取好友列表
    get   /delete_friend            删除好友
    ```
  - friend_request：好友请求列表管理
    ```
    get   /get_friend_request_list  获取好友请求列表
    get   /add_friend_request       添加好友请求
    ```
  - file
    ```
    get   /get_file_list            获取文件列表
    post  /upload_file              上传文件 / 表情
    ```
  - emoticon
    ```
    get   /get_emoticon_list        获取自定义表情包列表
    get   /add_emoticon             添加自定义表情包
    ```
  - chat
    ```
    get   /get_chat_list            获取聊天记录
    ```
- middleware 鉴别是否获取权限(是否登录)的中间件
- websocket 监听 socket 事件并作出回应
  ### 合法性检验
  - 客户端连接上 socket，若 session 中不存在有效的 userId，则未登录，断开连接
  - 判断用户是否已登录，若已登录则为异地登录情况，强行注销上一次的登录状态
  - 保存登录通知记录，并更新 session 信息
  ### 事件监听
  - chat: 互相发送消息
    ```
    (1) 判断是否为好友关系，不是则反馈 '对方与您不是好友关系!'
    (2) 判断消息类型，type 0:文字、1:图片、2:文件、3: 自定义表情、4: 通知、5: 视频邀请，0、3、5 则直接获取消息内容，1、2 则将图片或文件存储到指定目录，将对应的 src 作为消息内容，并将上传文件记录存入数据库
    (3) 更新会话列表，并将聊天记录存入数据库，反馈消息发送成功信息给 sender
    (4) 判断 receiver 是否在线，在线则将消息内容转发给 receiver
    ```
  - request: 设置未读消息数量
    ```
    将会话中的未读消息数量设置为指定值
    ```
  - webRTC: 视频通话相关信息
    ```
    将视频通话相关信息原封不动转发给接收方
    ```
  - disconnect: 断开 socket 连接
    ```
    将用户与所连接上的 socket 的对应信息移除
    ```
- app.js 创建 express 服务器和 socket，使用 middleware 定义的中间件，使用 routes 定义的路由

## 安装步骤

1. mysql中创建一个名为 socket_chat 的数据库
2. 项目安装依赖 `npm install`
3. 在根目录下运行 src 中的 app.js `node src/app.js`

## 注意

本项目需要 node 和 mysql 环境




