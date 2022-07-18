import { gamesConfigs } from "@config/gamesConfigs"

const defaultConfig: SettingConfig = {
    videoFolders: [],
    videoSapceLimit: 30,
    enableOverlay: true,
    resolution: 720,
    isCaptureCustom: false,
    fps: 30,
    kbps: 6000,
    gameTvId: 0,
    gameSettings: gamesConfigs.map((e) => ({
        gameId: e.gameId,
        events: e.events,
        manualBeforTime: 10, // 手动录制往前时间
        manualAfterTime: 10, // 手动录制往后时间
        autoBeforTime: 10, // 自动录制往前时间
        autoAfterTime: 10, // 自动录制往后时间
        autoRecordEvents: true // 是否开启自动录制
    }))
}

export default defaultConfig