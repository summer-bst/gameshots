import { startRecording, stopRecording, addQueue } from "../saveInstantReplay"

const StarCraftII: GameEventFunction = {
    gameId: 5855,
    onInfoUpdates (result) {
        console.log("StarCraftII实时数据", result)
    },
    onNewEvents (result, currentGameSetting, gameConfig, currentGameInfo) {
        console.log("StarCraftII events", result)
        const { events: [ { name, data } ] } = result

        if (name === "match_start" || gameConfig.events.find((e) => e.key === name)) { // 游戏开始事件开始录制视频
            startRecording(currentGameInfo)
        } else if (name === "match_end") {
            const currentEvent = currentGameSetting?.events.find((e) => e.key === data && e.enable)

            if (currentGameSetting?.autoRecordEvents && currentEvent) { // 只有胜利事件
                addQueue(currentEvent.eventFormattedId)
            }
            stopRecording()// 关闭录制流
        }
    }
}

export default StarCraftII