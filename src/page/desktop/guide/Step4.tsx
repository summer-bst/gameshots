
import React, { useState, useCallback, useLayoutEffect } from "react"
import { FormattedMessage, useIntl } from "react-intl"
import Button from "@component/Button"
import { Link, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "../redux/store"
import { setVideoFolderPath, setAutoLaunchWithOverwolf } from "../redux/main"
import Switch from "@component/Switch"
import Input from "@component/Input"
import { openFolderPicker } from "@utils/overwolfUtils"
import { gamesConfigs } from "@config/gamesConfigs"
import useSetting from "../setting/setSetting"
import Message from "@component/Message"

const Step4 = () => {
    const { videoFolderPath, autoLaunchWithOverwolf, settingConfig } = useSelector((state: RootState) => state.main)
    const dispatch = useDispatch()
    const setSetting = useSetting()
    const intl = useIntl()
    const navigate = useNavigate()
    const [ inputValue, setInputValue ] = useState<number>(30)
    const [ isRecordEvents, setIsRecordEvents ] = useState(false)// 是否启用自动录制
    useLayoutEffect(() => {
        const firstGame = settingConfig.gameSettings?.[0]

        if (firstGame.events.filter((e) => e.enable).length) {
            setIsRecordEvents(true)
        }

        if (firstGame.autoAfterTime === firstGame.autoBeforTime) {
            setInputValue(firstGame.autoAfterTime)
        }
    }, [ settingConfig ])

    const setAutoLaunch = useCallback((check: boolean) => {
        overwolf.settings.setExtensionSettings({
            auto_launch_with_overwolf: check
        }, (res) => {
            console.log("auto_launch_with_overwolf", res)
            
            dispatch(setAutoLaunchWithOverwolf(check))
        })
    }, [ dispatch ])

    const saveChanges = useCallback(() => {
        const config = JSON.parse(JSON.stringify(settingConfig)) as SettingConfig
        config.gameSettings.forEach((e) => {
            const events = gamesConfigs.find((v) => v.gameId === e.gameId)?.events
 
            if (events) {
                e.events = events.map((v) => ({ ...v, enable: isRecordEvents }))
            }
            e.autoAfterTime = inputValue
            e.autoBeforTime = inputValue
        })
        setSetting(config, "overlay_settings_changed", false)
    }, [ settingConfig, isRecordEvents, inputValue, setSetting ])

    const nextStep = useCallback(
        () => {
            if (inputValue < 5) return Message.error(intl.formatMessage({ id: "settingTip3" }))
            saveChanges()
            navigate("/step5")
        },
        [ saveChanges, inputValue, navigate, intl ]
    )

    return (
        <div className="step4">
            <div className="step4-content">
                <div className="step4-title">
                    <FormattedMessage id="step3Title" />
                </div>
                <div className="step4-explain">
                    <FormattedMessage id="explain7" />
                </div>
                <div className="step4-item">
                    <div className="step4-item-title">
                        <div>
                            <FormattedMessage id="explain9" />
                        </div>
                        <div className="step4-item-path">
                            {videoFolderPath}
                        </div>
                    </div>
                    <Button
                        onClick={() =>
                            openFolderPicker(videoFolderPath)
                                .then((path) => overwolf.settings.setOverwolfVideosFolder(path, () => dispatch(setVideoFolderPath(path))
                                ))}
                        small
                    >
                        <FormattedMessage id="chooseFolder" />
                    </Button>
                </div>
                <div className="step4-item">
                    <div className="step4-item-title">
                        <div>
                            <FormattedMessage id="explain10" />
                        </div>
                    </div>
                    <Switch
                        checked={autoLaunchWithOverwolf}
                        onChange={setAutoLaunch}
                    />
                </div>
                <div className="step4-item">
                    <div className="step4-item-title">
                        <div>
                            <FormattedMessage id="explain11" />
                        </div>
                    </div>
                    <Switch
                        checked={isRecordEvents}
                        onChange={setIsRecordEvents}
                    />
                </div>
                <div className="step4-item">
                    <div className="step4-item-title">
                        <div>
                            <FormattedMessage id="explain13" />
                        </div>
                    </div>
                    <div>
                        <span className="step4-item-secs">
                            <FormattedMessage id="secs" />
                        </span>
                        <Input
                            max={30}
                            maxLength={2}
                            min={0}
                            onChange={setInputValue}
                            type="number"
                            value={inputValue}
                        />
                    </div>
                </div>
            </div>
            <div className="guide-footer">
                <Link to="/step3">
                    <Button onClick={saveChanges}>
                        <FormattedMessage id="back" />
                    </Button>
                </Link>
                <Button onClick={nextStep} theme="yellow">
                    <FormattedMessage id="next" />
                </Button>
            </div>
        </div>
    )
}

export default Step4
