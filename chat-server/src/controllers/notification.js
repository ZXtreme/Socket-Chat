const dao_notification = require('../dao/notification')

// 获取系统通知记录
const getNotificationList = async (req, res, next) => {
  res.set('content-type', 'application/json;charset=utf-8')

  const query = req.query;
  query.lastTime = query.lastTime || new Date().getTime()

  const list = await dao_notification.getNotificationList(req.session["userId"], query.lastTime)

  res.end(JSON.stringify({
    code: list ? 200 : 400,
    list: list
  }))
}

module.exports = {
  getNotificationList,
}