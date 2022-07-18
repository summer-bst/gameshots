import { startRecording, stopRecording, addQueue } from "../saveInstantReplay"

const CS: GameEventFunction = {
    gameId: 7764,
    onInfoUpdates (result, currentGameSetting) {
        console.log("CS实时数据", result)
        
        // 实时数据目前胜利只能从这里获取
        if (result?.match_info?.match_outcome === "win" &&
            currentGameSetting?.autoRecordEvents &&
            currentGameSetting?.events.find((e) => e.key === "victory" && e.enable)
        ) {
            addQueue("victory")
        }
    },
    onNewEvents (result, currentGameSetting, gameConfig, currentGameInfo) {
        console.log("CS events", result, currentGameSetting)
        const { events: [ { name } ] } = result

        if (name === "match_start" || gameConfig.events.find((e) => e.key === name)) { // 游戏开始事件开始录制视频
            startRecording(currentGameInfo)
                .then(() => {
                    if (name !== "match_start" && currentGameSetting?.autoRecordEvents) {
                        const currentEvent = currentGameSetting.events.find((e) => e.key === name && e.enable)

                        if (currentEvent) {
                            addQueue(currentEvent.eventFormattedId)
                        }
                    }
                })
        } else if (name === "match_end") {
            stopRecording()// 关闭录制流
        }
    }
}

export default CS