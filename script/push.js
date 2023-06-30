const run = require('./run.js');
const { series, task } = require('gulp')
const path = require('path')

const project = "Socket-Chat";
const remoteGH = "https://github.com/ZXtreme/Socket-Chat.git";
const branch = "main";
const rootPath = path.resolve(__dirname, '../')

// 将所有文件推送到 GitHub
const push = async () => {
  await run("git init", rootPath);
  await run("git add .", rootPath);
  await run(`git commit -m "deploy ${project} pages"`, rootPath);
  await run(`git checkout -b ${branch}`, rootPath);
  await run(`git remote add origin ${remoteGH}`, rootPath);
  await run(`git push -f origin ${branch}`, rootPath);
}

task('default', series(
  () => push()
))