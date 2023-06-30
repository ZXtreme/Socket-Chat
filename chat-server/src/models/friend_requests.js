const DB = require('sequelize')
const { sequelize } = require('../utils/db');

// friend_requests 数据表
const FriendRequest = sequelize.define('friend_requests', {
  id: {
    type: DB.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: "自增id"
  },
  // 请求添加的好友id
  userId: {
    type: DB.INTEGER,
    allowNull: false,
  },
  // 请求者
  friendId: {
    type: DB.INTEGER,
    allowNull: false,
  },
  // 请求理由
  content: {
    type: DB.STRING,
    comment: '请求理由'
  },
  // 是否已读
  read: {
    type: DB.INTEGER,
    defaultValue: 0,
    comment: '0:未读  1:已读'
  },
  // 是否处理
  handle: {
    type: DB.INTEGER,
    defaultValue: 0,
    comment: '0:未处理  1:已处理'
  },
  createdAt: {
    type: DB.STRING,
  },
}, {
  freezeTableName: true,
  timestamps: false,
});

FriendRequest.sync();

module.exports = FriendRequest