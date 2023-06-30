// 存储所有连接上 socket 的用户信息与对应的 socket
const users = [];

// 获取指定 socketId 的用户
function getCurrentUser(socketId) {
  return users.find(user => user.socketId === socketId)
}

// 新用户加入连接
function userJoin(socketId, userInfo) {
  const user = Object.assign({ socketId }, userInfo)   // 将两个对象内的所有属性合并成一个对象
  users.push(user)

  return user;
}

// 获取指定 用户Id 的用户
function getUserById(id) {
  return users.find(user => user.id === id * 1)
}

// 用户断开连接
function removeUser(socketId) {
  const index = users.findIndex(item => item.socketId === socketId)
  if (index != -1) users.splice(index, 1)
}

module.exports = {
  userJoin,
  getCurrentUser,
  getUserById,
  removeUser,
}