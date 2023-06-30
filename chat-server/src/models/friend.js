const DB = require('sequelize')
const { sequelize } = require('../utils/db');

// friends 数据表
const Friend = sequelize.define('friends', {
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
  // 好友id
  friendId: {
    type: DB.INTEGER,
    allowNull: false,
  },
  // 好友备注
  remark: {
    type: DB.STRING,
    comment: '好友备注'
  },
  // 创建时间
  createdAt: {
    type: DB.STRING,
  },
  // 最后更新时间
  updatedAt: {
    type: DB.STRING,
  },
}, {
  freezeTableName: true,
  timestamps: false,
});

Friend.sync();

module.exports = Friend