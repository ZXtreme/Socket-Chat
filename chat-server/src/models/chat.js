const DB = require('sequelize')
const { sequelize } = require('../utils/db');

// chats 数据表
const Chat = sequelize.define('chats', {
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
  // 发送者id
  senderId: {
    type: DB.INTEGER,
    allowNull: false,
  },
  // 接收者id
  receiverId: {
    type: DB.INTEGER,
    allowNull: false,
  },
  // 内容
  content: {
    type: DB.STRING(5000),
    comment: 'type 为0时:聊天信息  为1/2/3:文件地址   为4:通知内容'
  },
  // 类型
  type: {
    type: DB.INTEGER,
    defaultValue: 0,
    comment: '0:文字  1: 图片  2:文件  3:表情包  4:聊天窗口内通知  5:视频通话'
  },
  sort: {
    type: DB.INTEGER,
    defaultValue: 0,
    comment: '0:私聊   1: 群聊'
  },
  // 更新时间
  updatedAt: {
    type: DB.STRING,
    comment: '更新时间, 时间戳'
  },
  // 用于存储其它信息，存储类型为JSON，可以存储如文件的信息
  others: {
    type: DB.STRING(1000),
    comment: '用于存储其它信息，存储类型为JSON，可以存储如文件的信息',
  },
}, {
  freezeTableName: true,
  timestamps: false,
});

Chat.sync();

module.exports = Chat