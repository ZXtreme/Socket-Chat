const DB = require('sequelize')
const { sequelize } = require('../utils/db');

// session 数据表
const Session = sequelize.define('sessions', {
  id: {
    type: DB.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: "自增id"
  },
  sessionId: {
    type: DB.STRING,
    allowNull: false,
  },
  // 用户id
  userId: {
    type: DB.INTEGER,
    allowNull: false,
  },
  // 接收者id
  receiverId: {
    type: DB.INTEGER,
    allowNull: false,
  },
  // 最后一次聊天记录
  lastChat: {
    type: DB.STRING,
  },
  type: {
    type: DB.INTEGER,
    defaultValue: 0,
    comment: '0:一对一聊天  1:群聊  2:系统通知'
  },
  // 未读条数
  read: {
    type: DB.INTEGER,
    defaultValue: 0,
    comment: '未读条数'
  },
  // 更新时间
  updatedAt: {
    type: DB.STRING,
    commit: '更新时间'
  }
}, {
  freezeTableName: true,
  timestamps: false,
});

Session.sync();

module.exports = Session