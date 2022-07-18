import { startRecording, stopRecording, addQueue } from "../saveInstantReplay"

const Warzone: GameEventFunction = {
    gameId: 21626,
    onInfoUpdates (result) {
        console.log("Warzone 实时数据", result)
    },
    onNewEvents (result, currentGameSetting, gameConfig, currentGameInfo) {
        console.log("Warzone events", result)
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

export default Warzone