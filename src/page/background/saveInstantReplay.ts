import { OWWindow } from "@overwolf/overwolf-api-ts"
import { getHardDiskFreeSpace, readFileContents, writeFileContents, moveFileOrDir, getOverwolfVideosFolder, deleteFileOrDir, getDefaultStreamEncoder /* createDirectory */ } from "@utils/overwolfUtils"
import { VideoCacheFileName, configFileName, subFolderName, AppName, windowNames, AppFavoriteName } from "@config/baseConfig"
import defaultConfig from "@config/defaultSettings"
import defaultEncoderValue from "@config/defaultEncoderValue"
import chenckFile from "./chenckFile"
import gamesConfigs from "./dealGameEvents"
import RunningGameInfo = overwolf.games.RunningGameInfo
import StreamSettings = overwolf.streaming.StreamSettings
import StopStreamingResult = overwolf.streaming.StopStreamingResult
import AudioDeviceData = overwolf.streaming.AudioDeviceData
const { getAudioDevices } = overwolf.streaming
const recordError = new OWWindow(windowNames.recordError) // 消息提示页面

// import StreamParams = overwolf.streaming.StreamParams
// import ReplaySettings = overwolf.media.replays.ReplaySettings
// import Result = overwolf.Result
// overwolf.utils.getSystemInformation()
// overwolf.streaming.getStreamEncoders()
let currentGameInfo: RunningGameInfo
let currentGamesSetting: GameSetting | undefined
let streamId: number | undefined// 录制流id
let startRecordingTime: number// 开始录制的时间戳
let settingConfig: SettingConfig
let videoCache: VideoCache | void// 视频缓存数据
let folderName = ""
let folderPath = ""
let startIng = false // 是否在启动录制流中
// const repeatTime = 3// 重复时间段内重复事件删除

let timestamps: {
    clipDuration: number,
    currentTime: number,
    eventType: string,
    startTime: number,
    endTime: number,
    filePath?: string,
    overwolfPath?: string,
    fileName?: string
}[] = []

const streamSettings: StreamSettings = {
    provider: overwolf.streaming.enums.StreamingProvider.VideoRecorder,
    settings: {}
}

function initParams () {
    streamId = undefined
    startRecordingTime = 0
    timestamps = []
    folderName = ""
    folderPath = ""
    startIng = false
    sendMessage("stopWriting")
}

function sendMessage (event: string) {
    overwolf.windows.sendMessage(windowNames.inGame, event, "", (res) => {
        console.log("消息发送", res)
    })
    overwolf.windows.sendMessage(windowNames.desktop, event, "", (res) => {
        console.log("消息发送", res)
    })
}
overwolf.streaming.onStartStreaming
    .addListener((e) => {
        startRecordingTime = new Date().valueOf()
        streamId = e.stream_id
        startIng = false
        console.log("录制流启动了:", startRecordingTime, e)
    })
// overwolf.streaming.onStreamingSourceImageChanged
//     .addListener((e) => console.log("overwolf.streaming.onStreamingSourceImageChanged:", new Date().getTime(), e))
overwolf.streaming.onStopStreaming
    .addListener((e) => {
        console.log("录制流已关闭:", new Date().getTime(), e)
        streamId = undefined
        startIng = false

        if (e.url) createVideoComposition(e.url, e.duration)
    })
overwolf.streaming.onStreamingError
    .addListener((e) => {
        console.log("录制报错", JSON.stringify(e, null, 2), streamId)
        startIng = false

        if (e.stream_id === streamId) {
            streamId = undefined
        }
        new Promise<void>(async (resolve) => {
            const videoUrl = (await getOverwolfVideosFolder()).replace(/\//g, "\\")
            await deleteFileOrDir(`${videoUrl}\\${AppName}\\${subFolderName}`, false)// 调试
            resolve()
        })
        
        recordError.restore()
    })
  
overwolf.streaming.onStreamingWarning
    .addListener((e) => {
        console.log("录制警告", e)
    })

const resolutions = {
    1080: 1920,
    720: 1280,
    480: 854
}

// 开启捕获视频片段流
async function startRecording (gameInfo: RunningGameInfo) {
    if (streamId || startIng) {
        return
    }
    startIng = true
    currentGameInfo = gameInfo
    videoCache = await readFileContents<VideoCache>(VideoCacheFileName)
    settingConfig = { ...defaultConfig, ...await readFileContents<SettingConfig>(configFileName) }
    const { mic, game, gameSettings, videoSapceLimit, kbps, fps, resolution } = settingConfig
    let { endoderName, preset } = settingConfig

    if (!endoderName) endoderName = await getDefaultStreamEncoder()

    if (!preset) {
        preset = defaultEncoderValue[endoderName]
    }
    const videoFolderPath = (await getOverwolfVideosFolder()).replace(/\//g, "\\")
    
    const diskFreeSize = await getHardDiskFreeSpace(videoFolderPath)
    const diskSpaceLimit = parseInt(localStorage.getItem("diskSpaceLimit") || "5") 

    const videoFolderSize = await new Promise<number>((resolve, reject) => {
        overwolf.media.getAppVideoCaptureFolderSize((res) => {
            if (res.success) {
                resolve((res.totalVideosSizeMB || 0) / 1024)
            } else {
                reject()
            }
        })
    })

    if (videoFolderSize > videoSapceLimit && diskFreeSize < diskSpaceLimit) {
        overwolf.media.videos.deleteOldVideos(videoSapceLimit, (res) => console.log("设置容量太小提前删除文件", res))
    }

    if (videoFolderSize + diskFreeSize < diskSpaceLimit) {
        overwolf.media.videos.deleteOldVideos(0, (res) => console.log("清空全部视频", res))
    }
    currentGamesSetting = gameSettings.find((e) => e.gameId === gameInfo.classId) || {
        gameId: currentGameInfo.classId,
        manualBeforTime: 10, // 手动录制往前时间
        manualAfterTime: 10, // 手动录制往后时间
        autoBeforTime: 10, // 自动录制往前时间
        autoAfterTime: 10, // 自动录制往后时间
        autoRecordEvents: true,
        events: gamesConfigs.find((e) => e.gameId === currentGameInfo.classId)?.events || []
    }
    streamSettings.settings = {
        // quota: {
        //     excluded_directories: videoCache?.data.filter((e) => e.isFavorite).map((e) => e.folderPath) || [], // 不限制的文件夹名单（收藏夹）
        //     max_quota_gb: videoSapceLimit// 设置最大的文件夹空间单位GB
        // },
        video: {
            sub_folder_name: subFolderName,
            use_app_display_name: true, // 使用应用名称创建文件夹
            max_kbps: kbps, // 设置页kbps
            game_window_capture: {
                enable_when_available: false,
                capture_overwolf_windows: false
            },
            capture_desktop: {
                enable: false// 是否允许录制桌面流
            },
            encoder: {
                name: endoderName,
                config: {
                    preset
                }
            },
            override_overwolf_setting: true, // 不使用overwolf设置页的设置
            indication_type: overwolf.streaming.enums.IndicationType.NoIndication, // 无指示器
            // width: streamSettings.settings,
            // height: resolution,
            fps,
            indication_position: overwolf.streaming.enums.IndicationPosition.None, // 指示器位置
            keep_game_capture_on_lost_focus: true // 游戏失去焦点时是否录制
        }
    }

    if (resolutions[resolution] && streamSettings.settings.video) {
        streamSettings.settings.video = {
            ...streamSettings.settings.video,
            width: resolutions[resolution],
            height: resolution
            // width: 3840,//可以支持更高的分辨率
            // height: 2160
        }
    }

    if (mic && game) {
        // 重新获取设备信息防止有断开的设备，让其使用默认设备
        const audioDevices = await new Promise<AudioDeviceData[]>((resolve) => {
            getAudioDevices((audioRes) => {
                resolve(audioRes.devices || [])
            })
        })
        const isGame = audioDevices.find((e) => e.can_playback && e.device_id === game?.device_id)
        const isMic = audioDevices.find((e) => e.can_record && e.device_id === mic?.device_id)
        streamSettings.settings.audio = {}

        if (!isGame)game.device_id = ""
        streamSettings.settings.audio.game = {
            ...game,
            filtered_capture: {
                enable: true, // 过滤掉其他app的声音【存在实验性】
                additional_process_names: []
            }
        }

        if (!isMic)mic.device_id = ""
        streamSettings.settings.audio.mic = mic
    }
    console.log("录制配置", streamSettings)

    return new Promise<void>((resolve, reject) => {
        overwolf.streaming.start(streamSettings, (result) => {
            if (result.success) {
                console.log("录制流开启中", new Date().getTime(), result)
                resolve()
            } else {
                console.log("录制流失败信息", JSON.stringify(result, null, 2))
                reject(new Error("启动录制流失败"))
            }
        })
    })
}

async function stopRecording () {
    console.log("开始关闭录制流", new Date().getTime(), streamId)

    if (!streamId) return
    overwolf.streaming.stop(streamId, (result) => {
        const res = <StopStreamingResult>result

        if (!res.success) {
            console.log("录屏失败", result)
            initParams()
        }
    })
}

// 添加点击时间队列
function addQueue (eventType: string, callBack?: (autoAfterTime: number) => any) {
    if (streamId && currentGamesSetting) {
        settingConfig.enableOverlay && callBack && callBack(currentGamesSetting.autoAfterTime)
        const currentTime = new Date().valueOf()
        const nowTime = Math.floor((currentTime - startRecordingTime) / 1000) * 1000// 为了修复多一秒的问题
        let startTime = 0
        let endTime = 0
        let clipDuration = 0

        if (eventType === "manual") {
            startTime = nowTime - currentGamesSetting.manualBeforTime * 1000
            endTime = nowTime + currentGamesSetting.manualAfterTime * 1000
            clipDuration = currentGamesSetting.manualBeforTime + currentGamesSetting.manualAfterTime
        } else {
            clipDuration = currentGamesSetting.autoBeforTime + currentGamesSetting.autoAfterTime
            startTime = nowTime - currentGamesSetting.autoBeforTime * 1000
            endTime = nowTime + currentGamesSetting.autoAfterTime * 1000

            // // 存在短时间内重复事件不进行剪辑仅包含自动录制
            // if (timestamps.find((e) => e.eventType === eventType && startTime - e.startTime < repeatTime * 1000)) return
        }

        if (startTime < 0) startTime = 0
        
        timestamps.push({
            clipDuration,
            currentTime,
            eventType,
            startTime,
            endTime
        })
        
    }
}

// 清除空的文件夹
function clearEmptyFolders (folderPath: string) {
    overwolf.io.dir(folderPath, (result) => {
        result.data?.forEach((e) => {
            if (e.type === "dir") {
                const childPath = `${folderPath}\\${e.name}`
                overwolf.io.dir(childPath, ({ data }) => {
                    if (!data?.length) {
                        deleteFileOrDir(childPath, false)
                    }
                })
            } 
        })
    })   
}

// 剪辑多个视频
async function createVideoComposition (sourceVideoUrl: string, duration: number) {
    const videoUrl = (await getOverwolfVideosFolder()).replace(/\//g, "\\")
    folderName = `Session${(videoCache?.sessionCount || 0) + 1}`
    folderPath = `${videoUrl}\\${AppName}\\${folderName}`
    // await createDirectory(folderPath)// 新建文件夹

    for (let i = 0; i < timestamps.length; i++) {
        const segment = timestamps[i]
        console.log("segment", segment)

        if (segment.startTime < duration) { // 偶发性存在开始时间比总时长长，防止出现长度为0的视频
            await new Promise((resolve, reject) => {
                overwolf.media.videos.createVideoComposition(sourceVideoUrl, {
                    segments: [ segment ]
                }, async (result) => {
                    if (result.success && result.path) {
                        console.log("剪辑片段", result.url)
                        const path = result.path.replace(/\//g, "\\")// 返回值很奇怪统一下斜杠
                        const fileName = `Clip${i + 1}`
                        const filePath = `${folderPath}\\${fileName}.mp4`
                        // const overwolfPath = `overwolf://media/replays/${AppName}/${folderName}/${fileName}.mp4`

                        try {
                            await moveFileOrDir(path, filePath)
                        } catch (error) {
                            await deleteFileOrDir(filePath)
                            await moveFileOrDir(path, filePath)
                        }
                        // timestamps[i].overwolfPath = overwolfPath
                        timestamps[i].filePath = filePath
                        timestamps[i].fileName = fileName
                        resolve(result)
                    } else {
                        console.log("剪辑失败", result)
                        initParams()
                        reject(result)
                    }
                })
            })
        }
    }
    
    await deleteFileOrDir(`${videoUrl}\\${AppName}\\${subFolderName}`, false)// 调试
    console.log("删除源文件成功")
    await setVideoCache()
    clearEmptyFolders(`${videoUrl}\\${AppName}`)
    clearEmptyFolders(`${videoUrl}\\${AppFavoriteName}`)
}

async function setVideoCache () {

    if (!currentGameInfo || !startRecordingTime) return

    const itemData: VideoClip = timestamps.map((e, i) => ({
        clipId: `clip_${e.currentTime}_${i}`,
        clipDuration: e.clipDuration,
        showName: e.fileName || "",
        fileName: e.fileName || "",
        filePath: e.filePath || "",
        overwolfPath: e.overwolfPath || "",
        isFavorite: false,
        eventType: e.eventType
    }))

    const cacheData: VideoCacheData = {
        sessionId: `session_${startRecordingTime}`,
        folderPath,
        folderName,
        showName: folderName,
        time: startRecordingTime,
        isFavorite: false,
        gameName: gamesConfigs.find((e) => e.gameId === currentGameInfo.classId)?.name,
        gameId: currentGameInfo.classId,
        clips: itemData
    }
    sendMessage("startWriting")
    let videoCache = await readFileContents<VideoCache>(VideoCacheFileName)

    if (videoCache) {
        videoCache.isWriting = true
        videoCache.sessionCount++
        cacheData.folderName = `Session${videoCache.sessionCount}`
        cacheData.showName = `Session${videoCache.sessionCount}`
        videoCache.data.push(cacheData)
    } else {
        videoCache = {
            isWriting: true,
            sessionCount: 1,
            data: [ cacheData ]
        }
    }
    await writeFileContents(VideoCacheFileName, JSON.stringify(videoCache))
    await chenckFile(videoCache)
    initParams()
    sendMessage("restData")
}

export { startRecording, stopRecording, addQueue }