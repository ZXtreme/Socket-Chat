// sequelize连接数据库
const DB = require('sequelize')

const sequelize = new DB.Sequelize('socket_chat', 'root', 'ZRCzrc0808!', {
  host: 'localhost',   // ip地址
  dialect: 'mysql',    // 数据库种类
  define: {
    charset: 'utf8mb4'   // 字符集
  }
});

module.exports = {
  sequelize
}