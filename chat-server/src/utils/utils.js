const path = require('path')

// 生成 uuid
const guid = function() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }
  return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
}

// 生成 sessionId
const createSessionId = function() {
  return Math.round(Math.random() * Math.pow(10, 6)).toString()
}

// 计算占位图的宽高
const getPHSize = function(width, height, maxWidth = 200, minWidth = 50, maxHeight = 200, minHeight = 50) {
  // 等比例缩放到 minWidth <= width <= maxWidth, minHeight <= height <= maxHeight
  if (width > maxWidth) {
    height *= maxWidth / width
    width = maxWidth
  }

  if (height > maxHeight) {
    width *= maxHeight / height
    height = maxHeight
  }

  if (width < minWidth) {
    height *= minWidth / width
    width = minWidth
    height = height > maxHeight ? maxHeight : height
  }

  if (height < minHeight) {
    width *= minHeight / height
    height = minHeight
    width = width > maxWidth ? maxWidth : width
  }

  return { width: Math.ceil(width), height: Math.ceil(height) }
}

// 文件保存路径
const filePath = path.resolve(__dirname, '../../uploadFile')

// 敏感词词库路径
const sensitiveWordsPath = path.join(__dirname, './sensitive_words.txt')

// 请求图片的服务器路径
// const serverURL = 'http://119.91.63.11:3000'
const serverURL = 'http://localhost:3000'

// 客户端路径
// const clientURL = 'http://119.91.63.11'
const clientURL = 'http://localhost:8080'

module.exports = {
  guid,
  createSessionId,
  filePath,
  serverURL,
  clientURL,
  getPHSize,
  sensitiveWordsPath
}