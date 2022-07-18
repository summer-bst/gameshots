const path = require("path")
const { DefinePlugin } = require("webpack")
const HtmlWebpackPlugin = require("html-webpack-plugin") // html模板
const CopyPlugin = require("copy-webpack-plugin") // 负责拷贝文件
const TerserPlugin = require("terser-webpack-plugin") // 压缩js文件
const MiniCssExtractPlugin = require("mini-css-extract-plugin") // 抽取css插件
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin") // 优化和压缩 CSS。
const ESLintPlugin = require("eslint-webpack-plugin") // eslint插件
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin") // ts类型检测
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin") // 开发时不会频繁刷新网页
const GenerateJsonPlugin = require("generate-json-webpack-plugin") // 自动生成json
// const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer")

const configs = require("./development.config.json") // 自定义多页配置
const manifestData = require("../src/config/manifest.js") // overwolf配置
const { version } = require("../package.json") // 版本号
const moment = require("moment") 

// const px2rem = require("postcss-px2rem-exclude") //px转换rem插件
const envConfig = require("./env")
const systemUserName = require("os").userInfo().username// 系统用户名

module.exports = (env) => {
    const nodeEnv = process.env.NODE_ENV
    const isLocalBuild = nodeEnv === "localBuild"
    const isEnvDevelopment = env.development
    const isEnvProduction = env.production
    const entry = {}
    const plugins = []
    const shouldMap = nodeEnv !== "publish"

    const defaultStyleLoaders = [
        isEnvDevelopment && "style-loader",
        isEnvProduction && {
            loader: MiniCssExtractPlugin.loader
        },
        {
            loader: "css-loader",
            options: {
                sourceMap: true
            }
        }
    ].filter(Boolean)
    configs
        .filter((e) => !(e.isDevelopment && isEnvProduction))
        .forEach((e) => {
            entry[e.name] = e.entry
            plugins.push(
                new HtmlWebpackPlugin({
                    template: e.template, // 模板路径
                    filename: `${e.name}/index.html`, // 输出的html文件名和位置
                    favicon: "public/favicon.ico",
                    title: e.title,
                    hash: true, // 引入的js会带上hash参数,
                    inject: e.inject,
                    chunks: [ e.name ], // 只引入当前页面所需资源
                    minify: {
                        useShortDoctype: true, // doctype用简短的 (HTML5) doctype替换
                        removeScriptTypeAttributes: true, // type="text/javascript"从script标签中删除。其他type属性值保持不变
                        removeStyleLinkTypeAttributes: true, // type="text/css"从style和link标记中删除。其他type属性值保持不变
                        removeAttributeQuotes: true, // 去掉双引号html
                        collapseWhitespace: true, // 折叠html成一行
                        minifyJS: true,
                        minifyCSS: true,
                        minifyURLs: true
                    }
                })
            )
        })

    return {
        mode: isEnvDevelopment
            ? "development"
            : "production",
        entry,
        output: {
            path: path.resolve(__dirname, `../dist/${isLocalBuild
                ? "build"
                : `Gameshots-v${version}-${nodeEnv}-${moment().format("YYYY-MM-DD HH-mm-ss")}`}`),
            publicPath: "/",
            filename: "[name]/js/[hash].js", // 写成bundle.[hash].js会将文件名hash化  bundle.[hash:8].js只有8位hash
            chunkFilename: "[name]/js/[hash].js",
            assetModuleFilename: "static/images/[hash][ext][query]", // 设置静态资源路径
            clean: true // 打包前清空文件夹
        },
        devtool: isEnvDevelopment
            ? "eval-cheap-module-source-map"
            : shouldMap && "source-map",
        devServer: {
            static: {
                directory: `C:\\Users\\${systemUserName}\\Videos\\Overwolf`, // 暂时这么写
                watch: false
                // publicPath: '/Game TV'
            },
            setupMiddlewares: (middlewares) => {
                const WebSocket = require("ws")

                const wss = new WebSocket.Server({
                    port: 4000
                }) // 服务端口4000
                wss.on("connection", (ws) => {
                    ws.on("message", (message) => {
                        // 打印客户端监听的消息
                        wss.clients.forEach((e) => {
                            if (e.readyState === WebSocket.OPEN) {
                                e.send(message)
                            }
                        })
                    })
                })

                return middlewares
            },
            client: {
                overlay: {
                    // 出现编译器错误或警告时，在浏览器中显示全屏覆盖。默认禁用。如果只想显示编译器错误
                    errors: true,
                    warnings: false
                }
            },
            open: configs[0].name, // 打开浏览器
            port: "auto",
            hot: true,
            compress: true // 设置开启压缩
        },
        optimization: {
            // 优化项
            minimize: isEnvProduction,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        compress: true,
                        format: {
                            comments: false // 删除所有注释
                        }
                    },
                    extractComments: false // 禁用注释单独抽离
                }),
                new CssMinimizerPlugin({
                    minimizerOptions: {
                        preset: [
                            "default",
                            {
                                discardComments: { removeAll: true } // 移除注释
                            }
                        ]
                    }
                })
            ],
            moduleIds: "deterministic", // 使构建文件hash值不需要改变的不变化
            runtimeChunk: "single", // 单独分离出webpack的一些运行文件
            splitChunks: {
                name: "chunks",
                chunks: "all" // 对所有模块进行优化
            }
        },
        plugins: [
            ...plugins,
            isEnvProduction && new CopyPlugin({
                patterns: [
                    {
                        from: "public",
                        force: true,
                        globOptions: {
                            dot: true,
                            gitignore: true,
                            ignore: [ "**.html" ]
                        }
                    }
                ]
            }),
            // new BundleAnalyzerPlugin(), // 打包分析工具
            new GenerateJsonPlugin("manifest.json", manifestData),
            new MiniCssExtractPlugin({
                filename: "static/css/[name].[contenthash:8].css",
                chunkFilename: "static/css/[id].[contenthash:8].chunk.css"
            }),
            new ReactRefreshWebpackPlugin({
                overlay: false // 这里面配置将来可以去掉等待更新
            }),
            new ForkTsCheckerWebpackPlugin(),
            new ESLintPlugin({
                extensions: [ ".js", ".json", ".ts", ".tsx" ],
                exclude: [ "node_modules", "webpack", "dist" ],
                cache: true,
                cacheLocation: "node_modules/.cache/.eslintcache" // 缓存eslint配置
            }),
            new DefinePlugin({
                ...envConfig[process.env.NODE_ENV],
                NODE_ENV: JSON.stringify(process.env.NODE_ENV),
                VERSION: JSON.stringify(version)
            })
        ].filter(Boolean),
        module: {
            rules: [
                {
                    test: /\.(ts|tsx)$/,
                    loader: "ts-loader",
                    options: {
                        transpileOnly: true
                    }
                },
                {
                    test: /\.css$/i,
                    use: defaultStyleLoaders
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        ...defaultStyleLoaders,
                        {
                            loader: "resolve-url-loader", // 用于重写less,scss中引入的资源路径，防止webpack找不到路径报错
                            options: {
                                sourceMap: true
                            }
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                sourceMap: true
                            }
                        }
                    ]
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif|woff|woff2|eot|ttf|otf)$/i,
                    exclude: [ path.join(__dirname, "../src/assets/icons") ],
                    include: [ path.join(__dirname, "../src") ],
                    type: "asset"
                },
                {
                    test: /\.svg$/,
                    include: [ path.join(__dirname, "../src/assets/icons") ],
                    loader: "svg-sprite-loader",
                    options: {
                        symbolId: "icon-[name]"
                    }
                }
            ]
        },
        resolve: {
            mainFiles: [ "index" ],
            // 引入文件时忽略后缀名
            extensions: [ ".ts", ".tsx", ".js", ".jsx", ".scss", ".json", ".css", ".svg" ],
            // 设置别名
            alias: {
                "@component": path.resolve(__dirname, "../src/page/component"),
                "@assets": path.resolve(__dirname, "../src/assets"),
                "@config": path.resolve(__dirname, "../src/config"),
                "@utils": path.resolve(__dirname, "../src/utils")
            }
        }
    }
}
