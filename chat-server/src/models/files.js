const DB = require('sequelize')
const { sequelize } = require('../utils/db');

// files 数据表
const File = sequelize.define('files', {
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
  // 文件名
  fileName: {
    type: DB.STRING,
    allowNull: false,
  },
  // 文件请求路径
  src: {
    type: DB.STRING,
    allowNull: false,
  },
  // 文件大小
  size: {
    type: DB.INTEGER,
  },
  createdAt: {
    type: DB.STRING,
  },
  type: {
    type: DB.INTEGER,
    default: 0,
    comment: '文件类型: 1:图片 2:文件 ',
  }
}, {
  freezeTableName: true,
  timestamps: false,
});

File.sync();

module.exports = File