const dao_user = require('../dao/user')
const dao_session = require('../dao/session')
const md5 = require('md5');

// 注册用户
const signin = async (req, res, next) => {
  res.set('content-type', 'application/json;charset=utf-8')
  const { userName, password, email, avatar } = req.body;

  // 先判断用户名和密码是否为空
  if (!userName || !password) {
    res.end(JSON.stringify({
      code: 400,
      msg: 'username 和 password 不能为空'
    }))
    return
  }

  // 查询用户是否存在
  const isExisted = await dao_user.isExisted(userName);
  if (isExisted) {
    res.end(JSON.stringify({
      code: 400,
      msg: '用户已存在'
    }))
    return
  }

  const timestamps = new Date().getTime()
  // 写入数据库
  let user = await dao_user.addUser({ userName, password: md5(password), email, avatar, createdAt: timestamps, updatedAt: timestamps });
  user = user.get({ plain: true })   // 将 Sequelize 模型实例对象转换为纯 JSON 对象
  if (user.id) {
    // 自动创建系统通知会话
    await dao_session.createSession(user.id, -1, '', timestamps, 2)

    // 返回响应
    res.end(JSON.stringify({
      code: 200,
      msg: '用户注册成功',
      userInfo: {
        id: user.id,
        userName,
        email,
        avatar,
      }
    }))
  }
}

// 用户登录 
const login = async (req, res, next) => {
  res.set('content-type', 'application/json;charset=utf-8')
  const { userName, password } = req.body;

  // 先判断用户名和密码是否为空
  if (!userName || !password) {
    res.end(JSON.stringify({
      code: 400,
      data: '用户名和密码不能为空'
    }))
    return
  }

  // 查询用户是否存在
  const user = await dao_user.isExisted(userName);
  if (!user) {
    res.end(JSON.stringify({
      code: 400,
      msg: '用户不存在',
    }))
    return
  }

  if (user.password !== md5(password)) {
    res.end(JSON.stringify({
      code: 400,
      msg: '密码错误',
    }))
    return
  }

  // 登录成功，将 id 写入 session
  req.session["userId"] = user.id
  res.end(JSON.stringify({
    code: 200,
    msg: "登录成功",
    userInfo: {
      id: user.id,
      userName: user.userName,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt
    }
  }))
}

// 判断用户是否处于登录状态，若是则返回用户信息
const getLogin = async (req, res, next) => {
  console.log(111, req.session["userId"]);
  res.set('content-type', 'application/json;charset=utf-8')
  const user = await dao_user.getUserById(req.session["userId"])

  res.end(JSON.stringify({
    code: 200,
    msg: "登录成功",
    userInfo: {
      id: user.id,
      userName: user.userName,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt
    }
  }))
}

// 退出登录
const logout = async (req, res, next) => {
  res.set('content-type', 'application/json;charset=utf-8')
  delete req.session.userId
  res.end(JSON.stringify({
    code: 200,
    msg: '退出成功'
  }))
}

// 根据 id 查询用户
const getUserInfo = async (req, res, next) => {
  res.set('content-type', 'application/json;charset=utf-8')

  if (!req.query.userId) {
    res.end(JSON.stringify({
      code: 400,
      msg: "缺少必要参数: userId",
    }))
    return
  }

  const userInfo = await dao_user.getUserById(req.query.userId)
  const { id, userName, avatar, email } = userInfo
  res.end(JSON.stringify({
    code: 200,
    userInfo: { id, userName, avatar, email },
  }))
}

module.exports = {
  signin,
  login,
  getLogin,
  logout,
  getUserInfo,
};