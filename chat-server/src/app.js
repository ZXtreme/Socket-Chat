const express = require('express')
const multer = require('multer')
const http = require('http')
const userRouter = require('./routes/user')
const friendRouter = require('./routes/friend')
const sessionRouter = require('./routes/session')
const chatRouter = require('./routes/chat')
const friendRequestRouter = require('./routes/friend_request')
const notificationRouter = require('./routes/notification')
const fileRouter = require('./routes/file')
const emoticonRouter = require('./routes/emoticon')
const Session = require('express-session')
const middleware = require('./middleware/middleware')
const { filePath } = require('./utils/utils')

const app = express()

app.use(multer({
  limits: { fileSize: 2 * 1024 * 1024 }
}).array('file'))   // 接受一个以 file 命名的文件数组, 这些文件的信息保存在 req.files
app.use(express.static(filePath));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// express-session 中间件会在服务器响应时自动将包含会话标识符的 Cookie 返回给前端
const session = Session({
  secret: "^_^",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 12 * 60 * 60 * 1000
  }
})
const sharedsession = require('express-socket.io-session')

app.use(session);
app.use(middleware.authGuard)

app.use('/api/users', userRouter)
app.use('/api/friends', friendRouter)
app.use('/api/sessions', sessionRouter)
app.use('/api/chats', chatRouter)
app.use('/api/friend_requests', friendRequestRouter)
app.use('/api/notis', notificationRouter)
app.use('/api/files', fileRouter)
app.use('/api/emoticons', emoticonRouter)


// 创建 HTTP server
const server = http.createServer(app);
const socket = require("./websocket/sockio.js")
process.io = socket.getSocket(server); // 使用 http 协议建立 socket
process.io.use(sharedsession(session))
server.listen(3010);

app.listen(3000)