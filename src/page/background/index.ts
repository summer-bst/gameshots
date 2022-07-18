import axios from "axios"
import { OWGames, OWWindow, OWGameListener, OWHotkeys } from "@overwolf/overwolf-api-ts"
import { WindowStateEx, windowNames, Hotkeys, configFileName } from "@config/baseConfig"
import { addGameInfoListener, readFileContents } from "@utils/overwolfUtils"
import gamesConfigs from "./dealGameEvents"
import { stopRecording, addQueue } from "./saveInstantReplay"
import defaultConfig from "@config/defaultSettings"

const desktop = new OWWindow(windowNames.desktop) // 正常页面
const inGame = new OWWindow(windowNames.inGame) // 正常页面
const startRecord = new OWWindow(windowNames.startRecord) // 开始录制提示
const stopRecord = new OWWindow(windowNames.stopRecord) // 结束录制提示
const hotKeyTips = new OWWindow(windowNames.hotKeyTips) // 消息提示页面
const recordError = new OWWindow(windowNames.recordError) // 错误提示页面
let settingConfig: SettingConfig | undefined = undefined
let isSupportGame = false

const fortniteGameListener = new OWGameListener({
    onGameStarted: async () => {
        const currentGameInfo = await OWGames.getRunningGameInfo()
        console.log("currentGameInfo", currentGameInfo)
        
        const gameConfig = gamesConfigs.find((e) => e.gameId === currentGameInfo.classId)
        
        settingConfig = { ...defaultConfig, ...await readFileContents<SettingConfig>(configFileName) }

        const currentGameSetting = settingConfig.gameSettings.find((e) => e.gameId === currentGameInfo.classId) || {
            gameId: currentGameInfo.classId,
            manualBeforTime: 10, // 手动录制往前时间
            manualAfterTime: 10, // 手动录制往后时间
            autoBeforTime: 10, // 自动录制往前时间
            autoAfterTime: 10, // 自动录制往后时间
            autoRecordEvents: true,
            events: gamesConfigs.find((e) => e.gameId === currentGameInfo.classId)?.events || []
        }
        isSupportGame = !!gameConfig
        console.log("currentGameSetting", JSON.stringify(currentGameSetting, null, 2))

        getGamestatus(currentGameInfo.classId)

        if (gameConfig) {
            desktop.close()
            inGame.restore()
    
            if (settingConfig.enableOverlay)hotKeyTips.restore()

            if (gameConfig?.gameInfoListener) {
                console.log("卸载已有监听然后重新注册")
                gameConfig?.gameInfoListener.stop()
            } 
            gameConfig.gameInfoListener = addGameInfoListener((result: any) => {
                gameConfig.gameEventFunction?.onInfoUpdates(result, currentGameSetting)
            },
            (result: any) => {
                gameConfig.gameEventFunction?.onNewEvents(result, currentGameSetting, gameConfig, currentGameInfo)
            },
            gameConfig.registerEndEvent
            )
        }
        console.log("游戏打开", currentGameInfo.title)
    },
    onGameEnded: async () => {
        gamesConfigs.forEach((e) => e.gameInfoListener?.stop())// 关闭所有游戏的事件监听
        stopRecording()// 关闭录制流
        desktop.restore()
        inGame.close()
        console.log("游戏关闭")
    }
})

const desktopChange = async (/* hotkeyResult: overwolf.settings.hotkeys.OnPressedEvent */): Promise<void> => {
    if (!isSupportGame) return
    const windowStateInfo = await inGame.getWindowState()

    if (
        windowStateInfo.window_state === WindowStateEx.NORMAL ||
        windowStateInfo.window_state === WindowStateEx.MAXIMIZED
    ) {
        inGame.minimize()
    } else if (
        windowStateInfo.window_state === WindowStateEx.MINIMIZED ||
        windowStateInfo.window_state === WindowStateEx.CLOSED
    ) {
        inGame.restore()
    }
}

const hotKeyTipsChange = async (): Promise<void> => {
    if (!isSupportGame) return
    const windowStateInfo = await hotKeyTips.getWindowState()

    if (
        windowStateInfo.window_state === WindowStateEx.NORMAL ||
        windowStateInfo.window_state === WindowStateEx.MAXIMIZED
    ) {
        hotKeyTips.close()
    } else if (
        windowStateInfo.window_state === WindowStateEx.MINIMIZED ||
        windowStateInfo.window_state === WindowStateEx.CLOSED
    ) {
        hotKeyTips.restore()
    }
}

async function init () {
    OWHotkeys.onHotkeyDown(Hotkeys.showHideDesktop, desktopChange)
    OWHotkeys.onHotkeyDown(Hotkeys.showHideOverlay, hotKeyTipsChange)

    /* 表示手动捕获视频 */
    OWHotkeys.onHotkeyDown(Hotkeys.saveInstantReplay, () => {
        if (!isSupportGame) return
        addQueue("manual", async (autoAfterTime) => {
            console.log("manual 触发")
            await hotKeyTips.close()
            await stopRecord.close()
            await startRecord.close()
            await startRecord.restore()
            setTimeout(async () => {
                await stopRecord.close()
                await startRecord.close()
                await stopRecord.restore()
            }, autoAfterTime * 1000)
        })
    })
    nextInit()
}

async function nextInit () {
    initWindows()
    fortniteGameListener.start()
    overwolf.extensions.onAppLaunchTriggered.addListener(initWindows)
    console.log("初始化结束")
}

// 初始化窗口
async function initWindows () {
    const currentGameInfo = await OWGames.getRunningGameInfo()

    if (!currentGameInfo?.isRunning) {
        desktop.restore()
    } else {
        inGame.restore()
    }
}

// 获取游戏是否能够录制不行显示警告
function getGamestatus (gameClassId: number) {
    axios({
        url: `https://game-events-status.overwolf.com/${gameClassId}_prod.json`
    }).then((res) => {
        const state = res?.data?.state

        if (state === 0 || state === 3) {
            hotKeyTips.close()
            recordError.restore()
        }
    })
}
init()

