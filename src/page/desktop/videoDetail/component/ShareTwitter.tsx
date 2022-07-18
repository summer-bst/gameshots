import "./ShareGameTv.scss"
import React, { useState, useEffect, useCallback, memo, useMemo } from "react"
import Modal from "@component/Modal"
import { useIntl, FormattedMessage } from "react-intl"
import { useSelector, useDispatch } from "react-redux"
import { RootState, AppDispatch } from "../../redux/store"
import { Thumbnail } from "./VideoThumbnail"
import Button from "@component/Button"
import { Progress } from "antd"
import Message from "@component/Message"
import SvgIcon from "@component/SvgIcon"
import { loginSocial, LogoutSocial, getProcessManagerPlugin, deleteFileOrDir } from "@utils/overwolfUtils"
import { AppName } from "@config/baseConfig"
import { postContentStats } from "../../redux/request"

const socialType = "Twitter"
let Plugin: any

const ShareGTwitter = (props: {
    proscessNum: number,
    setProscessNum: (proscessNum: number) => void,
    activeClip: VideoClipItem,
    videoDetailData: VideoCacheData,
    visible: boolean,
    onChange: (visible: boolean) => any
}) => {
    const intl = useIntl()
    const dispatch = useDispatch<AppDispatch>()
    const { socialsInfo, videoFolderPath } = useSelector((state: RootState) => state.main)
    const socialInfo = useMemo(() => socialsInfo.find((e) => e.type === socialType), [ socialsInfo ])
    const { visible, onChange, videoDetailData, activeClip, proscessNum, setProscessNum } = props
    const [ description, setDescription ] = useState("")
    const isShow = useMemo(() => !!socialsInfo.find((e) => e.type === socialType && e.id) && visible, [ visible, socialsInfo ])
    const twitterCachePath = useMemo(() => `${videoFolderPath}\\${AppName}\\twitterCache.mp4`, [ videoFolderPath ])
    
    const shareContent = useCallback(
        () => {
            let message = ""

            const newTags = [
                "",
                videoDetailData.gameName || "",
                AppName,
                "gametv",
                intl.formatMessage({ id: activeClip.eventType })
            ]

            if (videoDetailData.gameName) {
                message = description + newTags.map((e) => e.replaceAll(" ", "_")).join(" #")
            }

            const shareParams = {
                useOverwolfNotifications: true,
                file: twitterCachePath,
                id: socialInfo?.id,
                gameClassId: videoDetailData.gameId,
                tags: newTags,
                message,
                gameTitle: videoDetailData.gameName,
                metadata: {},
                privateMode: false
                // trimming: {
                //     startTime: 0,
                //     endTime: 60000
                // }
            }
            console.log("shareParams", shareParams)

            const contentStatsParams: ContentStatsParams = {
                event_type: "clip_share_success",
                session_id: videoDetailData.sessionId,
                clip_id: activeClip.clipId,
                clip_share_tags: JSON.stringify(newTags),
                clip_share_platform: socialType,
                clip_share_description: message,
                clip_duration: activeClip.clipDuration.toString(),
                game_id: videoDetailData.gameId.toString(),
                game_name: videoDetailData.gameName,
                clip_capture_type: activeClip.eventType === "manual"
                    ? "manual"
                    : "auto"
            }
            overwolf.social.twitter.shareEx(
                shareParams,
                (res) => {
                    if (res.success) {
                        onChange(false)
                        setDescription("")
                        setProscessNum(0)
                        contentStatsParams.event_type = "clip_share_success"
                    } else {
                        Message.warn(res.error || "")  
                        setProscessNum(0)
                        contentStatsParams.event_type = "clip_share_fail"
                    }
                    deleteFileOrDir(twitterCachePath)
                    dispatch(postContentStats(contentStatsParams))
                },
                (res) => {
                    if (res.progress) setProscessNum(res.progress)
                }
            )
        },
        [ dispatch, description, videoDetailData, onChange, socialInfo, setProscessNum, twitterCachePath, activeClip, intl ]
    )

    const dealVideoFormats = useCallback(
        async () => {
            if (Plugin) {
                setProscessNum(1)
                await deleteFileOrDir(twitterCachePath)
                Plugin.onProcessExited.removeListener(() => shareContent())
                Plugin.onProcessExited.addListener(() => shareContent())
                Plugin.launchProcess(`${overwolf.io.paths.obsBin}\\ffmpeg.exe`, 
                    `-i ${activeClip.filePath} -c:v libx264 -b:v 4M -x264-params keyint=24:bframes=2 ${twitterCachePath}`, 
                    JSON.stringify({}), 
                    true, 
                    false,
                    (res: any) => {
                        const { error /* data: processId */ } = res
                        
                        if (error) {
                            console.error("转换视频格式失败", error)
                        }
                    })
            }
        },
        [ setProscessNum, activeClip, twitterCachePath, shareContent ]
    )

    const removeAccount = useCallback(
        () => {
            LogoutSocial({ type: socialType })    
        },
        []
    )
    useEffect(() => {
        if (!Plugin) {
            getProcessManagerPlugin().then((res) => {
                Plugin = res
            })
        }
    }, [])
        
    useEffect(() => {
        if ((!socialInfo || !socialInfo?.id) && visible) {
            setTimeout(() => {
                // 官方存在bug需要延迟调用
                loginSocial({ type: socialType })
            }, 100)
        }
    }, [ socialInfo, visible ])

    return (
        <Modal
            className="share-social-modal"
            closable
            okText={intl.formatMessage({ id: "share" })}
            onClose={() => onChange(false)}
            onOk={dealVideoFormats}
            showCancle={false}
            showOk={!proscessNum}
            title={
                <div className="share-social-title">
                    <SvgIcon icon={socialType} size={40} />
                    <span className="">
                        <FormattedMessage
                            id="shareOnSocial"
                            values={{ type: socialType }}
                        />
                    </span>
                </div>
            }
            top="calc(50% - 265px)"
            visible={isShow}
            width={952}
        >
            <div className="share-social-main">
                <div className="share-social-username">
                    <div>
                        {socialInfo?.avatar && (
                        <img
                            className="share-social-usernlogo"
                            draggable={false}
                            src={socialInfo?.avatar}
                        />
                        )}
                        {socialInfo?.username} 
                    </div>
                    {proscessNum === 0 && (
                    <Button
                        onClick={removeAccount}
                        small
                    >
                        <FormattedMessage id="switchAccount" />
                    </Button>
                    )}
                </div>
                <div className="share-social-content">
                    <div className="share-social-content-l">
                        <textarea
                            disabled={proscessNum !== 0}
                            maxLength={100}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={intl.formatMessage({ id: "explain20" })}
                            rows={5}
                            spellCheck={false}
                            value={description}
                        />
                    </div>
                    <div className="share-social-content-r">
                        <Thumbnail
                            className="share-social-thumbnail"
                            overwolfPath={activeClip.overwolfPath}
                            videoUrl={activeClip?.filePath}
                        />
                    </div>
                </div>
                {
                    proscessNum !== 0 &&
                    <div>
                        <div className="share-social-process-text">
                            <FormattedMessage id="processText" values={{ number: proscessNum }} />
                        </div>
                        <Progress
                            percent={proscessNum}
                            showInfo={false}
                            strokeColor={"#FFCC48"}
                        />
                    </div>
                }
            </div>  
        </Modal>
    )
}

export default memo(ShareGTwitter)