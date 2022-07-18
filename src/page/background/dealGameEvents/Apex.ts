import { startRecording, stopRecording, addQueue } from "../saveInstantReplay"

const Apex: GameEventFunction = {
    gameId: 21566,
    onInfoUpdates (result, currentGameSetting) {
        console.log("Apex实时数据", result)
        
        // 实时数据目前胜利只能从这里获取
        if (result?.match_info?.victory === "true" &&
            currentGameSetting?.autoRecordEvents &&
            currentGameSetting?.events.find((e) => e.key === "victory" && e.enable)
        ) {
            addQueue("victory")
        }
    },
    onNewEvents (result, currentGameSetting, gameConfig, currentGameInfo) {
        console.log("Apex events", result)
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

export default Apex