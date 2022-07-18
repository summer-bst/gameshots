const { version, author } = require("../../package.json")
const defaultHotKeys = require("./defaultHotKeys")
let hotkeys = {}
defaultHotKeys.forEach((e) => {
    hotkeys[e.name] = {
        title: e.title,
        "action-type": e.actionType || "custom",
        default: e.binding,
        passthrough: true
        // hold: true
    }
})
const gameIds = [ 21566, 7314, 5426, 10902, 21640, 7764, 10906, 21626, 10798, 5855, 21216, 10826 ]
const isLocalBuild = process.env.NODE_ENV === "localBuild"
module.exports = {
    manifest_version: 1, // 总是1
    type: "WebApp", // 总是这个值
    meta: {
        name: "Gameshots", 
        author,
        version,
        "minimum-overwolf-version": "0.198.0", // 最低版本
        description: "Gameshots by game.tv - Record, capture, save and share your gameplay in UHD quality.",
        dock_button_title: "Gameshots",
        icon: "icons/yellow.png",
        icon_gray: "icons/white.png",
        launcher_icon: "icons/yellow.ico",
        window_icon: "icons/yellow.png"
    },
    permissions: [
        "Camera",
        "Microphone",
        "Hotkeys",
        "GameInfo",
        "Extensions",
        "FileSystem",
        "Streaming",
        "DesktopStreaming",
        "Profile",
        "VideoCaptureSettings",
        "Tray"
    ],
    // url_protocol: "outplayed://gameshots",
    data: {
        start_window: "background",
        windows: {
            background: {
                file: "background/index.html",
                is_background_page: true,
                dev_tools_window_style: true
                // debug_url: !isPublish && "http://localhost:8080/background"
            },
            desktop: {
                file: "desktop/index.html",
                desktop_only: true,
                use_os_windowing: true,
                native_window: true,
                resizable: true,
                show_in_taskbar: true,
                allow_local_file_access: true, // 允许读取本地文件
                transparent: true,
                override_on_update: true,
                // focus_game_takeover: "ReleaseOnHidden",
                // focus_game_takeover_release_hotkey: "showHideDesktop",
                dev_tools_window_style: true, // 打开调试窗口
                debug_url: isLocalBuild && "http://localhost:8080/desktop",
                size: {
                    width: 1280,
                    height: 720
                },
                min_size: {
                    width: 1280,
                    height: 720
                }
            },
            inGame: {
                file: "desktop/index.html",
                in_game_only: true,
                // use_os_windowing: true,
                // native_window: true,
                resizable: true,
                show_in_taskbar: true,
                allow_local_file_access: true, // 允许读取本地文件
                transparent: true,
                override_on_update: true,
                focus_game_takeover: "ReleaseOnLostFocus", // 该窗口显示时自动进入独占模式
                // focus_game_takeover_release_hotkey: "showHideDesktop",
                dev_tools_window_style: true, // 打开调试窗口
                // debug_url: "http://localhost:8080/desktop",
                size: {
                    width: 1280,
                    height: 720
                },
                min_size: {
                    width: 1280,
                    height: 720
                }
            },
            hotKeyTips: {
                file: "hotKeyTips/index.html",
                in_game_only: true,
                // desktop_only: true,
                resizable: false,
                transparent: true,
                dev_tools_window_style: true,
                override_on_update: true,
                // focus_game_takeover: "ReleaseOnHidden",
                // focus_game_takeover_release_hotkey: "showHideOverlay",
                // debug_url: "http://localhost:8080/hotKeyTips",
                topmost: true, // 处于最上层
                size: {
                    width: 510,
                    height: 200
                },
                min_size: {
                    width: 510,
                    height: 200
                }
            },
            recordError: {
                file: "recordError/index.html",
                in_game_only: true,
                // desktop_only: true,
                resizable: false,
                transparent: true,
                dev_tools_window_style: true,
                override_on_update: true,
                // debug_url: "http://localhost:8080/recordError",
                topmost: true, // 处于最上层
                size: {
                    width: 520,
                    height: 200
                },
                min_size: {
                    width: 520,
                    height: 200
                }
            },
            startRecord: {
                file: "message/index.html",
                in_game_only: true,
                // desktop_only: true,
                resizable: false,
                transparent: true,
                dev_tools_window_style: true,
                override_on_update: true,
                topmost: true, // 处于最上层
                // debug_url: "http://localhost:8080/message",
                size: {
                    width: 280,
                    height: 90
                },
                min_size: {
                    width: 280,
                    height: 90
                },
                start_position: {
                    top: 300,
                    right: 20
                }
            },
            stopRecord: {
                file: "message/index.html",
                in_game_only: true,
                resizable: false,
                transparent: true,
                dev_tools_window_style: true,
                override_on_update: true,
                topmost: true, // 处于最上层
                size: {
                    width: 280,
                    height: 90
                },
                min_size: {
                    width: 280,
                    height: 90
                },
                start_position: {
                    top: 300,
                    right: 20
                }
            }
        },
        game_targeting: {
            type: "dedicated", // "all"所有游戏（例如语音通信应用程序） / "none 无" / "dedicated 专用于一款或多款游戏。",
            game_ids: gameIds
        },
        game_events: gameIds,
        launch_events: [
            {
                event: "LaunchWithOverwolf", // [“GameLaunch”、“AllGamesLaunch”、“LaunchWithOverwolf”]不要改，会影响overlay页面设置
                event_data: {
                    game_ids: gameIds
                },
                start_minimized: false
            },
            // {
            //     event: "AllGamesLaunch", 
            //     event_data: {
            //         game_ids: [ 21566, 5426, 10902 ]
            //     },
            //     start_minimized: false
            // },
            {
                event: "GameLaunch", 
                event_data: {
                    game_ids: gameIds
                },
                start_minimized: false
            }
        ],
        hotkeys,
        protocol_override_domains: {
            googlesyndication: "http"
        },
        externally_connectable: {
            matches: [
                "http://*.overwolf.com",
                "https://*.overwolf.com",
                "https://overwolf.github.io",
                "https://*.google-analytics.com",
                "http://*.google-analytics.com",
                "https://www.googleapis.com",
                "https://discord.gg/v5cfBTq",
                "https://twitter.com/",
                "https://www.facebook.com",
                "https://www.reddit.com",
                "https://tournaments-engg.gtvinternal.net",
                "https://uat.gtvinternal.net",
                "https://cloud.game.tv",
                "https://www.game.tv"
            ]
        },
        // 插件设置
        "extra-objects": {
            "bluestacks-io-plugin": {
                file: "bluestacks-io-plugin.dll",
                class: "overwolf.plugins.bluestacksio.BlueStacksIOPlugin"
            },
            "process-manager-plugin": {
                file: "process_manager.dll",
                class: "com.overwolf.com.overwolf.procmgr.ProcessManager"
            }
        },
        force_browser: "user", // 使用用户默认浏览器打开连接
        disable_cleanup: true, // 应用程序的localStorage数据将不会在卸载应用程序后清理
        developer: {
            enable_auto_refresh: true,
            reload_delay: 1000,
            filter: "*.*"
        },
        auto_relaunch_on_crash: true// 应用崩溃将重启应用
    }
}
