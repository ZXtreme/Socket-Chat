const dao_friend_request = require('../dao/friend_request')
const dao_friend = require('../dao/friend')
const dao_user = require('../dao/user')
const socket_user = require('../websocket/user')

// 添加好友请求
const addRequest = async (req, res, next) => {
  res.set('content-type', 'application/json;charset=utf-8')
  const query = req.query
  if (!query.friendId) {
    res.end(JSON.stringify({
      code: 400,
      msg: '缺少必要参数: friendId',
    }))
    return
  }

  // 判断是否是自己
  const user = await dao_user.getUserById(req.session["userId"])
  if (user.id == query.friendId) {
    res.end(JSON.stringify({
      code: 400,
      msg: 'friendId 不能是自己哦',
    }))
    return
  }

  // 判断用户是否存在
  const friend = await dao_user.getUserById(query.friendId)
  if (!friend) {
    res.end(JSON.stringify({
      code: 400,
      msg: '用户不存在',
    }))
    return
  }

  // 判断是否已是好友
  const isFriend = await dao_friend.getIsFriend(user.id, query.friendId)
  if (isFriend) {
    res.end(JSON.stringify({
      code: 400,
      msg: '该用户已是你的好友',
    }))
    return
  }

  // 判断好友请求是否已存在
  // 由于数据库表设计有缺陷，这里 user 和 friend 需要反过来
  const friendReq = await dao_friend_request.getRequest(query.friendId, user.id)
  let result = null;
  if (friendReq) {
    result = await dao_friend_request.updateRequest(friendReq.id, 0, 0, query.content, new Date().getTime())
  } else {
    // 这里 user 和 friend 需要反过来
    result = await dao_friend_request.addRequest(query.friendId, user.id, query.content)
  }

  res.end(JSON.stringify({
    code: result ? 200 : 400,
    msg: result ? '好友请求发送成功' : '请求失败'
  }))

  if (result) {
    // 判断对方是否在线，在线的话发送 websocket 通知
    const socketUser = socket_user.getUserById(query.friendId)
    if (!socketUser) return
    process.io.to(socketUser.socketId).emit('message', {
      msgType: 'friendRequest',
      userInfo: {
        id: user.id,
        userName: user.userName,
        avatar: user.avatar,
        email: user.email,
      },
      content: query.content
    })
  }
}

// 获取好友请求列表
const getRequestList = async (req, res, next) => {
  res.set('content-type', 'application/json;charset=utf-8')
  const list = await dao_friend_request.getRequestList(req.session["userId"], req.query.lastTime)

  res.end(JSON.stringify({
    code: list ? 200 : 400,
    list: list
  }))
}

module.exports = {
  addRequest,
  getRequestList,
}