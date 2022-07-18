import "./ShareGameTv.scss"
import React, { useState, useEffect, useCallback, memo, useMemo, Dispatch, SetStateAction } from "react"
import Modal from "@component/Modal"
import { useIntl, FormattedMessage } from "react-intl"
import { Thumbnail } from "./VideoThumbnail"
import Button from "@component/Button"
import { Select as Sel, Progress } from "antd"
import Message from "@component/Message"
import SvgIcon from "@component/SvgIcon"
import { loginSocial, LogoutSocial } from "@utils/overwolfUtils"
import { AppName } from "@config/baseConfig"
import { useSelector, useDispatch } from "react-redux"
import { RootState, AppDispatch } from "../../redux/store"
import { postContentStats } from "../../redux/request"

let interval: NodeJS.Timer

// import Public = overwolf.social.youtube.Privacy.Public
// console.log(11, Public)

const socialType = "Youtube"

const ShareYoutube = (props: {
    proscessNum: number,
    setProscessNum: Dispatch<SetStateAction<number>>,
    activeClip: VideoClipItem,
    videoDetailData: VideoCacheData,
    visible: boolean,
    onChange: (visible: boolean) => any
}) => {
    const intl = useIntl()
    const dispatch = useDispatch<AppDispatch>()
    const { socialsInfo } = useSelector((state: RootState) => state.main)
    const socialInfo = useMemo(() => socialsInfo.find((e) => e.type === socialType), [ socialsInfo ])
    const { visible, onChange, videoDetailData, activeClip, proscessNum, setProscessNum } = props
    const [ searchVal, setSearchVal ] = useState("")
    const [ title, setTitle ] = useState("")
    const [ tags, setTags ] = useState<string[]>([])
    const [ description, setDescription ] = useState("")
    const isShow = useMemo(() => !!socialsInfo.find((e) => e.type === socialType && e.id) && visible, [ visible, socialsInfo ])
    
    useEffect(() => {
        if ((!socialInfo || !socialInfo?.id) && visible) {
            setTimeout(() => {
                // 官方存在bug需要延迟调用
                loginSocial({ type: socialType })
            }, 100)
        }
    }, [ socialInfo, visible ])
    useEffect(() => {
        return () => {
            clearInterval(interval)
        }
    }, [])
    
    const shareContent = useCallback(
        () => {
            let newTitle = ""

            const newTags = [
                "",
                ...tags,
                videoDetailData.gameName || "",
                AppName,
                "gametv",
                intl.formatMessage({ id: activeClip.eventType })
            ]

            if (videoDetailData.gameName) {
                newTitle = `${title}: Powered by Gameshots${newTags.map((e) => e.replaceAll(" ", "_")).join(" #")}`
            }

            const shareParams = {
                useOverwolfNotifications: true,
                file: activeClip.filePath,
                id: socialInfo?.id,
                title: newTitle,
                gameClassId: videoDetailData.gameId,
                gameTitle: videoDetailData.gameName,
                description,
                privacy: "Public",
                metadata: {},
                privateMode: false,
                tags: newTags// 必填
                // trimming: {
                //     startTime: 0,
                //     endTime: 60000
                // }
            }
            console.log("shareParams", shareParams)
            setProscessNum(1)
            interval = setInterval(() => {
                setProscessNum((proscessNum: number) => {
                    let newNum = proscessNum + 10

                    if (newNum > 99) {
                        newNum = 99
                        clearInterval(interval)
                    }

                    return newNum
                })
            }, 3000)

            const contentStatsParams: ContentStatsParams = {
                event_type: "clip_share_success",
                session_id: videoDetailData.sessionId,
                clip_id: activeClip.clipId,
                clip_share_platform: socialType,
                clip_share_tags: JSON.stringify(newTags),
                clip_share_description: description,
                game_id: videoDetailData.gameId.toString(),
                clip_duration: activeClip.clipDuration.toString(),
                game_name: videoDetailData.gameName,
                clip_capture_type: activeClip.eventType === "manual"
                    ? "manual"
                    : "auto"
            }
            overwolf.social.youtube.shareEx(
                shareParams,
                (res) => {
                    clearInterval(interval)

                    if (res.success) {
                        onChange(false)
                        setDescription("")
                        setProscessNum(0)
                        setTitle("")
                        setTags([])
                        contentStatsParams.event_type = "clip_share_success"
                    } else {
                        Message.warn(res.error || "")  
                        setProscessNum(0)
                        contentStatsParams.event_type = "clip_share_fail"
                    }
                    dispatch(postContentStats(contentStatsParams))
                },
                (res) => {
                    if (res.progress) setProscessNum(res.progress)
                }
            )
        },
        [ intl, activeClip, description, videoDetailData, onChange, socialInfo, tags, setProscessNum, title, dispatch ]
    )
 
    const removeAccount = useCallback(
        () => {
            LogoutSocial({ type: socialType })    
        },
        []
    )
    
    return (
        <Modal
            className="share-social-modal"
            closable
            okText={intl.formatMessage({ id: "share" })}
            onClose={() => onChange(false)}
            onOk={shareContent}
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
                        <input
                            disabled={proscessNum !== 0}
                            maxLength={100}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={intl.formatMessage({ id: "explain18" })}
                            spellCheck={false}
                            value={title}
                        />
                        <textarea
                            disabled={proscessNum !== 0}
                            maxLength={100}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={intl.formatMessage({ id: "explain20" })}
                            rows={5}
                            spellCheck={false}
                            value={description}
                        />
                        <Sel
                            disabled={proscessNum !== 0}
                            maxTagCount={16}
                            maxTagTextLength={24}
                            mode="tags"
                            onChange={(tags) => {
                                if (tags.length < 17) {
                                    setTags(tags)
                                    setSearchVal("")
                                }  
                            }}
                            onSearch={(val) => val.length < 24 && setSearchVal(val)}
                            open={false}
                            placeholder={intl.formatMessage({ id: "explain19" }, { gameName: videoDetailData?.gameName })}
                            searchValue={searchVal}
                            tokenSeparators={[ "," ]}
                            value={tags}
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

export default memo(ShareYoutube)