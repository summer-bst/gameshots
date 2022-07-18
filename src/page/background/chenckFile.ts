import defaultConfig from "@config/defaultSettings"
import { VideoCacheFileName, configFileName, AppFavoriteName, AppName } from "@config/baseConfig"
import { readFileContents, writeFileContents, getOverwolfVideosFolder, moveFileOrDir, exist } from "@utils/overwolfUtils"
// import MessageReceivedEvent= overwolf.windows.MessageReceivedEvent

// overwolf.windows.onMessageReceived.addListener((message: MessageReceivedEvent) => {
//     if (message.id === "checkFile") {
//         checkFile()
//     }
// })

async function checkFile (videoCache: VideoCache | void) {

    const settingConfig = { ...defaultConfig, ...await readFileContents<SettingConfig>(configFileName) }
    const { videoFolders, videoSapceLimit } = settingConfig

    const overwolfVideosFolder = await getOverwolfVideosFolder()

    if (!videoFolders.find((e) => e === overwolfVideosFolder)) {
        videoFolders.push(overwolfVideosFolder)
        await writeFileContents(configFileName, JSON.stringify(settingConfig))
    }
 
    if (videoCache) {
        for (let i = 0; i < videoCache.data.length; i++) {
            const e = videoCache.data[i]

            for (let j = 0; j < e.clips.length; j++) {
                const v = e.clips[j]

                if (v.isFavorite && !videoFolders.find((k) => v.filePath.includes(`${k}\\${AppFavoriteName}`))) {
                    try {
                        const destPath = `${overwolfVideosFolder}\\${AppFavoriteName}\\${e.folderName}\\${v.fileName}.mp4`
                        await moveFileOrDir(v.filePath, destPath)
                        v.filePath = destPath
                    } catch (error) {
                        console.log("checkFile 收藏出错了", error)
                    }
                } else if (!v.isFavorite && !videoFolders.find((k) => v.filePath.includes(`${k}\\${AppName}\\`))) {
                    try {
                        const destPath = `${overwolfVideosFolder}\\${AppName}\\${e.folderName}\\${v.fileName}.mp4`
                        await moveFileOrDir(v.filePath, destPath)
                        v.filePath = destPath
                    } catch (error) {
                        console.log("checkFile 取消收藏出错了", error)
                    }
                }
            }
        }
    }
    overwolf.media.videos.deleteOldVideos(videoSapceLimit, (res) => console.log("清空旧的视频", res))

    // 无效数据删除
    if (videoCache) {
        for (let i = 0; i < videoCache.data.length; i++) {
            const e = videoCache.data[i]
            const clips = []

            for (let j = 0; j < e.clips.length; j++) {
                const v = e.clips[j]
                const isExistChild = await exist(v.filePath)

                if (isExistChild) {
                    clips.push(v)
                }
            }
            e.clips = clips
        }
        videoCache.data = videoCache.data.filter((k) => k?.clips?.length)
        videoCache.isWriting = false
    }
    // let isWriteFile = false// 存在路径修改则重写缓存文件
    // // 防止最终不一致的问题
    // const newVideoCache = await readFileContents<VideoCache>(VideoCacheFileName)
    // newVideoCache?.data.forEach((e) => {
    //     const item = videoCache?.data.find((o) => e.time === o.time)

    //     if (item) {
    //         e.clips.forEach((v) => {
    //             const cl = item.clips.find((k) => k.fileName === v.fileName && v.filePath !== k.filePath)

    //             if (cl) {
    //                 v.filePath = cl.filePath
    //                 isWriteFile = true
    //             }
    //         })
    //     }
    // })
    await writeFileContents(VideoCacheFileName, JSON.stringify(videoCache))
  
}

export default checkFile