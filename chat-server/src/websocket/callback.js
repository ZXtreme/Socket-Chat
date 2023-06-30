const dao_session = require("../dao/session");

// 重置未读消息数量
const resetUnread = function(params) {
  dao_session.resetUnread(params.sessionId, params.userId)
}

module.exports = {
  resetUnread,
}