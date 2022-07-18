import { useCallback } from "react"
import Message from "@component/Message"
import { configFileName } from "@config/baseConfig"
import { writeFileContents } from "@utils/overwolfUtils"
import { setSettingConfig, setIsChangeSetting } from "../redux/main"
import { useIntl } from "react-intl"
import { AppDispatch, RootState } from "../redux/store"
import { postUserStats } from "../redux/request"
import { useDispatch, useSelector } from "react-redux"
import { gamesConfigs } from "@config/gamesConfigs"

const useSetting = () => {
    const intl = useIntl()
    const dispatch = useDispatch<AppDispatch>()
    const { videoFolderPath, autoLaunchWithOverwolf, audioDevices } = useSelector((state: RootState) => state.main)

    return useCallback(async (config: SettingConfig, eventType: UserStatsEventType, isMessage = true, gameSettingsChangedValues: number[] = []) => {
        return new Promise<void>((resolve, reject) => {
            writeFileContents(configFileName, JSON.stringify(config))
                .then(() => {
                    const gameDevice = audioDevices?.devices?.find((e) => e.can_playback && e.device_id === config.game?.device_id)
                    const micDevice = audioDevices?.devices?.find((e) => e.can_record && e.device_id === config.mic?.device_id)
                    // 设置打点
                    dispatch(postUserStats({
                        event_type: eventType,
                        overlay_settings: {
                            auto_launch: autoLaunchWithOverwolf,
                            overwolf_overlay_enabled: config.enableOverlay
                        },
                        game_settings: config.gameSettings.map((e) => {
                            const captureEvents: Record<string, boolean> = {}
                            e.events.forEach((v) => captureEvents[v.key] = !!v.enable)

                            return {
                                game_id: e.gameId.toString(),
                                game_name: gamesConfigs.find((v) => v.gameId === e.gameId)?.name || "",
                                is_changed: gameSettingsChangedValues.includes(e.gameId),
                                manual_capture_settings: {
                                    before_time: e.manualBeforTime.toString(),
                                    after_time: e.manualAfterTime.toString()
                                },
                                auto_capture_settings: {
                                    before_time: e.autoBeforTime.toString(),
                                    after_time: e.autoAfterTime.toString(),
                                    capture_events: captureEvents
                                }
                            }
                        }),
                        capture_settings: {
                            fps: config.fps.toString(),
                            resolution: config.resolution.toString(),
                            bitrate: config.kbps.toString(),
                            encoder: config.endoderName || "",
                            preset: config.preset || "",
                            is_customised_settings: config.isCaptureCustom,
                            capture_system_sound: config.game?.volume?.toString() || "",
                            system_sound_device: gameDevice?.display_name || "Default",
                            capture_microphone_sound: config.mic?.volume?.toString() || "",
                            microphone_sound_device: micDevice?.display_name || "Default"
                        },
                        storage_settings: {
                            disk_space_limit: config.videoSapceLimit.toString(),
                            drive_name: videoFolderPath
                        }
                    }))
                    dispatch(setSettingConfig(config))
                    dispatch(setIsChangeSetting(false))
                    isMessage && Message.success(intl.formatMessage({ id: "saveSuccess" }))
                    resolve()
                })
                .catch(() => {
                    console.log("写入配置文件失败")
                    reject()
                })
        })
    }, [ dispatch, intl, autoLaunchWithOverwolf, audioDevices, videoFolderPath ]) 
}

export default useSetting