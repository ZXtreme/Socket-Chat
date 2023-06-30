const DB = require('sequelize')
const { sequelize } = require('../utils/db');

// notifications 数据表
const Notification = sequelize.define('notifications', {
  id: {
    type: DB.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: "自增id"
  },
  // 用户id
  userId: {
    type: DB.INTEGER,
    allowNull: false,
  },
  // 类型
  type: {
    type: DB.INTEGER,
    comment: '0: 登录通知'
  },
  createdAt: {
    type: DB.STRING,
  },
}, {
  freezeTableName: true,
  timestamps: false,
});

Notification.sync();

module.exports = Notification