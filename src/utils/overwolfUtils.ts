import { OWGamesEvents } from "@overwolf/overwolf-api-ts"
import FileInDir = overwolf.io.FileInDir
import AssignHotkeyObject = overwolf.settings.hotkeys.AssignHotkeyObject
import GetAssignedHotkeyResult = overwolf.settings.hotkeys.GetAssignedHotkeyResult
import EncoderData = overwolf.streaming.EncoderData

const { StreamEncoder } = overwolf.streaming.enums
const appData = overwolf.extensions.io.enums.StorageSpace.appData
const videosPath = overwolf.extensions.io.enums.StorageSpace.videos
let storagePath = ""// 专用缓存文件地址
let bluestacksioPlugin: any
let processManagerPlugin: any // 流程管理器

// 打开windows文件资源管理器
function openWindowsExplorer (fileUrl: string): void {
    overwolf.utils.openWindowsExplorer(
        fileUrl,
        (result) => {
            console.log(result)
        }
    )
}

// 获取视频所在文件夹
async function getOverwolfVideosFolder (): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        overwolf.settings.getOverwolfVideosFolder((url) => {
            url.path.Value
                ? resolve(url.path.Value.replace(/\//g, "\\"))
                : reject(new Error("文件路径消失"))
        })
    })
}

// 列出路径下所有文件和目录
function getDir (path: string): Promise<FileInDir[]> {
    return new Promise<FileInDir[]>((resolve) => {
        overwolf.io.dir(path, (res) => {
            if (res.success) {
                if (res.data) resolve(res.data)
            } else {
                // reject(new Error('无文件路径'))
                resolve([])
            }
        })
    })
}

/* 注册方法获取游戏信息 */
function addGameInfoListener (onInfoUpdates: any, onNewEvents: any, events: string[]) {
    const gameInfoListener = new OWGamesEvents(
        {
            onInfoUpdates,
            onNewEvents
        },
        events
    )
    gameInfoListener.start()

    return gameInfoListener
}

async function readFileContents<T> (fileName: string) {
    if (!storagePath) await getStoragePath()

    return new Promise<T | void>((resolve) => {
        overwolf.io.readFileContents(`${storagePath}\\${fileName}`, overwolf.io.enums.eEncoding.UTF8, (res) => {
            if (res.content) {
                resolve(JSON.parse(res.content))
            } else {
                resolve()
            }
        })
    })
}

async function writeFileContents (fileName: string, content: string) {
    if (!storagePath) await getStoragePath()

    return new Promise<void>((resolve, reject) => {
        overwolf.io.writeFileContents(`${storagePath}\\${fileName}`, content, overwolf.io.enums.eEncoding.UTF8, true, (res) => {
            if (res.success) {
                console.log("写入成功", JSON.parse(content), res)
                resolve()
            } else {
                reject(new Error(res.error))
            }
        })
    })
}

/* 获取私有化目录地址 */
async function getStoragePath () {
    return new Promise<string>((resolve) => {
        overwolf.extensions.io.getStoragePath(appData, ({ path }) => {
            storagePath = path
            resolve(storagePath)
        })
    })
}

// 是否存在这个文件或文件夹
async function exist (path?: string) {
    if (!path) return false

    return new Promise<boolean>((resolve) => {
        overwolf.io.exist(path, ({ exist }) => {
            resolve(!!exist)
        })
    })
}

async function getBluestacksioPlugin () {
    if (bluestacksioPlugin) return bluestacksioPlugin

    return new Promise<boolean>((resolve, reject) => {
        overwolf.extensions.current.getExtraObject("bluestacks-io-plugin", (result) => {
            if (result.success) {
                bluestacksioPlugin = result.object
                resolve(result.object)
            } else {
                reject(new Error("获取插件失败"))
            }
        })
    })
}

async function getProcessManagerPlugin () {
    if (processManagerPlugin) return processManagerPlugin

    return new Promise<boolean>((resolve, reject) => {
        overwolf.extensions.current.getExtraObject("process-manager-plugin", (result) => {
            if (result.success) {
                processManagerPlugin = result.object
                resolve(result.object)
            } else {
                reject(new Error("获取插件失败"))
            }
        })
    })
}

async function getHardDiskFreeSpace (diskName: string) {
    if (!bluestacksioPlugin) await getBluestacksioPlugin()

    return bluestacksioPlugin.GetHardDiskFreeSpace(diskName[0])
}

async function deleteFileOrDir (path: string, isFile = true) {
    // return new Promise<void>((resolve, reject) => {
    //     // @ts-ignore: 因为delete是关键字官方无法加入类型文件
    //     overwolf.extensions.io.delete(videosPath, path, (res) => {
    //         if (res.success) {
    //             resolve() 
    //         } else {
    //             console.log(res)
    //             reject("deleteFileOrDir fail")
    //         }
    //     })
    // })
    if (!bluestacksioPlugin) await getBluestacksioPlugin()

    return new Promise<void>((resolve) => {
        bluestacksioPlugin.deleteFileOrDir(path, isFile, (res: any) => {
            console.log(res)
            resolve(res)
        })
    })
}

async function moveFileOrDir (path: string, destPath: string, isFile = true) {
    if (path === destPath) return

    if (!bluestacksioPlugin) await getBluestacksioPlugin()

    return new Promise<void>((resolve, reject) => {
        bluestacksioPlugin.copyFileOrDir(
            path,
            destPath,
            isFile, (result: any) => {
                if (result === true) {
                    bluestacksioPlugin.deleteFileOrDir(path, isFile, (res: any) => {
                        console.log(res)
                        resolve(res)
                    })
                } else {
                    console.log(result, path, destPath)
                    reject(result)
                }
            })
    }) 
}

async function createDirectory (path: string) {
    return new Promise<void>((resolve) => {
        overwolf.extensions.io.createDirectory(videosPath, path, () => {
            resolve()// 失败说明存在文件夹直接返回
        })
    }) 
}

// 打开文件选择器
async function openFolderPicker (videoFolderPath: string) {
    return new Promise<string>((resolve, reject) => {
        overwolf.utils.openFolderPicker(videoFolderPath, (result) => {
            if (result.path) {
                resolve(result.path)
            } else {
                reject("设置路径出现异常了")
            }
        })
    })
}

// 设置热键
async function setOverwolfHotkeys (hotkey: AssignHotkeyObject) {
    return new Promise<void>((resolve, reject) => {
        overwolf.settings.hotkeys.assign(hotkey, (result) => {
            if (result.success) {
                resolve()
            } else {
                reject(new Error(`设置热键出错:${result.error}`))
            }
        })
    })
}

// 获取热键设置信息
async function getOverwolfHotkeys () {
    return new Promise<GetAssignedHotkeyResult>((resolve, reject) => {
        overwolf.settings.hotkeys.get((result) => {
            if (result.success) {
                console.log("hotkey:", result)
                resolve(result)
            } else {
                reject()
            }
        })
    })
}

// 获取视频编码列表
async function getStreamEncoders () {
    return new Promise<EncoderData[]>((resolve, reject) => {
        overwolf.streaming.getStreamEncoders((e) => {
            if (e.success && e.encoders) {
                console.log("视频编码列表", JSON.stringify(e.encoders))
                const encoders = e.encoders.filter((v) => v.enabled)
                resolve(encoders)
            } else {
                reject()
            }
        })
    })
}

// 获取默认视频编码
async function getDefaultStreamEncoder (streamEncoders?: EncoderData[]) {
    if (!streamEncoders)streamEncoders = await getStreamEncoders()

    return new Promise<StreamEncoder>((resolve, reject) => {
        overwolf.utils.getSystemInformation((res) => {
            if (res.success) {
                const GPUs = res.systemInfo?.GPUs

                if (streamEncoders?.find((e) => e.name === StreamEncoder.INTEL && e.enabled) && GPUs?.find((e) => e.Name.includes("Intel")))resolve(StreamEncoder.INTEL)

                if (streamEncoders?.find((e) => e.name === StreamEncoder.NVIDIA_NVENC_NEW && e.enabled) && GPUs?.find((e) => e.Name.includes("NVIDIA")))resolve(StreamEncoder.NVIDIA_NVENC_NEW)
  
                if (streamEncoders?.find((e) => e.name === StreamEncoder.AMD_AMF && e.enabled) && GPUs?.find((e) => e.Name.includes("AMD")))resolve(StreamEncoder.AMD_AMF)  
                resolve(StreamEncoder.X264)
            } else {
                reject()
            }
        })
    })
}

// 获取社交平台用户登录情况
async function getSocialUserLoginInfo (type: SocialUser["type"] = "all"): Promise<SocialUser[]> {
    const twitter = () => new Promise<SocialUser>((resolve) => {
        overwolf.social.twitter.getUserInfo((res) => {
            resolve({
                type: "Twitter",
                id: res.userInfo?.id,
                username: res.userInfo?.name,
                avatar: res.userInfo?.avatar
            })  
        })
    })

    const reddit = () => new Promise<SocialUser>((resolve) => {
        overwolf.social.reddit.getUserInfo((res) => {
            resolve({
                type: "Reddit",
                id: "",
                username: res?.userInfo?.name,
                avatar: res?.userInfo?.avatar
            })
        })
    })

    const gfycat = () => new Promise<SocialUser>((resolve) => {
        overwolf.social.gfycat.getUserInfo((res) => {
            resolve({
                type: "Gfycat",
                id: res?.userInfo?.userid,
                username: res?.userInfo?.username,
                avatar: res?.userInfo?.profileImageUrl
            })
        })
    })

    const youtube = () => new Promise<SocialUser>((resolve) => {
        overwolf.social.youtube.getUserInfo((res) => {
            resolve({
                type: "Youtube",
                id: res?.userInfo?.id,
                username: res?.userInfo?.name,
                avatar: res?.userInfo?.picture
            })
        })
    })

    const discord = () => new Promise<SocialUser>((resolve) => {
        overwolf.social.discord.getUserInfo((res) => {
            resolve({
                type: "Discord",
                id: res.userInfo?.id,
                username: res.userInfo?.username,
                avatar: res.userInfo?.avatar
            })
        })
    })
    let result: Promise<SocialUser>[] = []

    switch (type) {
    case "all":
        result = [
            twitter(),
            reddit(),
            gfycat(),
            youtube(),
            discord()
        ]
        break
    case "Twitter":
        result = [ twitter() ]
        break
    case "Reddit":
        result = [ reddit() ]
        break
    case "Gfycat":
        result = [ gfycat() ]
        break
    case "Youtube":
        result = [ youtube() ]
        break
    case "Discord":
        result = [ discord() ]
        break
    }

    return Promise.all(result) 
   
}

// 登录除了gameTv外的所有平台
function loginSocial ({ type }: SocialUser) {
    switch (type) {
    case "Twitter":
        overwolf.social.twitter.performUserLogin()
        break  
    case "Reddit":
        overwolf.social.reddit.performUserLogin()
        break  
    case "Gfycat":
        overwolf.social.gfycat.performUserLogin()
        break  
    case "Youtube":
        overwolf.social.youtube.performUserLogin()
        break  
    case "Discord":
        overwolf.social.discord.performUserLogin()
        break  
    default:
        break
    }
}

function LogoutSocial ({ type }: SocialUser) {
    switch (type) {
    case "Twitter":
        overwolf.social.twitter.performLogout(console.log)
        break
    case "Gfycat":
        overwolf.social.gfycat.performLogout(console.log)
        break
    case "Youtube":
        overwolf.social.youtube.performLogout(console.log)
        break
    case "Discord":
        overwolf.social.discord.performLogout(console.log)
        break
    case "Reddit":
        overwolf.social.reddit.performLogout(console.log)
        break
    default:
        break
    }
}

export {
    getProcessManagerPlugin,
    LogoutSocial,
    loginSocial,
    getBluestacksioPlugin,
    getDir,
    exist,
    getStoragePath,
    openWindowsExplorer,
    getOverwolfVideosFolder,
    addGameInfoListener,
    readFileContents,
    writeFileContents,
    deleteFileOrDir,
    moveFileOrDir,
    createDirectory,
    openFolderPicker,
    setOverwolfHotkeys,
    getOverwolfHotkeys,
    getDefaultStreamEncoder,
    getHardDiskFreeSpace,
    getSocialUserLoginInfo
}
