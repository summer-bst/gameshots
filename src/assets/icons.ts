// 该文件为全量引入svg
const req = require.context("./icons", false, /\.svg$/)
req.keys().map(req)
