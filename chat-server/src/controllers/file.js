const dao_file = require('../dao/file')
const dao_emotion = require('../dao/emoticon')
const { getPHSize, serverURL, filePath } = require('../utils/utils.js')
const fs = require('fs')
const path = require('path')
const getPixels = require("get-pixels")

// 获取文件列表
const getFileList = async (req, res, next) => {
  res.set('content-type', 'application/json;charset=utf-8')
  const query = req.query;
  query.lastTime = query.lastTime || new Date().getTime()

  const list = await dao_file.getFileList(req.session['userId'], query.lastTime)

  res.end(JSON.stringify({
    code: list ? 200 : 400,
    list: list
  }))
}

// 上传文件 / 表情  （当传入 emoticon:ture 参数时，为上传表情包）
const uploadFile = async (req, res, next) => {
  res.set('content-type', 'application/json;charset=utf-8')
  const file = req.files[0]
  if (!file || file.size > 2 * 1024 * 1024) {
    res.end(JSON.stringify({
      code: 400,
      msg: "file doesn't exist or too large"
    }))
    return
  }

  const userId = req.session["userId"]

  // 获取文件类型
  const fileType = /image\/png|image\/jpeg|image\/gif/.test(file.mimetype) ? 'img' : 'file'
  if (req.body.emoticon && fileType === 'file') {
    res.end(JSON.stringify({
      code: 400,
      msg: "表情包只能为 jpg/png/gif 格式"
    }))
    return
  } else if (!userId && req.body.emoticon) {
    // 判断是否登录
    res.end(JSON.stringify({
      code: 401,
      msg: '添加表情需要登录哦',
    }))
    return
  }

  // 判断是否存在文件夹, 没有就创建
  fs.existsSync(filePath) || fs.mkdirSync(filePath)

  const timestamps = new Date().getTime()
  const ext = path.extname(file.originalname)
  const dir = path.join(filePath, timestamps + ext)

  fs.writeFile(dir, file.buffer, async function(err) {
    if (err) {
      res.end(JSON.stringify({
        code: 400,
        msg: '文件写入失败',
      }))
      return
    }

    // 文件写入成功
    const src = `${serverURL}/${timestamps}${ext}`

    if (req.body.emoticon && fileType === 'img') {
      new Promise((resolve, reject) => {
        // 判断是否是图片
        getPixels(dir, function(err, pixels) {
          if (err) { console.log("Bad image path"); return }
          resolve(pixels.shape)
        })
      }).then(async (size) => {
        const calcSize = getPHSize(size[size.length - 3], size[size.length - 2])

        const addRes = await dao_emotion.addEmoticon({
          userId,
          createdAt: timestamps,
          src: src + `?size=${calcSize.width}x${calcSize.height}`
        })
        res.end(JSON.stringify({
          code: addRes ? 200 : 400,
          emoticonId: addRes.id,
          src: src,
          fileName: file.originalname,
          size: calcSize,
        }))
      })

    } else {
      res.end(JSON.stringify({
        code: 200,
        msg: 'upload file success',
        src: src,
        fileName: file.originalname,
      }))
    }

  })
}

module.exports = {
  getFileList,
  uploadFile,
}