import React, { useState, useEffect, useCallback } from "react"
import { FormattedMessage } from "react-intl"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "../../redux/store"
import { setAutoLaunchWithOverwolf, setIsChangeSetting } from "../../redux/main"
import useSetting from "../setSetting"
import Switch from "@component/Switch"
import Button from "@component/Button"
import Message from "@component/Message"

const Overlay = () => {
    const { autoLaunchWithOverwolf, settingConfig, isChangeSetting } = useSelector((state: RootState) => state.main)
    const [ enableOverlay, setEnableOverlay ] = useState(settingConfig.enableOverlay)
    const dispatch = useDispatch()
    const [ autoLaunch, setAutoLaunch ] = useState(autoLaunchWithOverwolf)
    const setSetting = useSetting()
    useEffect(() => {
        setEnableOverlay(settingConfig.enableOverlay)
    }, [ settingConfig ])
    
    const saveChanges = useCallback(async () => {
        const config = JSON.parse(JSON.stringify(settingConfig)) as SettingConfig
        config.enableOverlay = enableOverlay

        overwolf.settings.setExtensionSettings({
            auto_launch_with_overwolf: autoLaunch
        }, (result) => {
            if (result.success) {
                setSetting(config, "game_settings_changed")
                    .then(() => {
                        dispatch(setIsChangeSetting(false))
                        dispatch(setAutoLaunchWithOverwolf(autoLaunch))
                    })
            } else {
                Message.error("error")
            }
        })
        
    }, [ settingConfig, dispatch, enableOverlay, autoLaunch, setSetting ])

    return (
        <div className="setting-content">
            <div className="setting-content-title">
                <FormattedMessage id="overlay" />
            </div>
            <div className="setting-content-item">
                <FormattedMessage id="autoLaunch" />
                <Switch
                    checked={autoLaunch}
                    onChange={(check) => {
                        dispatch(setIsChangeSetting(true))
                        setAutoLaunch(check)
                        // dispatch(setAutoLaunchWithOverwolf(check))
                    }}
                />
            </div>
            <div className="setting-content-item">
                <FormattedMessage id="settingExplain1" />
                <Switch
                    checked={enableOverlay}
                    onChange={(check) => {
                        dispatch(setIsChangeSetting(true))
                        setEnableOverlay(check)
                    }}
                />
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

export default Overlay