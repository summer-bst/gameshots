import React, { useState, useEffect, useLayoutEffect, useCallback, useMemo } from "react"
import { FormattedMessage, useIntl } from "react-intl"
import SvgIcon from "@component/SvgIcon"
import Button from "@component/Button"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "../../redux/store"
import Switch from "@component/Switch"
import Select from "@component/Select"
import SelectCard from "@component/SelectCard"
import VolumeControl from "@component/VolumeControl"
import { setIsChangeSetting, setAudioDevices } from "../../redux/main"
import useSetting from "../setSetting"
import { capitalize } from "@utils/utils"
import defaultEncoderValue from "@config/defaultEncoderValue"
import { getDefaultStreamEncoder } from "@utils/overwolfUtils"
import AudioDeviceData = overwolf.streaming.AudioDeviceData
import EncoderData = overwolf.streaming.EncoderData

const { getAudioDevices, getStreamEncoders } = overwolf.streaming

const kbpsData: number[] = []
const fpsData: number[] = [ 20, 30, 60, 120 ]
let kbpsItem = 2000

while (kbpsItem <= 100000) {
    kbpsData.push(kbpsItem)
    kbpsItem += kbpsItem < 20000
        ? 2000
        : 10000
}

export const qualitys: Quality[] = [
    {
        resolution: 480,
        abbreviation: "（SD）",
        fps: 20,
        type: "lq",
        id: "LowQuality"
    },
    {
        resolution: 720,
        abbreviation: "（HD）",
        fps: 30,
        type: "mq",
        id: "mediumQuality"
    },
    {
        resolution: 1080,
        abbreviation: "（Full HD）",
        fps: 60,
        type: "hq",
        id: "highQuality"
    }
]

const Capture = () => {
    const { settingConfig, audioDevices, isChangeSetting } = useSelector((state: RootState) => state.main)
    const dispatch = useDispatch()
    const setSetting = useSetting()
    const intl = useIntl()
    const [ kbps, setKbps ] = useState(6000)
    const [ resolution, setResolution ] = useState<SettingConfig["resolution"]>(720)
    const [ fps, setFps ] = useState(30)
    const [ isCaptureCustom, setIsCaptureCustom ] = useState(settingConfig.isCaptureCustom)
    const [ isShowAdvacedSetting, setIsShowAdvacedSetting ] = useState(false)
    const [ playbackDeviceId, setPlaybackDeviceId ] = useState("")// 系统声音设备id
    const [ recordingDeviceId, setRecordingDeviceId ] = useState("")// 麦克风声音设备id
    const [ sysVolume, setSysVolume ] = useState(100)
    const [ microphoneVolume, setMicrophoneVolume ] = useState(100)
    const [ playbackDevices, setPlaybackDevice ] = useState<AudioDeviceData[]>([])
    const [ recordingDevices, setRecordingkDevice ] = useState<AudioDeviceData[]>([])
    const [ streamEncoders, setStreamEncoders ] = useState<EncoderData[]>([])
    const [ endoderName, setEndoderName ] = useState<StreamEncoder>()

    const [ streamPresets, setStreamPresets ] = useState<{
        render: string,
        value: string
    }[]>([])
    const [ preset, setPreset ] = useState(settingConfig.preset)

    const resolutions = useMemo(() => [ { value: 0, render: <span>Source</span> }, ...qualitys.map((e) => ({
        value: e.resolution,
        render: (
            <span>
                {e.resolution + e.abbreviation}
            </span>
        )
    })) ], [])

    const saveChanges = useCallback(() => {
        let config = JSON.parse(JSON.stringify(settingConfig)) as SettingConfig
        config = {
            ...config,
            kbps,
            fps,
            resolution,
            isCaptureCustom,
            mic: {
                enable: true,
                volume: microphoneVolume,
                device_id: recordingDeviceId
            },
            game: {
                enable: true,
                volume: sysVolume,
                device_id: playbackDeviceId
            },
            endoderName,
            preset
        }
        setSetting(config, "capture_settings_changed")
    }, [
        preset,
        endoderName,
        sysVolume,
        playbackDeviceId,
        microphoneVolume,
        recordingDeviceId,
        settingConfig,
        fps,
        kbps,
        resolution,
        isCaptureCustom,
        setSetting
    ])
    useEffect(() => {
        // 获取音频设备信息
        getAudioDevices((audioRes) => {
            console.log("音频设置", audioRes)
            dispatch(setAudioDevices(audioRes))
        })
        getStreamEncoders((e) => {
            if (e.success && e.encoders) {
                console.log("视频编码列表", e.encoders)
                const encoders = e.encoders.filter((v) => v.enabled)
                setStreamEncoders(encoders)
            }
        })
    }, [ dispatch ])
    useLayoutEffect(() => {
        const { endoderName } = settingConfig
        const { kbps, isCaptureCustom, fps, resolution } = settingConfig
        setKbps(kbps)
        setFps(fps)
        setResolution(resolution)
        setIsCaptureCustom(isCaptureCustom)

        if (endoderName) {
            setEndoderName(endoderName)
        } else {
            getDefaultStreamEncoder(streamEncoders).then((res) => {
                setEndoderName(res)
            })
        }

    }, [ settingConfig, streamEncoders ])
    useEffect(() => {
        const presets =
            streamEncoders
                .find((e) => e.name === endoderName)?.presets
                .map((e) => ({
                    value: e,
                    render: capitalize(e.toLowerCase()).replaceAll("_", "  ")
                }))

        if (presets) {
            setStreamPresets(presets)
        }

        if (endoderName)setPreset(defaultEncoderValue[endoderName])
        
    }, [ endoderName, streamEncoders ])
    
    useEffect(() => {
        if (audioDevices?.devices) {
            const defaultAudioDeviceData: AudioDeviceData = {
                display_name: intl.formatMessage({ id: "systemDefault" }),
                device_id: "",
                can_playback: false,
                can_record: false,
                device_state: "",
                device_setting_id: ""
            }
            setPlaybackDevice([ defaultAudioDeviceData, ...audioDevices.devices.filter((e) => e.can_playback) ])
            setRecordingkDevice([ defaultAudioDeviceData, ...audioDevices.devices.filter((e) => e.can_record) ])
        }
    }, [ audioDevices, intl ])
    
    useLayoutEffect(() => {
        const { game, mic } = settingConfig
        const isGame = audioDevices?.devices?.find((e) => e.can_playback && e.device_id === game?.device_id)
        const isMic = audioDevices?.devices?.find((e) => e.can_record && e.device_id === mic?.device_id)

        if (isGame && game?.device_id) setPlaybackDeviceId(game.device_id)

        if (isMic && mic?.device_id) setRecordingDeviceId(mic.device_id)

        if (game?.volume !== undefined) setSysVolume(game.volume)

        if (mic?.volume !== undefined) setMicrophoneVolume(mic.volume)

    }, [ settingConfig, audioDevices ])

    return (
        <div className="setting-content">
            <div className="setting-content-title">
                <FormattedMessage id="videoControls" />
            </div>
            <div className="setting-content-item">
                <FormattedMessage id="settingExplain2" />
            </div>
            <div className="setting-content-item">
                {qualitys.map((e) => (
                    <div
                        className={`setting-content-fps 
                        ${e.fps === fps && e.resolution === resolution && !isCaptureCustom
                            ? "setting-content-fps-active"
                            : ""
                            }`}
                        key={e.id}
                        onClick={() => {
                            setFps(e.fps)
                            setResolution(e.resolution)
                            setKbps(6000)
                            setIsCaptureCustom(false)
                            dispatch(setIsChangeSetting(true))
                        }}
                    >
                        <div className="setting-content-fps-icon">
                            <SvgIcon icon={e.type} />
                        </div>
                        <div className="setting-content-fqs-m">
                            <div className="setting-content-fqs-name">
                                <FormattedMessage id={e.id} />
                            </div>
                            <div className="setting-content-fqs-num">
                                {e.resolution}
                                p
                                {" "}
                                {e.fps}
                                fps
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="setting-content-capture">
                <div className="setting-content-item">
                    <FormattedMessage id="settingTitle1" />
                    <Switch
                        checked={isCaptureCustom}
                        onChange={(check) => {
                            setFps(30)
                            setResolution(720)
                            setKbps(6000)
                            setIsCaptureCustom(check)
                            dispatch(setIsChangeSetting(true))
                        }}
                    />
                </div>
                {
                    isCaptureCustom && (
                        <>
                            <div className="setting-content-item">
                                <div className="setting-content-select">
                                    <FormattedMessage id="resolution" />
                                    <Select
                                        data={resolutions}
                                        onChange={(val) => {
                                            setResolution(val)
                                            dispatch(setIsChangeSetting(true))
                                        }}
                                        optionstitle=""
                                        value={resolution}
                                    />
                                </div>
                                <div className="setting-content-select">
                                    <FormattedMessage id="Bitrate" />
                                    (Kbps)
                                    <Select
                                        data={kbpsData.map((e) => ({
                                            value: e, render: (
                                                <span>
                                                    {e}
                                                </span>
                                            )
                                        }))}
                                        listHeight={200}
                                        onChange={(val) => {
                                            setKbps(val)
                                            dispatch(setIsChangeSetting(true))
                                        }}
                                        value={kbps}
                                    />
                                </div>
                            </div>
                            <div className="setting-content-item">
                                <div className="setting-content-select">
                                    <FormattedMessage id="resolution" />
                                    (fps)
                                    <SelectCard
                                        data={fpsData}
                                        onChange={(val) => {
                                            setFps(val)
                                            dispatch(setIsChangeSetting(true))
                                        }}
                                        value={fps}
                                    />
                                </div>
                            </div>
                        </>
                    )
                }
                <div
                    className={
                        `setting-content-item ${isShowAdvacedSetting
                            ? "setting-content-active"
                            : ""}`
                    }
                    onClick={useCallback(() => setIsShowAdvacedSetting(!isShowAdvacedSetting), [ isShowAdvacedSetting ])}
                >
                    <div className="setting-content-down">
                        <FormattedMessage id="advancedSettings" /> 
                        {" "}
                        <SvgIcon icon="down" />
                    </div>
                </div>
                {
                    isShowAdvacedSetting && (
                        <>
                            <div className="setting-content-item">
                                <div className="setting-content-select setting-content-advanced">
                                    <FormattedMessage id="encoder" />
                                    <Select
                                        data={streamEncoders.map((e) => ({ value: e.name, render: e.display_name }))}
                                        getPopupContainer={(triggerNode) => triggerNode.parentElement}
                                        onChange={(val) => {
                                            setEndoderName(val)
                                            dispatch(setIsChangeSetting(true))
                                        }}
                                        value={endoderName}
                                    />
                                </div>
                            </div>
                            <div className="setting-content-item">
                                <div className="setting-content-select setting-content-advanced">
                                    <FormattedMessage id="preset" />
                                    <Select
                                        data={streamPresets}
                                        getPopupContainer={(triggerNode) => triggerNode.parentElement}
                                        onChange={(val) => {
                                            setPreset(val)
                                            dispatch(setIsChangeSetting(true))
                                        }}
                                        value={preset}
                                    />
                                </div>
                            </div>
                        </>
                    )
                }
                <div className="setting-content-title">
                    <FormattedMessage id="audioControls" />
                </div>
                <div className="setting-content-item">
                    <FormattedMessage id="captureSystemSound" />
                </div>
                <div className="setting-content-item">
                    <div className="setting-content-select">
                        <FormattedMessage id="device" />
                        <Select
                            data={playbackDevices.map((e) => ({ value: e.device_id, render: e.display_name }))}
                            getPopupContainer={(triggerNode) => triggerNode.parentElement}
                            onChange={(val) => {
                                setPlaybackDeviceId(val)
                                dispatch(setIsChangeSetting(true))
                            }}
                            value={playbackDeviceId}
                        />
                    </div>
                    <div className="setting-content-select setting-content-volum">
                        <VolumeControl
                            onChange={(val) => {
                                setSysVolume(val)
                                dispatch(setIsChangeSetting(true))
                            }}
                            value={sysVolume}
                        />
                    </div>
                </div>
                <div className="setting-content-item">
                    <FormattedMessage id="captureMicrophone" />
                </div>
                <div className="setting-content-item">
                    <div className="setting-content-select">
                        <FormattedMessage id="device" />
                        <Select
                            data={recordingDevices.map((e) => ({ value: e.device_id, render: e.display_name }))}
                            getPopupContainer={(triggerNode) => triggerNode.parentElement}
                            onChange={(val) => {
                                setRecordingDeviceId(val)
                                dispatch(setIsChangeSetting(true))
                            }}
                            value={recordingDeviceId}
                        />
                    </div>
                    <div className="setting-content-select setting-content-volum">
                        <VolumeControl
                            onChange={(val) => {
                                setMicrophoneVolume(val)
                                dispatch(setIsChangeSetting(true))
                            }}
                            value={microphoneVolume}
                        />
                    </div>
                </div>
            </div>
            <Button
                className="setting-content-save"
                disable={!isChangeSetting}
                onClick={saveChanges}
                theme="yellow"
            >
                <FormattedMessage id="saveChanges" />
            </Button>
        </div>

    )
}

export default Capture