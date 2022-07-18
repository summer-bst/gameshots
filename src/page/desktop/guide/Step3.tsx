
import React, { useLayoutEffect, useState, useCallback } from "react"
import { FormattedMessage } from "react-intl"
import Button from "@component/Button"
import { Link } from "react-router-dom"
import SvgIcon from "@component/SvgIcon"
import { qualitys } from "../setting/page/Capture"
import { useSelector } from "react-redux"
import { RootState } from "../redux/store"
import useSetting from "../setting/setSetting"

const Step3 = () => {
    const setSetting = useSetting()
    const { settingConfig } = useSelector((state: RootState) => state.main)
    const [ fps, setFps ] = useState(30)
    const [ resolution, setResolution ] = useState<Resolution>(720)

    const changeActive = ({ fps, resolution }: Quality) => {
        setFps(fps)
        setResolution(resolution)
    }
    useLayoutEffect(() => {
        const { fps, resolution } = settingConfig
        setFps(fps)
        setResolution(resolution)
    }, [ settingConfig ])

    const saveChanges = useCallback(() => {
        let config = JSON.parse(JSON.stringify(settingConfig)) as SettingConfig
        config = { ...config, fps, resolution }
        setSetting(config, "capture_settings_changed", false)
    }, [ settingConfig, fps, resolution, setSetting ])

    return (
        <div className="step3">
            <div className="step3-content">
                <div className="step3-title">
                    <FormattedMessage id="step3Title" />
                </div>
                <div className="step3-explain">
                    <FormattedMessage id="explain7" />
                </div>
                {
                    [ ...qualitys ].reverse().map((e) => (
                        <div
                            className={`step3-item ${e.fps === fps && e.resolution === resolution
                                ? "step3-item-active"
                                : ""}`}
                            key={e.id}
                            onClick={() => changeActive(e)}
                        >
                            <div className="step3-icon">
                                <SvgIcon icon={e.type} />
                            </div>
                            <div className="step3-item-name">
                                <FormattedMessage id={e.id} />
                            </div>
                            <div className="step3-item-fps">
                                {e.resolution}
                                p
                                {" "}
                                {e.fps}
                                fps
                            </div>
                        </div>
                    ))
                }
            </div>
            <div className="guide-footer">
                <Link to="/step2">
                    <Button onClick={saveChanges}>
                        <FormattedMessage id="back" />
                    </Button>
                </Link>
                <Link to="/step4">
                    <Button onClick={saveChanges} theme="yellow">
                        <FormattedMessage id="next" />
                    </Button>
                </Link>
            </div>
        </div>
    )
}

export default Step3
