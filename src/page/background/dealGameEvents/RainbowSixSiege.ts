import { startRecording, stopRecording, addQueue } from "../saveInstantReplay"

const RainbowSixSiege: GameEventFunction = {
    gameId: 10826,
    onInfoUpdates (result) {
        console.log("RainbowSixSiege实时数据", result)
        
        if (result?.game_info?.phase === "lobby"// 说明处于大厅可能中途退出游戏
        ) {
            stopRecording()// 关闭录制流

        }
    },
    onNewEvents (result, currentGameSetting, gameConfig, currentGameInfo) {
        console.log("RainbowSixSiege events", result)
        const { events: [ { name, data } ] } = result

        // 轮次开启
        if (name === "roundStart" || gameConfig.events.find((e) => e.key === name)) { // 游戏开始事件开始录制视频
            startRecording(currentGameInfo)
                .then(() => {
                    if (name !== "match_start" && currentGameSetting?.autoRecordEvents) {
                        const currentEvent = currentGameSetting.events.find((e) => e.key === name && e.enable)

                        if (currentEvent) {
                            addQueue(currentEvent.eventFormattedId)
                        }
                    }
                })
        } else if (name === "roundOutcome" && data === "victory") {
            startRecording(currentGameInfo)
                .then(() => {
                    if (currentGameSetting?.autoRecordEvents) {
                        const currentEvent = currentGameSetting.events.find((e) => e.key === "roundVictory" && e.enable)

                        if (currentEvent) {
                            addQueue(currentEvent.eventFormattedId)
                        }
                    }
                })
        } else if (name === "matchOutcome") { // 比赛结束
            if (data === "victory" && currentGameSetting?.autoRecordEvents) {
                // 结束包含着胜利
                const currentEvent = currentGameSetting.events.find((e) => e.key === "victory" && e.enable)

                if (currentEvent) {
                    addQueue(currentEvent.eventFormattedId)
                }
            }
            stopRecording()// 关闭录制流
        }
    }
}

export default RainbowSixSiege