const dao_session = require('../dao/session')

// 获取 session 列表
const getSessionList = async (req, res, next) => {
  res.set('content-type', 'application/json;charset=utf-8')

  // 以时间戳为分页标识，因为以页数的话可能会导致新增会话后出现重复的情况
  const list = await dao_session.getSessionList(req.session["userId"], req.query.lastTime)

  const total = await dao_session.getTotalUnread(req.session["userId"])

  res.end(JSON.stringify({
    code: list ? 200 : 400,
    list: list,
    total,
  }))
}

// 更新通知或对话的 session
const updateSession = async (userId, receiverId, lastChat, timestamps) => {
  // 先判断是否存在会话
  const sessionId = await dao_session.getSessionExist(userId, receiverId);

  // isNoti：是否为系统通知，如果 receiverId 为 -1，则说明为系统通知
  const res1 = await dao_session.updateSession({ sessionId, lastChat, timestamps, userId, isNoti: receiverId == -1 })

  return res1 && sessionId
}

// 清空 session 未读数量
const resetUnread = async (req, res, next) => {
  // 判断是否传参
  if (!req.query.sessionId) {
    res.end(JSON.stringify({
      code: 400,
      msg: '缺少必要参数: sessionId',
    }))
    return
  }

  res.set('content-type', 'application/json;charset=utf-8')

  const resetRes = await dao_session.resetUnread(req.query.sessionId, req.session["userId"])

  res.end(JSON.stringify({
    code: resetRes ? 200 : 400,
    msg: resetRes ? 'success' : 'fail'
  }))
}

module.exports = {
  getSessionList,
  updateSession,
  resetUnread,
}