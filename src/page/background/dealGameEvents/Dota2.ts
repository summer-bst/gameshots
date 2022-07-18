import { startRecording, stopRecording, addQueue } from "../saveInstantReplay"
let team: "" | "dire" | "radiant" = ""

const Dota2: GameEventFunction = {
    gameId: 7314,
    onInfoUpdates (result) {
        console.log("Dota2 实时数据", result)

        if (result?.me?.team)team = result?.me?.team// 获取当前所属队伍
    },
    onNewEvents (result, currentGameSetting, gameConfig, currentGameInfo) {
        console.log("Dota2 events", result)
        const { events: [ { name, data } ] } = result
        let gameData: any = {} 

        try {
            gameData = JSON.parse(data || "{}")
        } catch (error) {
        }

        if (currentGameSetting?.autoRecordEvents && 
            currentGameSetting?.events.find((e) => e.key === "victory" && e.enable) &&
            gameData?.winner === team) { // 表示胜利
            addQueue("victory")
        }

        if (gameData?.match_state === "DOTA_GAMERULES_STATE_PRE_GAME" || gameConfig.events.find((e) => e.key === name)) { // 游戏开始事件开始录制视频
            startRecording(currentGameInfo)
                .then(() => {
                    if (gameData?.match_state !== "DOTA_GAMERULES_STATE_PRE_GAME" && currentGameSetting?.autoRecordEvents) {
                        const currentEvent = currentGameSetting.events.find((e) => e.key === name && e.enable)

                        if (currentEvent) {
                            addQueue(currentEvent.eventFormattedId)
                        }
                    }
                })
        } else if (gameData?.game_state === "idle" || name === "match_ended") { // 退出到游戏主界面并且游戏关闭
            setTimeout(() => {
                stopRecording()// 关闭录制流
            }, 5000)
        }
    }
}

export default Dota2