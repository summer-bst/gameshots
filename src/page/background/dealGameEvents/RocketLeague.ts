import { startRecording, stopRecording, addQueue } from "../saveInstantReplay"

const RocketLeague: GameEventFunction = {
    gameId: 10798,
    onInfoUpdates (result) {
        console.log("RocketLeague 实时数据", result)
    },
    onNewEvents (result, currentGameSetting, gameConfig, currentGameInfo) {
        const { events: [ { name, data } ] } = result
        console.log("RocketLeague events", name, data)
        
        if (name === "matchStart" || gameConfig.events.find((e) => e.key === name || e.key === data)) { // 游戏开始事件开始录制视频
            startRecording(currentGameInfo)
                .then(() => {
                    if (name !== "matchStart" && currentGameSetting?.autoRecordEvents) {
                        const currentEvent = currentGameSetting.events.find((e) => (e.key === name || e.key === data) && e.enable)

                        if (currentEvent) {
                            addQueue(currentEvent.eventFormattedId)
                        }
                    }
                })
        } else if (name === "matchEnd") {
            stopRecording()// 关闭录制流
        }
    }
}

export default RocketLeague