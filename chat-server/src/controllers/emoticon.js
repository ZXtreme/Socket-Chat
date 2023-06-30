const dao_emoticon = require('../dao/emoticon')

// 获取自定义表情包
const getEmoticonList = async (req, res, next) => {
  res.set('content-type', 'application/json;charset=utf-8')

  const list = await dao_emoticon.getEmoticonList(req.session["userId"])

  res.end(JSON.stringify({
    code: list ? 200 : 400,
    list: list
  }))
}

// 添加自定义表情(文件在发送消息时已经保存到服务器，req.query.src 为保存到服务器的 src)
// 上传表情集成在上传文件中了
const addEmoticon = async (req, res, next) => {
  res.set('content-type', 'application/json;charset=utf-8')
  if (!req.query.src) {
    res.end(JSON.stringify({
      code: 400,
      msg: '缺少必要参数: src'
    }))
    return
  }

  const addRes = await dao_emoticon.addEmoticon({
    userId: req.session["userId"],
    createdAt: new Date().getTime(),
    src: req.query.src,
  })

  res.end(JSON.stringify({
    code: addRes ? 200 : 400,
    id: addRes.id,
    src: req.query.src,
  }))
}

module.exports = {
  getEmoticonList,
  addEmoticon,
}