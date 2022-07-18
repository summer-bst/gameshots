import { startRecording, stopRecording, addQueue } from "../saveInstantReplay"

// 堡垒之夜
const Fortnite: GameEventFunction = {
    gameId: 21216,
    onInfoUpdates (result, currentGameSetting) {
        console.log("Fortnite 实时数据", result)
        
        // 实时数据目前胜利只能从这里获取
        if (result?.match_info?.rank === "1" &&
            currentGameSetting?.autoRecordEvents 
        ) {
            const currentEvent = currentGameSetting.events.find((e) => e.key === "victory" && e.enable)// 胜利

            if (currentEvent) {
                addQueue(currentEvent.eventFormattedId)
            }
        }
    },
    onNewEvents (result, currentGameSetting, gameConfig, currentGameInfo) {
        console.log("Fortnite events", result)
        const { events: [ { name, data } ] } = result
        let gameData: any = {} 

        try {
            gameData = JSON.parse(data || "{}")
        } catch (error) {
        }

        if (gameData?.isHeadshot && currentGameSetting?.autoRecordEvents) {
            const currentEvent = currentGameSetting.events.find((e) => e.key === "headshot" && e.enable)// 爆头

            if (currentEvent) {
                addQueue(currentEvent.eventFormattedId)
            }
        }

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
            stopRecording()// 关闭录制流
        }
    }
}

export default Fortnite