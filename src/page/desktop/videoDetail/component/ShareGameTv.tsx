import "./ShareGameTv.scss"
import React, { useState, useEffect, useCallback, memo, useMemo } from "react"
import Modal from "@component/Modal"
import { useIntl, FormattedMessage } from "react-intl"
import { useSelector, useDispatch } from "react-redux"
import { RootState, AppDispatch } from "../../redux/store"
import { getUserInfo, getUserClubs, postShare, postContentStats } from "../../redux/request"
import { VideoThumbnail, Thumbnail } from "./VideoThumbnail"
import Select from "@component/Select"
import { dataURLtoFile } from "@utils/utils"
import { Select as Sel, Progress } from "antd"
import Message from "@component/Message"
import CommonLoading from "@component/CommonLoading"
import axios from "axios"
let interval: NodeJS.Timer

const ShareGameTv = (props: {
    activeClip: VideoClipItem,
    gameName?: string,
    videoDuration: number,
    visible: boolean,
    onChange: (visible: boolean) => any
}) => {
    const intl = useIntl()
    const dispatch = useDispatch<AppDispatch>()
    const { videoDetailData } = useSelector((state: RootState) => state.main)
    const { headerParams, userInfo, userClubs } = useSelector((state: RootState) => state.request)
    const isShare = Boolean(headerParams.gtvUserId) 
    const { visible, onChange, activeClip, videoDuration, gameName } = props
    const [ init, setInit ] = useState(true)
    const [ currentTime, setCurrentTime ] = useState<number>(0)
    const [ clubId, setClubId ] = useState("")
    const [ playerDom, setPlayerDom ] = useState<HTMLVideoElement>()
    const [ description, setDescription ] = useState("")
    const [ searchVal, setSearchVal ] = useState("")
    const [ tags, setTags ] = useState<string[]>([])
    const [ loading, setLoading ] = useState(false)
    const [ proscessNum, setProscessNum ] = useState(0)
    const [ showShareTip, setShowShareTip ] = useState(false)
    useEffect(() => {
        setCurrentTime(0)
    }, [ activeClip ])
    
    useEffect(() => {
        new Promise<void>(async () => {
            if (isShare && visible) {
                setInit(true)
                await dispatch(getUserInfo())
                await dispatch(getUserClubs())
                setInit(false)
            }
        })
    }, [ dispatch, isShare, visible ])
    
    useEffect(() => {
        if (userClubs?.length)setClubId(userClubs?.[0]?.club_id)
    }, [ userClubs ])

    useEffect(() => {
        if (loading) {
            let num = 0
            interval = setInterval(() => {
                if (num < 97) num += 2
                setProscessNum(num)
            }, 3000)
        } else {
            setProscessNum(0)
            clearInterval(interval)
        }
    }, [ loading ])
    
    useEffect(() => {
        return () => {
            if (interval) clearInterval(interval)
        }
    }, [])

    const shareContent = useCallback(
        async () => {
            if (playerDom && !loading && videoDetailData) {
                const canvas = document.createElement("canvas")
                canvas.width = playerDom.videoWidth
                canvas.height = playerDom.videoHeight
                canvas.getContext("2d")?.drawImage(playerDom, 0, 0, canvas.width, canvas.height)
  
                const dataURL = canvas.toDataURL() // 将图片转成base64格式
                const thumbnailFile = dataURLtoFile(dataURL, `${activeClip?.fileName}.png`)
                setLoading(true)

                try {
                    const blob: Blob = (await axios({
                        baseURL: "",
                        url: 
                         NODE_ENV === "local"
                             ? activeClip.filePath?.replace(/\//g, "\\")?.replace(`${overwolf.io.paths.videos}\\Overwolf`, "")
                             : `overwolf-fs:///${activeClip.filePath}`,
                        responseType: "blob"
                    })).data
                    let newTags = tags
    
                    const clipFile = new File(
                        [ blob ],
                        `${activeClip?.fileName}.mp4`,
                        { type: blob.type }
                    )
    
                    if (gameName) newTags = [ gameName, ...tags ]
                    await dispatch(postShare({
                        sessionId: videoDetailData.sessionId,
                        clipId: activeClip.clipId,
                        clipDuration: videoDuration.toString(),
                        clipCaptureType: activeClip.eventType === "manual"
                            ? "manual"
                            : "auto",
                        clubId,
                        thumbnailFile,
                        clipFile,
                        description,
                        tags: newTags,
                        gameId: videoDetailData.gameId.toString(),
                        gameName
                    })).then((res) => {
                        if (res.meta.requestStatus === "fulfilled") {
                            Message.success(intl.formatMessage({ id: "tip16" }))
                            onChange(false)
                        } else {
                            Message.error(intl.formatMessage({ id: "tip26" }))
                            dispatch(postContentStats({
                                event_type: "clip_share_fail",
                                session_id: videoDetailData.sessionId,
                                clip_id: activeClip.clipId,
                                clip_share_platform: "game.tv",
                                clip_share_tags: JSON.stringify(newTags),
                                clip_share_description: description,
                                clip_duration: activeClip.clipDuration.toString(),
                                game_id: videoDetailData.gameId.toString(),
                                game_name: gameName,
                                clip_capture_type: activeClip.eventType === "manual"
                                    ? "manual"
                                    : "auto"
                            }))
                        }
                        setSearchVal("")
                        setDescription("")
                        setTags([])
                    })

                } catch (error) {
                    
                }
                setLoading(false)
            }
        },
        [ videoDuration, videoDetailData, playerDom, dispatch, intl, activeClip, clubId, loading, description, tags, onChange, gameName ]
    )

    const closeModal = useCallback(
        () => {
            if (loading) {
                setShowShareTip(true)
            } 
            onChange(false)
        },
        [ onChange, loading ]
    )

    const selectData = useMemo(() => userClubs?.map((e) => ({
        value: e.club_id,
        render: (
            <div className="share-gametv-select-i">
                <img draggable={false} src={e.icon_url} />
                {e.name}
            </div>
        )
    })), [ userClubs ])

    return (
        <>
            <Modal
                className="share-gametv-modal"
                closable
                okText={intl.formatMessage({ id: "share" })}
                onClose={closeModal}
                onOk={shareContent}
                showCancle={false}
                showOk={!!userClubs?.length && !loading && !init}
                title={
                    <div className="share-gametv-title">
                        <div className="share-gametv-logo" />
                        <span>
                            <FormattedMessage
                                id="tip11"
                            />
                        </span>
                    </div>
                }
                top="calc(50% - 300px)"
                visible={visible}
                width={952}
            >
                {
                    init
                        ?
                            <div className="share-gametv-loading"> 
                                <CommonLoading />
                            </div>
                        : (
                            <div className="share-gametv-main">
                               
                                <div className="share-gametv-content">
                                    <div className="share-gametv-content-l">
                                        <div className="share-gametv-username">
                                            <img
                                                className="share-gametv-usernlogo"
                                                draggable={false}
                                                src={userInfo?.avatar}
                                            />
                                            <div>
                                                {userInfo?.user_name}
                                            </div>
                                        </div>
                                        <textarea
                                            disabled={loading}
                                            maxLength={100}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder={intl.formatMessage({ id: "explain20" })}
                                            rows={5}
                                            spellCheck={false}
                                            value={description}
                                        />
                                        <Sel
                                            disabled={loading}
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
                                        <div className="share-gametv-club">
                                            <FormattedMessage id="explain21" />
                                            {userClubs?.length
                                                ? (
                                                    <div className="share-gametv-select">
                                                        <Select
                                                            data={selectData}
                                                            disabled={loading}
                                                            onChange={setClubId}
                                                            value={clubId}
                                                        />
                                                    </div>
                                                )
                                                : ""}
                                        </div>
                                        {!userClubs?.length && (
                                        <div className="share-gametv-tip">
                                            <FormattedMessage id="tip12" />
                                        </div>
                                        )}
                                    </div>
                                    <div className="share-gametv-content-r">
                                        <Thumbnail
                                            className="share-gametv-thumbnail"
                                            currentTime={currentTime}
                                            getPlayerDom={setPlayerDom}
                                            overwolfPath={activeClip.overwolfPath}
                                            videoUrl={activeClip?.filePath}
                                        />
                                        <div className="share-gametv-selectthumbnail">
                                            <FormattedMessage id="explain22" />
                                        </div>
                                        <VideoThumbnail
                                            callBack={setCurrentTime}
                                            currentTime={currentTime}
                                            disabled={loading}
                                            overwolfPath={activeClip.overwolfPath}
                                            videoDuration={videoDuration}
                                            videoUrl={activeClip.filePath}
                                        />
                                    </div>
                                </div>
                                {loading &&
                                <div>
                                    <div className="share-gametv-process-text">
                                        <FormattedMessage id="processText" values={{ number: proscessNum }} />
                                    </div>
                                    <Progress
                                        percent={proscessNum}
                                        showInfo={false}
                                        strokeColor={"#FFCC48"}
                                    />
                                </div>}
                            </div>
                        )
                }
            </Modal>
            <Modal
                className="share-gametv-tip-modal"
                okText={intl.formatMessage({ id: "Okay" })}
                onOk={() => {
                    setShowShareTip(false)
                    onChange(true)
                }}
                showCancle={false}
                title={intl.formatMessage({ id: "sharingInProgress" })}
                visible={showShareTip}
            >
                <FormattedMessage id="sharingInProgressText" />
            </Modal>
        </>
    )
}

export default memo(ShareGameTv)