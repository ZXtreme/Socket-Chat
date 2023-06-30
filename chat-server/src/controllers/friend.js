const dao_friend_request = require('../dao/friend_request')
const dao_friend = require('../dao/friend')
const dao_session = require('../dao/session')
const dao_chat = require('../dao/chat')
const dao_user = require('../dao/user')
const socket_user = require('../websocket/user')

// 添加好友
const addFriend = async (req, res, next) => {
  res.set('content-type', 'application/json;charset=utf-8')
  const userId = req.session["userId"]

  // 获取请求参数
  const query = req.query;

  // 获取好友请求
  const friendReq = await dao_friend_request.getRequestById(query.requestId)
  if (!friendReq) {
    res.end(JSON.stringify({
      code: 400,
      msg: '该请求不存在',
    }))
    return
  }

  // 判断是否已是好友
  const isFriend = await dao_friend.getIsFriend(friendReq.friendId, friendReq.userId)
  if (isFriend) {
    res.end(JSON.stringify({
      code: 400,
      msg: '该用户已是你的好友',
    }))
    return
  }

  // 添加好友
  const add_res = await dao_friend.addFriend(userId, friendReq.friendId)
  // 更新好友请求信息
  const update_res = await dao_friend_request.updateRequest(query.requestId, 1, 1)

  // 获取好友用户信息
  const friendInfo = await dao_user.getUserById(friendReq.friendId)
  res.end(JSON.stringify({
    code: add_res && update_res ? 200 : 400,
    userInfo: add_res && update_res && friendInfo
  }))

  const timestamps = new Date().getTime()
  // 判断会话列表是否存在
  let sessionId = await dao_session.getSessionExist(friendReq.friendId, friendReq.userId)
  if (!sessionId) {
    // 如果两个用户之间不存在 sessionId, 创建 session 会话窗口
    sessionId = await dao_session.createSession(friendReq.friendId, friendReq.userId, friendReq.content, timestamps)
  }
  // 添加聊天记录
  const chat = {
    sessionId: sessionId,
    senderId: friendReq.friendId,
    receiverId: friendReq.userId,
    content: friendReq.content,
    type: 0,
    updatedAt: timestamps,
  }
  const chatRes = await dao_chat.addChat(chat)
  if (!chatRes) {
    res.end(JSON.stringify({
      code: 400,
      msg: '聊天记录添加失败',
    }))
    return
  }

  // websocket 推送消息
  // 推送给自己
  const self = socket_user.getUserById(friendReq.userId)
  self && process.io.to(self.socketId).emit('chat', {
    content: friendReq.content,
    time: timestamps,
    sessionId,
    talkerId: friendReq.friendId,
    type: 0,
  })

  // 推送给 friend
  const friend = socket_user.getUserById(friendReq.friendId)
  friend && process.io.to(friend.socketId).emit('chat', {
    content: friendReq.content,
    time: timestamps,
    sessionId,
    talkerId: friendReq.userId,
    type: 0,
  })
}


// 获取好友列表
const getFriendList = async (req, res, next) => {
  res.set('content-type', 'application/json;charset=utf-8')
  const list = await dao_friend.getFriendList(req.session["userId"])

  res.end(JSON.stringify({
    code: list ? 200 : 400,
    list: list
  }))
}

// 删除好友
const deleteFriend = async (req, res, next) => {
  res.set('content-type', 'application/json;charset=utf-8')
  if (!req.query.friendId) {
    res.end(JSON.stringify({
      code: 400,
      msg: '缺少必要参数: friendId',
    }))
    return
  }

  const userId = req.session["userId"]

  // 判断是否是好友
  const isFriend = await dao_friend.getIsFriend(userId, req.query.friendId)
  if (!isFriend) {
    res.end(JSON.stringify({
      code: 400,
      msg: '删除失败, 您与对方已经不是好友关系',
    }))
    return
  }

  // 删除好友
  const deleteRes = await dao_friend.deleteFriend(userId, req.query.friendId)
  if (!deleteRes) {
    res.end(JSON.stringify({
      code: 400,
      msg: '删除失败',
    }))
    return
  }

  const timestamps = new Date().getTime()
  // 更新 session 信息
  const sessionId = await dao_session.getSessionExist(userId, req.query.friendId)
  await dao_session.updateSession({
    sessionId,
    lastChat: '[解除好友关系通知]',
    timestamps,
    userId: userId,
    isNoti: true
  })

  // 保存删除好友信息至聊天记录中
  const chat = {
    sessionId: sessionId,
    senderId: userId,
    receiverId: req.query.friendId,
    content: 'deleteFriend',
    type: 4,
    updatedAt: timestamps,
  }
  const chatRes = await dao_chat.addChat(chat)
  if (!chatRes) {
    res.end(JSON.stringify({
      code: 400,
      msg: '聊天记录添加失败'
    }))
    return
  }

  // websocket 推送消息
  // 推送给自己
  const self = socket_user.getUserById(userId)
  self && process.io.to(self.socketId).emit('chat', {
    content: '您已与对方解除好友关系',
    time: timestamps,
    sessionId,
    talkerId: req.query.friendId,
    type: 4,
  })

  // 推送给friend
  const friend = socket_user.getUserById(req.query.friendId)
  friend && process.io.to(friend.socketId).emit('chat', {
    content: '对方已与您解除好友关系',
    time: timestamps,
    sessionId,
    talkerId: req.query.friendId,
    type: 4,
  })

  res.end(JSON.stringify({
    code: 200,
    msg: '删除好友成功'
  }))
}

module.exports = {
  addFriend,
  getFriendList,
  deleteFriend,
}