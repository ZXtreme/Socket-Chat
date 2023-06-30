const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000/api',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/api': ''
        }
      },
      '/socket.io': {
        target: 'ws://localhost:3010',
        changeOrigin: true,
        logLevel: 'debug'
      },
      '/download': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/download': ''
        }
      },
    }
  }
});
