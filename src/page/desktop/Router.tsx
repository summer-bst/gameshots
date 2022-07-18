import React, { useEffect, useState } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import { FormattedMessage } from "react-intl"
import CommonHeader from "@component/CommonHeader"
import LocaleProvider from "../../i18n/LocaleProvider"
import { useSelector, useDispatch } from "react-redux"
import { RootState, AppDispatch } from "./redux/store"
import {
    setCheckForUpdateResult,
    setVideoFolderPath,
    setAutoLaunchWithOverwolf,
    getSettingConfig,
    setRouterPath,
    setIsChangeSetting,
    getHotkeys,
    setAudioDevices,
    setIsWritingVideoCache,
    getVideoCacheData,
    getSocialsInfo
} from "./redux/main"
import { setUserNameMachineId, postUserStats, postContentStats, getUserConfig, getUpdateLogs } from "./redux/request"
import Modal from "@component/Modal"
import CommonLoading from "@component/CommonLoading"
import App from "./App"
import Guide from "./guide"
import Home from "./home"
import VideoLibrary from "./videoLibrary"
import Setting from "./setting"
import Help from "./help"
import VideoDetail from "./videoDetail"
import Test from "./test"
import Accounts from "./setting/page/Accounts"
import Capture from "./setting/page/Capture"
import MyGames from "./setting/page/MyGames"
import Overlay from "./setting/page/Overlay"
import Storage from "./setting/page/Storage"
import MessageReceivedEvent= overwolf.windows.MessageReceivedEvent

const { getOverwolfVideosFolder, getExtensionSettings } = overwolf.settings
const { getAudioDevices } = overwolf.streaming
const { getCurrentUser } = overwolf.profile

const Router = () => {
    const { isFirstEnter, routerPath } = useSelector((state: RootState) => state.main)
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const [ isShowTip, setIsShowTip ] = useState(false)
    const [ isInit, setIsInit ] = useState(false)
    useEffect(() => {
        if (routerPath) {
            setIsShowTip(true)
        } else {
            dispatch(setIsChangeSetting(false))
        }
    }, [ routerPath, dispatch ])

    useEffect(() => {
        Promise.all([
            // 获取热键设置信息
            dispatch(getHotkeys()),
            dispatch(getSettingConfig()),
            dispatch(getUserConfig()),
            dispatch(getVideoCacheData()),
            dispatch(getUpdateLogs()),
            // 获取全部社交平台的登录信息
            dispatch(getSocialsInfo("all")),
            new Promise<void>((resolve) => {
                getCurrentUser(({ username, machineId, userId }) => {
                    dispatch(setUserNameMachineId({ username: username || "null", machineId: machineId || "null", userId: userId || "null" }))
                    resolve()
                })
            }),
            new Promise<void>((resolve) => {
                // 获取音频设备信息
                getAudioDevices((audioRes) => {
                    console.log("音频设置", audioRes)
                    dispatch(setAudioDevices(audioRes))
                    resolve()
                })
            }),
            new Promise<void>((resolve) => {
                // 获取视频存放路径
                getOverwolfVideosFolder((result) => {
                    if (result.success) {
                        dispatch(setVideoFolderPath(result.path.Value))
                        resolve()
                    }
                })
            }),
            new Promise<void>((resolve) => {
                // 获取自启动设置
                getExtensionSettings(
                    (result) => {
                        const autoLaunchWithOverwolf = result?.settings?.auto_launch_with_overwolf === undefined
                            ? true
                            : result.settings.auto_launch_with_overwolf
                        dispatch(setAutoLaunchWithOverwolf(autoLaunchWithOverwolf))
                        resolve()
                    }
                )
            })
        ]).then(() => setIsInit(true))
        overwolf.windows.onMessageReceived.addListener((msg: MessageReceivedEvent) => {
            if (msg.id === "startWriting") {
                dispatch(setIsWritingVideoCache(true))
            }

            if (msg.id === "stopWriting") {
                dispatch(setIsWritingVideoCache(false))
            }

            if (msg.id === "restData") {
                dispatch(getVideoCacheData()).then((res) => {
                    const VideoCache = res.payload as VideoCache
                    const lastSession = VideoCache?.data?.[VideoCache.data.length - 1]
                    dispatch(postContentStats({
                        event_type: "session_captured",
                        game_id: lastSession.gameId.toString(),
                        game_name: lastSession.gameName,
                        session_id: lastSession.sessionId,
                        session_clips: lastSession.clips.map((e) => ({
                            clip_id: e.clipId,
                            clip_duration: e.clipDuration.toString(),
                            clip_capture_type: e.eventType === "manual"
                                ? "manual"
                                : "auto"
                        }))
                    }))
                })
            }
        })
        overwolf.social.twitter.onLoginStateChanged.addListener(() => dispatch(getSocialsInfo("Twitter")))
        overwolf.social.reddit.onLoginStateChanged.addListener(() => dispatch(getSocialsInfo("Reddit")))
        overwolf.social.gfycat.onLoginStateChanged.addListener(() => dispatch(getSocialsInfo("Gfycat")))
        overwolf.social.youtube.onLoginStateChanged.addListener(() => dispatch(getSocialsInfo("Youtube")))
        overwolf.social.discord.onLoginStateChanged.addListener(() => dispatch(getSocialsInfo("Discord")))
        dispatch(postUserStats({
            event_type: "app_launch"
        }))
        overwolf.extensions.checkForExtensionUpdate((res) => {
            dispatch(setCheckForUpdateResult(res))
        })
    }, [ dispatch ])

    if (!isInit) return (
        <div className="desktop-lottie-player">
            <CommonLoading />
        </div>
    )

    return (
        <LocaleProvider>
            <div className="desktop">
                <CommonHeader />
                <div className="desktop-content">
                    <Routes>
                        <Route
                            element={isFirstEnter
                                ? <Guide />
                                : <App />}
                            path="/*"
                        >
                            <Route element={<Home />} index />
                            <Route element={<VideoLibrary />} path="videoLibrary/*" />
                            <Route element={<VideoDetail />} path="videoLibrary/detail/:isFavorite" />
                            <Route element={<Setting />} path="setting/*">
                                <Route
                                    element={
                                        <Overlay />
                                    }
                                    index
                                />
                                <Route
                                    element={
                                        <Capture />
                                    }
                                    path="capture"
                                />
                                <Route
                                    element={
                                        <MyGames />
                                    }
                                    path="myGames"
                                />
                                <Route
                                    element={
                                        <Storage />
                                    }
                                    path="storage"
                                />
                                <Route
                                    element={
                                        <Accounts />
                                    }
                                    path="accounts"
                                />
                            </Route>
                            <Route element={<Help />} path="help/*" />
                            <Route element={<Test />} path="test" />
                        </Route>
                    </Routes>
                    <Modal
                        onClose={() => {
                            setIsShowTip(false)
                        }}
                        onOk={() => {
                            navigate(routerPath)
                            dispatch(setRouterPath(""))
                            setIsShowTip(false)
                        }}
                        title={<FormattedMessage id="confirmDiscardChanges" />}
                        visible={isShowTip}
                    >
                        <FormattedMessage id="tip13" />
                    </Modal>
                </div>
            </div>
        </LocaleProvider>
    )
}

export default Router