import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import { VideoCacheFileName, configFileName } from "@config/baseConfig"
import { readFileContents, exist, getOverwolfHotkeys, getSocialUserLoginInfo } from "@utils/overwolfUtils"
import { RootState, AppDispatch } from "./store"
import defaultSettings from "@config/defaultSettings"
import { gamesConfigs } from "@config/gamesConfigs"
// import IHotkey = overwolf.settings.hotkeys.IHotkey
import GetAudioDevicesResult = overwolf.streaming.GetAudioDevicesResult
import GetAssignedHotkeyResult = overwolf.settings.hotkeys.GetAssignedHotkeyResult
import CheckForUpdateResult= overwolf.extensions.CheckForUpdateResult

interface CounterState {
    socialsInfo: SocialUser[],
    checkForUpdateResult?: CheckForUpdateResult, // 是否存在新版本更新
    isWritingVideoCache: boolean, // 视频缓存文件是否被占用
    isFirstEnter: boolean, // 是否第一次进入app
    hotkeys: GetAssignedHotkeyResult | undefined, // 热键设置
    videoFolderPath: string, // 视频录制路径
    autoLaunchWithOverwolf: boolean, // 应用是否自启动
    routerPath: string, // 缓存需要跳转的路径
    isChangeSetting: boolean, // 是否改变了配置未保存
    videoCache: VideoCache | void,
    videoDetailData?: VideoCacheData,
    settingConfig: SettingConfig, // 总配置信息
    audioDevices?: GetAudioDevicesResult, // 音频设备信息
    updateProgressNum: number// 更新的进度条
}

const initialState: CounterState = {
    socialsInfo: [
        // {
        //     type: "Reddit"
        // },
        {
            type: "Youtube"
        },
        // {
        //     type: "Discord"
        // },
        {
            type: "Twitter"
        },
        {
            type: "Gfycat"
        }
    ],
    checkForUpdateResult: undefined,
    isWritingVideoCache: false,
    isFirstEnter: localStorage.getItem("isFirstEnter") !== "false",
    hotkeys: undefined,
    videoFolderPath: "",
    routerPath: "",
    isChangeSetting: false,
    videoCache: undefined,
    videoDetailData: undefined,
    settingConfig: defaultSettings,
    autoLaunchWithOverwolf: false,
    updateProgressNum: 0
}

export const getVideoCacheData = createAsyncThunk<VideoCache | void, void, { dispatch: AppDispatch, state: RootState }>(
    "main/getVideoCacheData",
    async () => {
        const videoCache = await checkCacheData()

        return videoCache
    }
)

export const getSettingConfig = createAsyncThunk<SettingConfig | void, void, { dispatch: AppDispatch, state: RootState }>(
    "main/getSettingConfig",
    async () => {
        const settingConfig: SettingConfig = { ...defaultSettings, ...await readFileContents<SettingConfig>(configFileName) } 
        console.log("配置：", settingConfig)
     
        gamesConfigs.forEach((e) => {
            if (!settingConfig.gameSettings.find((v) => v.gameId === e.gameId)) {
                settingConfig.gameSettings.push({
                    gameId: e.gameId,
                    manualBeforTime: 10, // 手动录制往前时间
                    manualAfterTime: 10, // 手动录制往后时间
                    autoBeforTime: 10, // 自动录制往前时间
                    autoAfterTime: 10, // 自动录制往后时间
                    autoRecordEvents: true,
                    events: e.events
                })
            }
        })

        return settingConfig
    }
)

export const getHotkeys = createAsyncThunk<GetAssignedHotkeyResult, void, { dispatch: AppDispatch, state: RootState }>(
    "main/getHotkeys",
    async () => {
        return await getOverwolfHotkeys()
    }
)

export const getSocialsInfo = createAsyncThunk<SocialUser[], SocialUser["type"], { dispatch: AppDispatch, state: RootState }>(
    "main/getSocialsInfo",
    async (params) => {
        return await getSocialUserLoginInfo(params)
    }
)

export const counterSlice = createSlice({
    name: "main",
    initialState,
    reducers: {
        setCheckForUpdateResult: (state, action: PayloadAction<CheckForUpdateResult>) => {
            // action.payload.state = "UpdateAvailable"
            state.checkForUpdateResult = action.payload
        },
        changeEnterStatus: (state, action: PayloadAction<boolean>) => {
            state.isFirstEnter = action.payload
            localStorage.setItem("isFirstEnter", `${action.payload}`)
        },
        setIsWritingVideoCache: (state, action: PayloadAction<boolean>) => {
            state.isWritingVideoCache = action.payload
        },
        setHotkeys: (state, action: PayloadAction<GetAssignedHotkeyResult | undefined>) => {
            state.hotkeys = action.payload
        },
        setVideoFolderPath: (state, action: PayloadAction<string>) => {
            state.videoFolderPath = action.payload
        },
        setAutoLaunchWithOverwolf: (state, action: PayloadAction<boolean>) => {
            state.autoLaunchWithOverwolf = action.payload
        },
        setVideoDetailData: (state, action: PayloadAction<VideoCacheData>) => {
            state.videoDetailData = action.payload
        },
        setVideoCache: (state, action: PayloadAction<VideoCache>) => {
            state.videoCache = action.payload
        },
        setSettingConfig: (state, action: PayloadAction<SettingConfig>) => {
            state.settingConfig = action.payload
        },
        setRouterPath: (state, action: PayloadAction<string>) => {
            state.routerPath = action.payload
        },
        setIsChangeSetting: (state, action: PayloadAction<boolean>) => {
            state.isChangeSetting = action.payload
        },
        setAudioDevices: (state, action: PayloadAction<GetAudioDevicesResult>) => {
            state.audioDevices = action.payload
        },
        setUpdateProgressNum: (state, action: PayloadAction<number>) => {
            state.updateProgressNum = action.payload
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getVideoCacheData.fulfilled, (state, action) => {
            state.videoCache = action.payload

            if (state.videoCache) {
                state.isWritingVideoCache = state.videoCache.isWriting
            }
        }),
        builder.addCase(getSocialsInfo.fulfilled, (state, action) => {
            if (state.socialsInfo.length) {
                state.socialsInfo = state.socialsInfo.map((e) => {
                    action.payload.forEach((v) => {
                        if (e.type === v.type)e = v
                    })

                    return e
                })
            } else {
                state.socialsInfo = action.payload
            }
            console.log("state.socialsInfo", state.socialsInfo)
            
        }),
        builder.addCase(getSettingConfig.fulfilled, (state, action) => {
            state.settingConfig = { ...defaultSettings, ...action.payload }
        }),
        builder.addCase(getHotkeys.fulfilled, (state, action) => {
            state.hotkeys = action.payload 
        })
    }
})

// 防止用户手动删除出现无效路径
async function checkCacheData (): Promise<VideoCache | void> {
    const videoCache = await readFileContents<VideoCache>(VideoCacheFileName)

    if (videoCache) {
        const videoCacheData: VideoCacheData[] = []

        for (let i = 0; i < videoCache.data.length; i++) {
            const e = videoCache.data[i]
            const clips = []

            for (let j = 0; j < e.clips.length; j++) {
                const v = e.clips[j]
                const isExistChild = await exist(v.filePath)

                if (isExistChild) clips.push(v)
            }
            e.clips = clips

            if (e.clips.length) videoCacheData.push(e)
        
        }
        videoCache.data = videoCacheData
    }

    return videoCache
}

export const {
    setCheckForUpdateResult,
    changeEnterStatus,
    setIsWritingVideoCache,
    setHotkeys,
    setVideoFolderPath,
    setAutoLaunchWithOverwolf,
    setVideoDetailData,
    setVideoCache,
    setSettingConfig,
    setRouterPath,
    setIsChangeSetting,
    setAudioDevices,
    setUpdateProgressNum
} = counterSlice.actions

export default counterSlice.reducer
