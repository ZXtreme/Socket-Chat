const DB = require('sequelize')
const { sequelize } = require('../utils/db');

// emoticons 数据表
const Emoticon = sequelize.define('emoticons', {
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
  // 自定义表情的 src
  src: {
    type: DB.STRING,
    allowNull: false,
  },
  createdAt: {
    type: DB.STRING,
  },
}, {
  freezeTableName: true,
  timestamps: false,
});

Emoticon.sync();

module.exports = Emoticon