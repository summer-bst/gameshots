import React, { useEffect, useState, memo, useCallback } from "react"
import { FormattedMessage, useIntl } from "react-intl"
import { useSelector, useDispatch } from "react-redux"
import Button from "@component/Button"
import Input from "@component/Input"
import Message from "@component/Message"
import { openFolderPicker } from "@utils/overwolfUtils"
import { RootState } from "../../redux/store"
import { setIsChangeSetting, setVideoFolderPath } from "../../redux/main"
import useSetting from "../setSetting"

const Storage = () => {
    const { settingConfig, isChangeSetting, videoFolderPath } = useSelector((state: RootState) => state.main)
    const [ spaceValue, setSpaceValue ] = useState<number>(settingConfig.videoSapceLimit)
    const dispatch = useDispatch()
    const intl = useIntl()
    const setSetting = useSetting()

    const saveChanges = useCallback(
        async () => {
            if (spaceValue < 5) return Message.error(intl.formatMessage({ id: "tip23" }))
            const config = JSON.parse(JSON.stringify(settingConfig)) as SettingConfig
            config.videoSapceLimit = spaceValue
            // 设置视频保存地址
            overwolf.settings.setOverwolfVideosFolder(videoFolderPath, () => {
                setSetting(config, "storage_settings_changed")
            })
        },
        [ videoFolderPath, intl, settingConfig, spaceValue, setSetting ]
    )
  
    useEffect(() => {
        setSpaceValue(settingConfig.videoSapceLimit)
    }, [ settingConfig ])
    
    useEffect(() => {
        // 获取视频存放路径
        overwolf.settings.getOverwolfVideosFolder((result) => {
            if (result.success) {
                dispatch(setVideoFolderPath(result.path.Value))
            }
        })
    }, [ dispatch ])

    return (
        <div className="setting-content">
            <div className="setting-content-title">
                <FormattedMessage id="storageSettings" />
            </div>
            <div className="setting-content-item">
                <div>
                    <div className="setting-content-item-explain">
                        <FormattedMessage id="explain9" />
                    </div>
                    <div className="setting-content-item-path">
                        {videoFolderPath}
                    </div>
                </div>
                <Button
                    onClick={() => openFolderPicker(videoFolderPath).then((path) => {
                        dispatch(setIsChangeSetting(true))
                        dispatch(setVideoFolderPath(path))
                    })}
                    small
                >
                    <FormattedMessage id="chooseFolder" />
                </Button>
            </div>
            <div className="setting-content-item">
                <FormattedMessage id="settingExplain3" />
                <div>
                    <Input
                        max={1024}
                        onChange={(val) => {
                            dispatch(setIsChangeSetting(true))
                            setSpaceValue(val)
                        }}
                        type="number"
                        value={spaceValue}
                    />
                    <span className="setting-content-gb">GB</span>
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

export default memo(Storage)