const { spawn } = require('child_process')

// 创建一个子进程，执行命令，执行完毕后将结果返回给父进程
module.exports = async (command, path) => {
  //获得我们的指令
  const [cmd, ...args] = command.split(' ')
  return new Promise((resolve, reject) => {
    const app = spawn(cmd, args, {
      cwd: path, //执行命令的路径
      stdio: 'inherit', //输出共享给父进程
      shell: true
    })
    //执行完毕关闭并resolve
    app.on('close', resolve)
  })
}