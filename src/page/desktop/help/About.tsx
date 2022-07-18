import "./index.scss"
import React, { memo, useState, useCallback, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import { RootState, AppDispatch } from "../redux/store"
import { FormattedMessage } from "react-intl"
import SvgIcon from "@component/SvgIcon"
import Button from "@component/Button"
import Message from "@component/Message"
import { setCheckForUpdateResult, setUpdateProgressNum } from "../redux/main"
import { Progress } from "antd"
let interval: NodeJS.Timer

const UpdateContent = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { updateLogs } = useSelector((state: RootState) => state.request)
    const { checkForUpdateResult, updateProgressNum } = useSelector((state: RootState) => state.main)
    const [ showUpdateContent, setShowUpdateContent ] = useState(false)
    const currentLogs = useMemo(() => updateLogs?.versions.find((e) => e.version === VERSION) || updateLogs?.versions.find((e) => e.version === "0.1.24"), [ updateLogs ])
    const nextVersionLogs = useMemo(() => updateLogs?.versions.find((e) => e.version === checkForUpdateResult?.updateVersion) || updateLogs?.versions.find((e) => e.version === "0.1.24"), [ checkForUpdateResult, updateLogs ])

    const changeUpdateShowStatus = useCallback(
        () => {
            setShowUpdateContent(!showUpdateContent)
        },
        [ showUpdateContent ]
    )

    const updateNow = useCallback(
        () => {
            let num = 1
            dispatch(setUpdateProgressNum(num))
            interval = setInterval(() => {
                num += 15

                if (num > 99)num = 99
                dispatch(setUpdateProgressNum(num))
            }, 3000)
            setShowUpdateContent(true)
            overwolf.extensions.updateExtension((res) => {
                console.log(res)
                Message.success(res.info || "")
                overwolf.extensions.checkForExtensionUpdate((res) => {
                    if (!res.success)res.state = "PendingRestart"
                    dispatch(setCheckForUpdateResult(res))

                    if (interval) clearInterval(interval)
                    dispatch(setUpdateProgressNum(100))
                })
            })
        },
        [ dispatch ]
    )

    const relaunch = useCallback(
        () => {
            overwolf.extensions.relaunch()
        },
        []
    )

    if (checkForUpdateResult?.state === "UpdateAvailable") {
        return (
            <div
                className="faq-content-update"
                onClick={changeUpdateShowStatus}
            >
                <div className="faq-content-update-header">
                    <div className="faq-content-update-next">
                        <SvgIcon
                            className="desktop-download"
                            icon="download"
                            size={24}
                        />    
                        <FormattedMessage id="updateTip" />
                        {" "}
                        (v
                        {checkForUpdateResult.updateVersion}
                        )
                    </div>
                    <div className="faq-content-update-r">
                        <Button
                            disable={!!updateProgressNum}
                            onClick={updateNow}
                            theme="yellow"
                        >
                            <FormattedMessage id="updateNow" /> 
                        </Button> 
                        <SvgIcon
                            className={showUpdateContent
                                ? "faq-content-update-up"
                                : "faq-content-update-down"}
                            icon="down"
                        />
                    </div>
                </div>
                {!!updateProgressNum && showUpdateContent && (
                    <div className="faq-content-progress">
                        <div className="faq-content-progress-t">
                            <span> 
                                <FormattedMessage id="installingProgress" values={{ updateProgressNum }} />
                            </span>
                            <span>
                                <FormattedMessage id="estimatedTime" values={{ num: Math.round(10 - updateProgressNum / 10) }} />
                            </span>
                        </div>
                        <Progress
                            percent={updateProgressNum}
                            showInfo={false}
                            strokeColor={"#FFCC48"}
                        />
                    </div>
                )}
                {nextVersionLogs?.html && showUpdateContent && !updateProgressNum && <div className="faq-content-update-text" dangerouslySetInnerHTML={{ __html: nextVersionLogs?.html }} />}
            </div>
        )
    } else if (checkForUpdateResult?.state === "PendingRestart") {
        return (
            <div className="faq-content-update">
                <div className="faq-content-update-header">
                    <div className="faq-content-update-next">
                        <SvgIcon
                            className="desktop-download"
                            icon="download"
                            size={24}
                        />    
                        <FormattedMessage id="updateTip" />
                        {" "}
                        (v
                        {checkForUpdateResult.updateVersion}
                        )
                    </div>
                </div>
                <div className="faq-content-progress">
                    <div className="faq-content-progress-finish">
                        <FormattedMessage id="installingProgress" values={{ updateProgressNum: 100 }} />
                    </div>
                    <Progress
                        percent={100}
                        showInfo={false}
                        strokeColor={"#FFCC48"}
                    />
                </div>
                <div className="faq-content-relaun">
                    <Button onClick={relaunch}>
                        <FormattedMessage id="relaunchNow" /> 
                    </Button> 
                </div>
            </div>
        )
    } else {
        return (
            <>
                {!showUpdateContent
                    ? (
                        <div className="faq-content-update" onClick={changeUpdateShowStatus}>
                            <div className="faq-content-update-header">
                                <div className="faq-content-update-l">
                                    <div className="faq-content-update-title">
                                        <FormattedMessage id="appisup" />
                                    </div>
                                    <div>
                                        <FormattedMessage id="currentVersion" values={{ version: VERSION }} />
                                    </div>
                                </div>
                                <div className="faq-content-update-r">
                                    <FormattedMessage id="WhatsNew" />
                                    <SvgIcon
                                        className="faq-content-update-down"
                                        icon="down"                                       
                                    />
                                </div>
                            </div>
                        </div>
                    )
                    : (
                        <div className="faq-content-update" onClick={changeUpdateShowStatus}>
                            <div className="faq-content-update-header">
                                <div className="faq-content-update-l">
                                    <div className="faq-content-update-title">
                                        <FormattedMessage id="appisup" />
                                    </div>
                                </div>
                                <div className="faq-content-update-r">
                                    <SvgIcon className="faq-content-update-up" icon="down" />
                                </div>
                            </div>
                            <div className="faq-content-update-t2">
                                <div> 
                                    <FormattedMessage id="welcomeToGameshots" values={{ version: VERSION }} />
                                </div>
                                <FormattedMessage id="updateDescribe" />
                            </div>
                            {currentLogs?.html && <div className="faq-content-update-text" dangerouslySetInnerHTML={{ __html: currentLogs?.html }} />}
                        </div>
                    )}
            </>
        )
    }
}

const About = () => {
    const openUrl = (url: string) => overwolf.utils.openUrlInDefaultBrowser(url)

    return (
        <div>
            <UpdateContent />
            <div className="faq-content-logo" />
            <div className="faq-content-explain">
                <div> 
                    <FormattedMessage id="explain47" />
                </div>
                <div> 
                    <FormattedMessage id="explain48" />
                </div>
                <div> 
                    <FormattedMessage id="explain49" />
                </div>
            </div>
            <div className="faq-content-line" />
            <div className="faq-content-logo1" />
            <div className="faq-content-explain">
                <div> 
                    <FormattedMessage id="explain35" />
                </div>
                <div> 
                    <FormattedMessage id="explain36" />
                </div>
            </div>
            <div className="faq-content-download">
                <SvgIcon icon="qrcode" size={110} />
                <div className="faq-content-btn-r">
                    <div className="faq-content-app-explain">
                        <FormattedMessage id="explain37" />
                    </div>
                    <div className="faq-content-app">
                        <div
                            className="faq-content-appstore"
                            onClick={() => openUrl("https://apps.apple.com/us/app/game-tv/id1510786360")}
                        />
                        <div
                            className="faq-content-google"
                            onClick={() => openUrl("https://play.google.com/store/apps/details?id=tv.game")}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default memo(About)
