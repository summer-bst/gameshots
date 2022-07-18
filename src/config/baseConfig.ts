const AppName = "Gameshots"
const AppFavoriteName = "GameshotsFavorite"// 收藏夹文件名
const VideoCacheFileName = "VideoCache.json"// 视频信息文件
const configFileName = "setting.json"// 配置文件
const subFolderName = "cacheFolderGameshots"// 暂时生成的视频文件夹
const clientId = CLIEN_ID

const windowNames = {
    background: "background",
    inGame: "inGame",
    hotKeyTips: "hotKeyTips",
    desktop: "desktop",
    startRecord: "startRecord",
    stopRecord: "stopRecord",
    recordError: "recordError"
}

enum WindowStateEx {
    CLOSED = "closed",
    MINIMIZED = "minimized",
    HIDDEN = "hidden",
    NORMAL = "normal",
    MAXIMIZED = "maximized"
}
enum Hotkeys {
    saveInstantReplay = "saveInstantReplay",
    showHideDesktop = "showHideDesktop",
    showHideOverlay = "showHideOverlay"
}

export {
    AppName,
    VideoCacheFileName,
    configFileName,
    subFolderName,
    windowNames,
    clientId,
    WindowStateEx,
    Hotkeys,
    AppFavoriteName
}
