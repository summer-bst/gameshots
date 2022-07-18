import "./index.scss"
import React, { useState, useEffect, useCallback, useRef, useMemo, KeyboardEvent } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { FormattedMessage, useIntl } from "react-intl"
import { RootState, AppDispatch } from "../redux/store"
import { writeFileContents, openWindowsExplorer, deleteFileOrDir } from "@utils/overwolfUtils"
import { VideoCacheFileName } from "@config/baseConfig"
import { getVideoUrl } from "@utils/utils"
import { setVideoDetailData, setVideoCache } from "../redux/main"
import SvgIcon from "@component/SvgIcon"
import Modal from "@component/Modal"
import Button from "@component/Button"
import Message from "@component/Message"
import HorizontalScrollCard, { HorizontalScrollCardRef } from "@component/HorizontalScrollCard"
import CommonTooltip from "@component/CommonTooltip"
import ShareGameTv from "./component/ShareGameTv"
import ShareSocial from "./component/ShareSocial"
import QrCodeModal from "../component/QrCodeModal"
import useMoment from "@utils/momentHooks"
import { postContentStats } from "../redux/request"

const VideoDetail = () => {
    const intl = useIntl()
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const moment = useMoment(intl.locale)
    const videoRef = useRef<HTMLVideoElement>(null)
    const horizontalRef = useRef<HorizontalScrollCardRef>(null)
    const { videoDetailData, isWritingVideoCache } = useSelector((state: RootState) => state.main)
    const { headerParams } = useSelector((state: RootState) => state.request)

    const isShare = useMemo(() => !!headerParams.gtvUserId, [ headerParams ])
    const { isFavorite } = useParams()
    const reIsFavorite = useMemo(() => isFavorite === "true", [ isFavorite ])
     
    const [ isEdit, setIsEdit ] = useState<boolean>(false)
    const [ isShowAllClips, setIsShowAllClips ] = useState<boolean>(false)
    const clips = useMemo(() => videoDetailData?.clips.filter((e) => e.isFavorite && reIsFavorite || !reIsFavorite), [ reIsFavorite, videoDetailData ])
    const allEventTypes = useMemo(() => [ ...new Set(clips?.map((e) => e.eventType)) ], [ clips ])
    const [ selectEventTypes, setSelectEventTypes ] = useState<string[]>([])

    const showClips = useMemo(() => selectEventTypes.length
        ? clips?.filter((e) => selectEventTypes.find((v) => v === e.eventType))
        : clips, [ clips, selectEventTypes ])
    const [ renameVal, setRenameVal ] = useState(clips?.[0]?.showName)
    const [ videoDuration, setVideoDuration ] = useState(0)
    const [ qrCodeVisible, setQrCodeVisible ] = useState(false)

    // 当前选中的数据
    const [ activeClip, setActiveClip ] = useState<VideoClipItem>(clips?.[0] || {
        clipDuration: 0,
        clipId: "",
        showName: "",
        fileName: "",
        filePath: "",
        isFavorite: false,
        eventType: "",
        overwolfPath: ""
    })
    const videoCache = useSelector((state: RootState) => state.main.videoCache)
    // 以下弹框的设置
    const [ deleteVisible, setDeleteVisible ] = useState<boolean>(false)
    const [ shareVisible, setShareVisible ] = useState<boolean>(false)

    useEffect(() => {
        setRenameVal("")
    }, [ activeClip ])

    useEffect(() => {
        if (!clips?.length || !activeClip) {
            reIsFavorite
                ? navigate("/videoLibrary/favorites")
                : navigate("/videoLibrary")
        }
    }, [ clips, reIsFavorite, navigate, activeClip ])

    const rename = useCallback(async () => {
        if (isWritingVideoCache) return Message.error(intl.formatMessage({ id: "tip24" }))
        const newVideoCache = JSON.parse(JSON.stringify(videoCache)) as VideoCache
        const videoItem = newVideoCache?.data.find((e) => e.folderPath === videoDetailData?.folderPath)

        if (renameVal === activeClip?.showName) return
        
        if (videoItem) {
            if (videoItem.clips.find((e) => e.showName === renameVal)) return Message.error(intl.formatMessage({ id: "tip22" }))
            const clip = videoItem.clips.find((e) => e.filePath === activeClip?.filePath)

            if (clip && renameVal && activeClip) {
                clip.showName = renameVal

                await writeFileContents(VideoCacheFileName, JSON.stringify(newVideoCache))

                if (newVideoCache) dispatch(setVideoCache(newVideoCache))
                dispatch(setVideoDetailData(videoItem))
                setActiveClip(clip)
                Message.success(intl.formatMessage({ id: "tip5" }))
            }
        }
        setIsEdit(false)
    }, [ intl, videoCache, renameVal, dispatch, activeClip, videoDetailData, isWritingVideoCache ])

    const openFolder = useCallback(() => {
        if (activeClip?.filePath)openWindowsExplorer(activeClip?.filePath)
    }, [ activeClip ])

    const changeFavorite = useCallback(async () => {
        if (isWritingVideoCache) return Message.error(intl.formatMessage({ id: "tip24" }))
        const newVideoCache = JSON.parse(JSON.stringify(videoCache)) as VideoCache
        const videoItem = newVideoCache?.data.find((e) => e.folderPath === videoDetailData?.folderPath)

        if (videoItem) {
            const clip = videoItem.clips.find((e) => e.filePath === activeClip?.filePath)
            
            if (clip) {
                clip.isFavorite = !clip?.isFavorite
                videoItem.isFavorite = !!videoItem.clips.find((e) => e.isFavorite)
                await writeFileContents(VideoCacheFileName, JSON.stringify(newVideoCache))

                if (newVideoCache) dispatch(setVideoCache(newVideoCache))
                dispatch(setVideoDetailData(videoItem))
                dispatch(postContentStats({
                    event_type: clip.isFavorite
                        ? "clip_marked_favourite"
                        : "clip_marked_unfavourite",
                    game_id: videoItem.gameId.toString(),
                    game_name: videoItem.gameName,
                    clip_id: clip.clipId,
                    clip_duration: videoDuration.toString(),
                    clip_capture_type: clip.eventType === "manual"
                        ? "manual"
                        : "auto"
                }))

                if (reIsFavorite && clips) {
                    setActiveClip(videoItem.clips.filter((e) => e.isFavorite)?.[0])
                } else {
                    setActiveClip(clip)
                }
            }
        }
    }, [ videoDuration, activeClip?.filePath, dispatch, videoCache, videoDetailData?.folderPath, reIsFavorite, clips, isWritingVideoCache, intl ])

    const deleteClip = useCallback(async () => {
        if (isWritingVideoCache) return Message.error(intl.formatMessage({ id: "tip24" }))
        const newVideoCache = JSON.parse(JSON.stringify(videoCache)) as VideoCache
        const videoItem = newVideoCache?.data.find((e) => e.folderPath === videoDetailData?.folderPath)

        if (videoItem) {
            if (videoItem.clips.length === 1) {
                await deleteFileOrDir(videoItem.folderPath, false)
                newVideoCache.data = newVideoCache?.data.filter((e) => e.folderPath !== videoDetailData?.folderPath)
            } else {

                try {
                    // 删除文件
                    if (activeClip?.filePath) await deleteFileOrDir(activeClip?.filePath)
                } catch (error) {
                    console.log("文件删除错误", error)
                }

            }
            videoItem.clips = videoItem.clips.filter((e) => e.filePath !== activeClip?.filePath)
            videoItem.isFavorite = !!videoItem.clips.find((e) => e.isFavorite)
            await writeFileContents(VideoCacheFileName, JSON.stringify(newVideoCache))
            
            if (newVideoCache) dispatch(setVideoCache(newVideoCache))
            
            setActiveClip(videoItem?.clips?.[0])
            dispatch(setVideoDetailData(videoItem))
            dispatch(postContentStats({
                event_type: "clip_deleted",
                game_id: videoItem.gameId.toString(),
                game_name: videoItem.gameName,
                clip_id: activeClip.clipId,
                clip_duration: videoDuration.toString(),
                clip_capture_type: activeClip.eventType === "manual"
                    ? "manual"
                    : "auto"
            }))
        }
        
        Message.warn(intl.formatMessage({ id: "tip19" }))
        setDeleteVisible(false)

    }, [ intl, activeClip, dispatch, videoCache, videoDetailData, isWritingVideoCache, videoDuration ])

    const seletClip = useCallback((videoClipItem: VideoClipItem, i: number) => {
        setActiveClip(videoClipItem)
        setIsShowAllClips(false)
        horizontalRef?.current?.changeLeft(i)
    }, [])

    const onKeyDown = useCallback((e: KeyboardEvent<HTMLVideoElement>) => {
        if (e.key === "Escape" && document.fullscreenElement)document.exitFullscreen()
    }, [])

    const selectEvent = useCallback(
        ({ key: e }) => {
            if (selectEventTypes.find((k) => e === k)) {
                setSelectEventTypes(selectEventTypes.filter((v) => v !== e))
            } else {
                setSelectEventTypes([ ...selectEventTypes, e ])
            }
        },
        [ selectEventTypes ]
    )

    if (!videoDetailData || !activeClip) return null

    return (
        <div className="video-detail">
            <div className='video-detail-title'>
                {reIsFavorite
                    ?
                        <Link className="video-detail-father" to="/videoLibrary/favorites">
                            <FormattedMessage id="favorites" />
                        </Link>
                    :
                        <Link className="video-detail-father" to="/videoLibrary">
                            <FormattedMessage id="mySessions" />
                        </Link>}
                <SvgIcon
                    className="video-detail-title-icon"
                    icon="arrow"
                    size={35}
                />
                {videoDetailData?.folderName}
                {" "}
                <span className="video-detail-line">|</span>
                {" "}
                {moment(videoDetailData?.time, "MMM DD，YYYY")}
            </div>
            <div className="video-detail-card">
                {
                    clips &&
                    <HorizontalScrollCard
                        afterDom={
                            clips.length > 8 && (
                                <div
                                    className="video-detail-img video-detail-more"
                                    onClick={() => setIsShowAllClips(true)}
                                >
                                    <span>
                                        {clips.length - 7}
                                    </span>
                                    <FormattedMessage id="more" />
                                </div>
                            )
                        }
                        maskDom={
                            clips.length > 8 && <div className="video-detail-overlay" />
                        }
                        options={clips.map((e) => ({ key: e.filePath, ...e }))}
                        ref={horizontalRef}
                    >
                        {
                            (e) => (
                                <div
                                    className={
                                        `video-detail-img ${activeClip?.filePath === e.filePath
                                            ? "video-detail-img-active"
                                            : ""}`
                                    }
                                >
                                    <div className="video-detail-clip-name">
                                        {e.showName}
                                    </div>
                                    <div className="video-detail-clip-event">
                                        <FormattedMessage id={e.eventType} />
                                    </div>
                                    <video
                                        muted
                                        onClick={() => setActiveClip(e)}
                                        preload="metadata"
                                        src={getVideoUrl(e)}
                                    />
                                </div>
                            )
                        }
                    </HorizontalScrollCard>
                }
            </div>
            {
                isEdit ?
                    <input
                        autoFocus
                        className="video-detail-input"
                        maxLength={24}
                        onBlur={rename}
                        onChange={(e) => setRenameVal(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter")rename() 
                        }}
                        placeholder={activeClip.showName}
                        spellCheck={false}
                        value={renameVal}
                    />
                    : (
                        <div className="video-detail-name">
                            {activeClip.showName}
                            <SvgIcon
                                className="video-detail-edit"
                                icon="edit"
                                onClick={() => setIsEdit(true)}
                            />
                        </div>
                    )
            }
            <div className="video-detail-video">
                <video
                    controls
                    controlsList="nodownload"
                    onCanPlayThrough={() => {
                        const { current: videoDom } = videoRef
                        setVideoDuration(videoDom?.duration as number)
                    }}
                    onKeyDown={onKeyDown}
                    preload="metadata"
                    ref={videoRef}
                    src={getVideoUrl(activeClip)}
                />
            </div>
            <div className="video-detail-footer">
                <div className="video-detail-footer-l">
                    <span className="video-detail-event">
                        <FormattedMessage id={activeClip.eventType} />
                    </span>
                    <CommonTooltip
                        overlay={(<FormattedMessage id="favorites" />)}
                        placement="bottom"
                        trigger="hover"
                    >
                        <SvgIcon
                            className="video-detail-icon"
                            icon={
                                activeClip?.isFavorite
                                    ? "favorite"
                                    : "nofavorite"
                            }
                            onClick={changeFavorite}
                        />
                    </CommonTooltip>
                    <CommonTooltip
                        overlay={(<FormattedMessage id="folder" />)}
                        placement="bottom"
                        trigger="hover"
                    >
                        <SvgIcon
                            className="video-detail-icon"
                            icon="folder"
                            onClick={openFolder}
                        />
                    </CommonTooltip>
                    <CommonTooltip
                        overlay={(<FormattedMessage id="delete" />)}
                        placement="bottom"
                        trigger="hover"
                    >
                        <SvgIcon
                            className="video-detail-icon"
                            icon="delete"
                            onClick={() => setDeleteVisible(true)}
                        />
                    </CommonTooltip>
                </div>
                <div className="video-detail-footer-r">
                    <ShareSocial activeClip={activeClip} videoDetailData={videoDetailData} />
                    <Button
                        onClick={() => isShare
                            ? setShareVisible(true)
                            : setQrCodeVisible(true)}
                        theme="yellow"
                    >
                        <FormattedMessage id="tip11" />
                    </Button>
                </div>
            </div>
            <Modal
                okText={intl.formatMessage({ id: "delete" })}
                onClose={() => setDeleteVisible(false)}
                onOk={deleteClip}
                title={intl.formatMessage({ id: "tipTitle2" })}
                visible={deleteVisible}
            >
                <FormattedMessage
                    id={
                        activeClip?.isFavorite
                            ? "explain17"
                            : "explain16"
                    }
                />
            </Modal>
            <ShareGameTv
                activeClip={activeClip}
                gameName={videoDetailData.gameName}
                onChange={setShareVisible}
                videoDuration={videoDuration}
                visible={shareVisible}
            />
            <QrCodeModal
                callBack={
                    () => {
                        setShareVisible(true)
                    }
                }
                onClose={() => {
                    setQrCodeVisible(false)
                }}
                visible={qrCodeVisible}
            />
            <div
                className="video-detail-allclips"
                style={{ display: isShowAllClips
                    ? "block"
                    : "none" }}
            >
                <div className="video-detail-allclips-main">
                    <SvgIcon
                        className="video-detail-close"
                        icon="close"
                        onClick={() => setIsShowAllClips(false)}
                    />
                    <div className="video-detail-card">
                        <div className="video-detail-eventtypes">
                            <HorizontalScrollCard
                                options={allEventTypes?.map((e) => ({ key: e })) || []}
                            >
                                {
                                    (e) => (
                                        <div
                                            className={`video-detail-eventtypes-item ${  
                                                selectEventTypes.find((l) => l === e.key)
                                                    ? "video-detail-eventtypes-item-active"
                                                    : ""}`}
                                            onClick={() => selectEvent(e)}
                                        >
                                            <FormattedMessage id={e.key} /> 
                                        </div>
                                    )
                                }
                            </HorizontalScrollCard>
                        </div>
                        {showClips?.map((e, i) => 
                            (
                                <div
                                    className={
                                        `video-detail-img ${activeClip?.filePath === e.filePath
                                            ? "video-detail-img-active"
                                            : ""}`
                                    }
                                    key={e.filePath}
                                >
                                    <div className="video-detail-clip-name">
                                        {e.showName}
                                    </div>
                                    <div className="video-detail-clip-event">
                                        <FormattedMessage id={e.eventType} />
                                    </div>
                                    <video
                                        muted
                                        onClick={() => seletClip(e, i)}
                                        preload="metadata"
                                        src={getVideoUrl(e)}
                                    />
                                </div>                          
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoDetail
