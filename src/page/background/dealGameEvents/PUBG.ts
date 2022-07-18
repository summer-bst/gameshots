import { startRecording, stopRecording, addQueue } from "../saveInstantReplay"

const PUBG: GameEventFunction = {
    gameId: 10906,
    onInfoUpdates (result, currentGameSetting) {
        console.log("PUBG 实时数据", result)

        // 实时数据目前胜利只能从这里获取
        if (result?.match_info?.me === "1" &&
            currentGameSetting?.autoRecordEvents &&
            currentGameSetting?.events.find((e) => e.key === "chickenDinner" && e.enable)
        ) {
            addQueue("chickenDinner")// 吃鸡了
        }
    },
    onNewEvents (result, currentGameSetting, gameConfig, currentGameInfo) {
        console.log("PUBG events", result)
        const { events: [ { name } ] } = result

        if (name === "matchStart" || gameConfig.events.find((e) => e.key === name)) { // 游戏开始事件开始录制视频
            startRecording(currentGameInfo)
                .then(() => {
                    if (name !== "matchStart" && currentGameSetting?.autoRecordEvents) {
                        const currentEvent = currentGameSetting.events.find((e) => e.key === name && e.enable)

                        if (currentEvent) {
                            addQueue(currentEvent.eventFormattedId)
                        }
                    }
                })
        } else if (name === "matchEnd") {
            setTimeout(() => { // 多录几秒
                stopRecording()
            }, 5000)
        }
    }
}

export default PUBG