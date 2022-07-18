import { startRecording, stopRecording, addQueue } from "../saveInstantReplay"

const LOL: GameEventFunction = {
    gameId: 5426,
    onInfoUpdates (/* result */) {
        // console.log("LOL 实时数据", result)
    },
    onNewEvents (result, currentGameSetting, gameConfig, currentGameInfo) {
        console.log("LOL events", result)
        const { events: [ { name, data } ] } = result
        
        let gameData: any = {} 

        try {
            gameData = JSON.parse(data || "{}")
        } catch (error) {
         
        }

        if (name === "announcer" || gameConfig.events.find((e) => e.key === name || e.key === gameData?.name || e.key === gameData?.label)) { // 游戏开始事件开始录制视频
            startRecording(currentGameInfo)
                .then(() => {
                    if (currentGameSetting?.autoRecordEvents) {
                        let currentEvent: GameEvent | undefined

                        if (name === "kill") {
                            if (currentGameSetting.events.find((e) => e.key === "kill" && e.enable))addQueue("kill")
                            // 针对多杀情况
                            currentEvent = currentGameSetting.events.find((e) => e.key === gameData?.label && gameData?.label !== "kill" && e.enable)

                            if (currentEvent)addQueue(currentEvent.eventFormattedId)
                        } else if (gameData?.name === "victory" && currentGameSetting.events.find((e) => e.key === "victory" && e.enable)) {
                            addQueue("victory")
                        } else {
                            currentEvent = currentGameSetting.events.find((e) => e.key === name && e.enable)

                            if (currentEvent)addQueue(currentEvent.eventFormattedId)
                        }
                    }
                })
        }

        if (name === "announcer" && (gameData.name === "defeat" || gameData.name === "victory")) {
            setTimeout(() => {
                stopRecording()// 关闭录制流
            }, 5000)
        }
    }
}

export default LOL