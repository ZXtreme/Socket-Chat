const Session = require('../models/session.js')
const User = require('../models/user.js')
const { Op, Sequelize } = require("sequelize");

const utils = require('../utils/utils');
const DB = require('sequelize')

// 判断会话是否存在
const getSessionExist = async (userId, receiverId) => {
  const res = await Session.findOne({
    where: {
      userId: userId,
      receiverId: receiverId,
    }
  })

  return res && res.sessionId
}

// 创建会话
const createSession = async (uid1, uid2, lastChat, timestamps, type = 0) => {
  const sessionId = utils.createSessionId()
  const res1 = await Session.create({
    sessionId,
    userId: uid1,
    receiverId: uid2,
    lastChat: lastChat,
    updatedAt: timestamps,
    type,
  })
  // 如果不是私聊，只需要创建一个session
  if (type !== 0) return res1 ? sessionId : undefined

  const res2 = await Session.create({
    sessionId,
    userId: uid2,
    receiverId: uid1,
    lastChat: lastChat,
    updatedAt: timestamps,
    type
  })

  return res1 && res2 ? sessionId : undefined
}

// 更新会话内容和数量，并更新时间，isNoti: 是否是通知
const updateSession = async ({ sessionId, lastChat, timestamps, userId, isNoti = false }) => {
  if (!isNoti) {
    // 更新其他人的 session
    const res1 = await Session.update({
      lastChat,
      updatedAt: timestamps,
      read: DB.fn('1 + abs', DB.col('read'))   // 将原本的未读数量 += 1
    }, {
      where: {
        sessionId,
        userId: {
          [Op.not]: userId  // userId 不等于 userId 的时候
        },
      },
    })

    // 更新自己的 session
    const res2 = await Session.update({
      lastChat,
      updatedAt: timestamps,
    }, {
      where: {
        sessionId,
        userId
      }
    })
    return res1 && res2 && sessionId
  } else {
    // 更新通知的 session
    const res = await Session.update({
      lastChat,
      updatedAt: timestamps,
      read: DB.fn('1 + abs', DB.col('read'))
    }, {
      where: {
        sessionId,
        userId
      },
    })
    return res && sessionId
  }

}

// 查询会话列表，找到 updatedAt 小于 lastTime 且最接近的 20 条数据
const getSessionList = async (userId, lastTime) => {
  Session.belongsTo(User, { foreignKey: 'receiverId', targetKey: 'id' }) // 表的连接

  lastTime = lastTime || new Date().getTime()
  const list = await Session.findAll({
    where: {
      userId,
      updatedAt: {
        [Op.lt]: lastTime,  // updatedAt 小于 lastTime
      },
    },
    limit: 20,
    attributes: ['sessionId', 'lastChat', 'updatedAt', 'type', 'receiverId', 'read',
      [Sequelize.col('user.avatar'), 'cover'],          // 对方的头像，重命名为第二个参数
      [Sequelize.col('user.userName'), 'sessionName'],  // 对方的用户名
    ],
    order: [
      ['updatedAt', 'DESC']
    ],
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'userName', 'avatar', 'email'],
    }],
  })

  // 修改 系统通知 会话的信息
  list.find(item => {
    if (item.dataValues.type == 2) {
      item.dataValues.cover = '/logo.svg'
      item.dataValues.sessionName = 'Socket-Chat 系统通知'
      return true
    }
  })

  return list
}

// 清空 session 未读数量
const resetUnread = async (sessionId, userId) => {
  const res = await Session.update({
    read: 0
  }, {
    where: {
      sessionId,
      userId,
    }
  })

  return Boolean(res)
}

// 查看未读条数
const getTotalUnread = async (userId) => {
  const res = await Session.findAll({
    where: { userId, },
    attributes: [
      [DB.fn('SUM', DB.col('read')), 'total']
    ],
    raw: true
  })

  return res[0].total * 1;
}

module.exports = {
  getSessionExist,
  createSession,
  updateSession,
  getSessionList,
  resetUnread,
  getTotalUnread,
}