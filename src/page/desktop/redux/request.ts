import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { RootState, AppDispatch } from "./store"
import { clientId } from "@config/baseConfig"
axios.defaults.baseURL = AXIOS_BASEURL

const initialState: requestState = {
    headerParams: {
        gtvUserId: localStorage.getItem("gtvUserId") || "",
        gtvAuthToken: localStorage.getItem("gtvAuthToken") || ""
    },
    userConfig: undefined,
    userInfo: undefined,
    userClubs: undefined,
    userId: localStorage.getItem("userId") || "null",
    username: localStorage.getItem("username") || "null",
    machineId: localStorage.getItem("machineId") || "null",
    gamestatus: [],
    updateLogs: undefined
}

// 获取全部游戏的事件状态
export const getGamestatus = createAsyncThunk<Gamestatus, void, { dispatch: AppDispatch, state: RootState }>(
    "request/getGamestatus",
    async () => {
        return (await axios({
            url: "https://game-events-status.overwolf.com/gamestatus_prod.json"
        })).data
    }
)

// 获取全部更新日志
export const getUpdateLogs = createAsyncThunk<UpdateLogs, void, { dispatch: AppDispatch, state: RootState }>(
    "request/getUpdateLogs",
    async () => {
        return (await axios({
            url: `https://console-api.overwolf.com/v1/apps/gagnacdocngfakjfaajkbbbbadimedkcafgopaih/versions/${VERSION}/release-notes/1`
        })).data
    }
)

export const getUserConfig = createAsyncThunk<UserConfig, void, { dispatch: AppDispatch, state: RootState }>(
    "request/getUserConfig",
    async (params, thunkAPI) => {
        const { headerParams: { gtvUserId, gtvAuthToken } } = thunkAPI.getState().request

        return (await axios({
            url: "/tpc/api/v1/client/config",
            headers: {
                Authorization: `Bearer ${gtvAuthToken}`,
                "Client-Id": clientId
            },
            params: {
                gtv_user_id: gtvUserId
            }
        }))?.data?.data
    }
)

export const getUserInfo = createAsyncThunk<UserInfo, void, { dispatch: AppDispatch, state: RootState }>(
    "request/getUserInfo",
    async (params, thunkAPI) => {
        const { username, machineId, userId, headerParams: { gtvUserId, gtvAuthToken } } = thunkAPI.getState().request

        return (await axios({
            url: "/tpc/api/v1/user",
            headers: {
                Authorization: `Bearer ${gtvAuthToken}`,
                "Client-Id": clientId
            },
            params: {
                gtv_user_id: gtvUserId,
                user_machine_id: machineId,
                client_user_id: username,
                client_install_id: userId,
                app_version: VERSION
            }
        }))?.data?.data
    }
)

// 解除绑定
export const deleteUserInfo = createAsyncThunk<undefined, void, { dispatch: AppDispatch, state: RootState }>(
    "request/deleteUserInfo",
    async (params, thunkAPI) => {
        const { username, machineId, userId, headerParams: { gtvUserId, gtvAuthToken } } = thunkAPI.getState().request

        await axios({
            method: "DELETE",
            url: "/tpc/api/v1/user",
            headers: {
                Authorization: `Bearer ${gtvAuthToken}`,
                "Client-Id": clientId
            },
            params: {
                gtv_user_id: gtvUserId,
                user_machine_id: machineId,
                client_user_id: username,
                client_install_id: userId,
                app_version: VERSION
            }
        })

        return undefined
    }
)

export const getUserClubs = createAsyncThunk<UserClub[], void, { dispatch: AppDispatch, state: RootState }>(
    "request/getUserClubs",
    async (params, thunkAPI) => {
        const { gtvUserId, gtvAuthToken } = thunkAPI.getState().request.headerParams

        return (await axios({
            url: "/tpc/api/v1/user/clubs",
            headers: {
                Authorization: `Bearer ${gtvAuthToken}`,
                "Client-Id": clientId
            },
            params: {
                gtv_user_id: gtvUserId
            }
        }))?.data?.data?.user_clubs
    }
)

const postFile = async (params: ShareContent, thunkAPI: any, assetType: "clip" | "thumbnail") => {
    const { gtvUserId, gtvAuthToken } = thunkAPI.getState().request.headerParams
    const { thumbnailFile, clipFile, description, tags } = params

    const thumbnailUrl: UploadData = (await axios({
        url: "/tpc/api/v1/content/upload-url",
        headers: {
            Authorization: `Bearer ${gtvAuthToken}`,
            "Client-Id": clientId
        },
        params: {
            gtv_user_id: gtvUserId,
            asset_type: assetType
        }
    }))?.data?.data

    const formData = new FormData()
    thumbnailUrl.upload_metadata.forEach((e: Record<string, string>) => {
        formData.append(e.key, e.value)
    })

    formData.append(
        "file",
        assetType === "thumbnail"
            ? thumbnailFile
            : clipFile
    )

    const responseText: string = (await axios({
        // headers: {
        //     Authorization: `Bearer ${gtvAuthToken}`,
        //     "Client-Id": clientId
        // },
        method: "POST",
        url: thumbnailUrl.upload_url,
        data: formData
    }))?.data
    const response = `<PostResponse>${responseText.substring(responseText.indexOf("<PostResponse>") + 14, responseText.length)}`
    const contentId = responseText.substring(responseText.indexOf("<Key>") + 5, responseText.indexOf("</Key>"))

    return {
        asset_type: assetType,
        content_id: contentId,
        response,
        description,
        tags
    }
}

// 仅作为gametv的分享接口
export const postShare = createAsyncThunk<Promise<any>, ShareContent, { dispatch: AppDispatch, state: RootState }>(
    "request/postShare",
    async (params, thunkAPI) => {
        
        const { username, machineId, userId, headerParams: { gtvUserId, gtvAuthToken } } = thunkAPI.getState().request
        const { clubId, sessionId, clipId, clipDuration, clipCaptureType, gameId, gameName } = params

        const content = await Promise.all([
            postFile(params, thunkAPI, "thumbnail"),
            postFile(params, thunkAPI, "clip")
        ])
        
        return axios({
            method: "POST",
            url: "/tpc/api/v1/content",
            headers: {
                Authorization: `Bearer ${gtvAuthToken}`,
                "Client-Id": clientId
            },
            data: {
                gtv_user_id: gtvUserId,
                user_machine_id: machineId,
                client_user_id: username,
                client_install_id: userId,
                club_id: clubId,
                session_id: sessionId,
                clip_id: clipId,
                clip_duration: clipDuration,
                clip_capture_type: clipCaptureType,
                content,
                clip_share_platform: "game.tv",
                game_id: gameId,
                game_name: gameName,
                app_version: VERSION
            }
        })
    }
)

// 设置改变打点接口
export const postUserStats = createAsyncThunk<Promise<any>, UserStatsParams, { dispatch: AppDispatch, state: RootState }>(
    "request/postUserStats",
    async (params, thunkAPI) => {
        const { username, machineId, userId, headerParams: { gtvUserId, gtvAuthToken } } = thunkAPI.getState().request

        return axios({
            url: "/tpc/api/v1/user/stats", 
            method: "POST",
            headers: {
                Authorization: `Bearer ${gtvAuthToken}`,
                "Client-Id": clientId
            },
            data: {
                gtv_user_id: gtvUserId,
                user_machine_id: machineId,
                client_user_id: username,
                client_install_id: userId,
                app_version: VERSION,
                ...params
            }
        })
    }
)

// 视频操作打点接口
export const postContentStats = createAsyncThunk<Promise<unknown>, ContentStatsParams, { dispatch: AppDispatch, state: RootState }>(
    "request/postContentStats",
    async (params, thunkAPI) => {
        const { username, machineId, userId, headerParams: { gtvUserId, gtvAuthToken } } = thunkAPI.getState().request

        return axios({
            url: "/tpc/api/v1/content/stats", 
            method: "POST",
            headers: {
                Authorization: `Bearer ${gtvAuthToken}`,
                "Client-Id": clientId
            },
            data: {
                gtv_user_id: gtvUserId,
                user_machine_id: machineId,
                client_user_id: username,
                client_install_id: userId,
                app_version: VERSION,
                ...params
            }
        })
    }
)

export const counterSlice = createSlice({
    name: "request",
    initialState,
    reducers: {
        setUserNameMachineId: (state, { payload }: PayloadAction<{ username: string, machineId: string, userId: string }>) => {
            if (state.username !== payload.username || state.machineId !== payload.machineId || state.userId !== payload.userId) {
                state.userId = payload.userId
                state.username = payload.username
                state.machineId = payload.machineId
                localStorage.setItem("userId", payload.userId)
                localStorage.setItem("username", payload.username)
                localStorage.setItem("machineId", payload.machineId)
                state.headerParams = {
                    gtvUserId: "",
                    gtvAuthToken: ""
                }
                localStorage.removeItem("gtvUserId")
                localStorage.removeItem("gtvAuthToken")
            }
        },
        setHeaderParams: (state, action: PayloadAction<HeaderParams>) => {
            if (state.headerParams.gtvUserId !== action.payload.gtvUserId &&
                state.headerParams.gtvAuthToken !== action.payload.gtvAuthToken) {
                state.headerParams = action.payload
                localStorage.setItem("gtvUserId", action.payload.gtvUserId)
                localStorage.setItem("gtvAuthToken", action.payload.gtvAuthToken)
            }
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getUpdateLogs.fulfilled, (state, action) => {
            state.updateLogs = action.payload
        }),
        builder.addCase(getGamestatus.fulfilled, (state, action) => {
            state.gamestatus = action.payload
        }),
        builder.addCase(getUserConfig.fulfilled, (state, action) => {
            localStorage.setItem("diskSpaceLimit", `${action.payload.settings.disk_space_limit / 1024 ** 3}`)
            state.userConfig = action.payload
        }),
        builder.addCase(getUserInfo.fulfilled, (state, action) => {
            state.userInfo = action.payload
        }),
        builder.addCase(getUserClubs.fulfilled, (state, action) => {
            state.userClubs = action.payload
        }),
        builder.addCase(deleteUserInfo.fulfilled, (state) => {
            state.headerParams = {
                gtvUserId: "",
                gtvAuthToken: ""
            }
            state.userInfo = undefined
            state.userClubs = undefined
            localStorage.removeItem("gtvUserId")
            localStorage.removeItem("gtvAuthToken")
        })
    }
})

export const {
    setHeaderParams,
    setUserNameMachineId
} = counterSlice.actions

export default counterSlice.reducer
