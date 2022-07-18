import "./index.scss"
import React, { Component } from "react"
import { FormattedMessage, IntlShape, injectIntl } from "react-intl"
import { connect } from "react-redux"
import { writeFileContents, deleteFileOrDir } from "@utils/overwolfUtils"
import { VideoCacheFileName, AppName, AppFavoriteName } from "@config/baseConfig"
import { getVideoCacheData, setVideoCache } from "../redux/main"
import { RootState, AppDispatch } from "../redux/store"
import CommonLoading from "@component/CommonLoading"
import Message from "@component/Message"
import Modal from "@component/Modal"
import HorizontalMenu from "@component/HorizontalMenu"
import SvgIcon from "@component/SvgIcon"
import SearchInput from "@component/SearchInput"
import CommonTooltip from "@component/CommonTooltip"
import { Input } from "antd"
import { Routes, Route } from "react-router-dom"
import VideoListTemplet from "./VideoListTemplet"
import { postContentStats } from "../redux/request"
import GameFilter, { GameFilterCheck } from "./component/GameFilter"
import HorizontalScrollCard from "@component/HorizontalScrollCard"
import { gamesConfigs } from "@config/gamesConfigs"

type VideoLibraryState = {
    loading: boolean,
    selectData?: VideoCacheData,
    searchValue: string,
    deleteVisible: boolean,
    renameVisible: boolean,
    renameValue: string,
    sortType: SortType,
    selectGames: GameFilterCheck[]
}

type VideoLibraryProps = RootState & { dispatch: AppDispatch, intl: IntlShape }

const sortTypes: SortType[] = [ "sortAZ", "sortZA", "sortDateDesc", "sortDateAsc" ]
class VideoLibrary extends Component<VideoLibraryProps, VideoLibraryState> {
    constructor (props: VideoLibraryProps) {
        super(props)
        this.state = {
            loading: false,
            selectData: undefined,
            searchValue: "",
            deleteVisible: false,
            renameVisible: false,
            renameValue: "",
            sortType: "sortDateDesc",
            selectGames: gamesConfigs.filter((e) => !e.disabled).map((v) => ({ ...v, checked: true }))
        }
    }
    
    menuTabs = [
        {
            key: "/videoLibrary",
            content: <FormattedMessage id="mySessions" />
        },
        {
            key: "favorites",
            content: <FormattedMessage id="favorites" />
        }
    ]

    deleteVideo = async () => {
        const { selectData, loading } = this.state
        const { intl, dispatch, main: { videoCache, isWritingVideoCache, settingConfig: { videoFolders } } } = this.props

        if (isWritingVideoCache) return Message.error(intl.formatMessage({ id: "tip24" }))

        if (loading) return
        this.setState({ loading: true }, () => {
            new Promise<void>(async () => {
                try {
                    if (selectData?.folderPath) {
                        if (videoFolders.length) {
                            for await (const e of videoFolders) {
                                await deleteFileOrDir(`${e}\\${AppName}\\${selectData.folderName}`, false)
                                await deleteFileOrDir(`${e}\\${AppFavoriteName}\\${selectData.folderName}`, false)
                            }
                        } else {
                            await deleteFileOrDir(selectData.folderPath, false)
                        }
                    }
                    const newVideoCache = JSON.parse(JSON.stringify(videoCache)) as VideoCache
                
                    if (newVideoCache?.data)newVideoCache.data = newVideoCache?.data.filter((e) => e.folderPath !== selectData?.folderPath)
                                        
                    await writeFileContents(VideoCacheFileName, JSON.stringify(newVideoCache))
                
                    if (newVideoCache) dispatch(setVideoCache(newVideoCache))
                    Message.warn(intl.formatMessage({ id: "tip10" }))
                    dispatch(postContentStats({
                        event_type: "session_deleted",
                        session_id: selectData?.sessionId,
                        game_id: selectData?.gameId.toString(),
                        game_name: selectData?.gameName,
                        session_clips: selectData?.clips.map((e) => ({
                            clip_id: e.clipId,
                            clip_capture_type: e.eventType === "manual"
                                ? "manual"
                                : "auto",
                            clip_duration: e.clipDuration?.toString()
                        }))
                    }))
                } catch (error) {
                    Message.error(intl.formatMessage({ id: "tip18" }))
                }
                this.setState({ deleteVisible: false, loading: false })
            })
        })
    }

    rename = async () => {
        const { selectData, renameValue, loading } = this.state
        const { intl, dispatch, main: { videoCache, isWritingVideoCache } } = this.props

        if (isWritingVideoCache) return Message.error(intl.formatMessage({ id: "tip24" }))
        
        // 相同文件名返回
        if (!renameValue || videoCache?.data.find((e) => e.showName === renameValue)) {
            return Message.error(intl.formatMessage({ id: "tip15" }))
        }

        if (!renameValue.replace(/ /g, "")) return Message.error(intl.formatMessage({ id: "tip25" }))

        if (loading) return
        this.setState({ loading: true }, () => {
            new Promise<void>(async () => {
                if (selectData) {
                    const newVideoCache = JSON.parse(JSON.stringify(videoCache)) as VideoCache
                    const itemData = newVideoCache?.data.find((e) => e.time === selectData?.time)
           
                    if (itemData) {
                        itemData.showName = renameValue
                    }
                               
                    await writeFileContents(VideoCacheFileName, JSON.stringify(newVideoCache))
           
                    if (newVideoCache) dispatch(setVideoCache(newVideoCache))
                    Message.success(intl.formatMessage({ id: "tip5" }))
                    this.setState({ loading: false, renameVisible: false })
                }
            })
        })
     
    }

    callBack = async (type: string, item: VideoCacheData) => {
        const { loading } = this.state
        const { intl, dispatch, main: { videoCache, isWritingVideoCache } } = this.props
        this.setState({ selectData: item })

        switch (type) {
        case "delete":
            this.setState({ deleteVisible: true })
            break
        case "rename":
            this.setState({ renameValue: "", renameVisible: true })
            break
        case "changeFavorite":
            if (isWritingVideoCache) return Message.error(intl.formatMessage({ id: "tip24" }))

            if (loading) return

            const newVideoCache = JSON.parse(JSON.stringify(videoCache)) as VideoCache
            const itemData = newVideoCache?.data.find((e) => e.time === item?.time)
    
            if (itemData) {
                itemData.isFavorite = !itemData.isFavorite
                itemData.clips.forEach((e) => {
                    e.isFavorite = itemData.isFavorite 
                })
            }
                            
            await writeFileContents(VideoCacheFileName, JSON.stringify(newVideoCache))
            
            if (newVideoCache) dispatch(setVideoCache(newVideoCache))
            Message.success(
                itemData?.isFavorite
                    ? intl.formatMessage({ id: "tip6" })
                    : intl.formatMessage({ id: "tip7" })
            )
            this.setState({ loading: false })
                
            dispatch(postContentStats({
                event_type: itemData?.isFavorite
                    ? "session_marked_favourite"
                    : "session_marked_unfavourite",
                game_id: item.gameId.toString(),
                game_name: item.gameName,
                session_id: item?.sessionId,
                session_clips: item?.clips.map((e) => ({
                    clip_id: e.clipId,
                    clip_capture_type: e.eventType === "manual"
                        ? "manual"
                        : "auto",
                    clip_duration: e.clipDuration?.toString()
                }))
            }))
           
            break
        default:
            break
        }
    }

    changeGameSelect = (item: GameFilterCheck) => {
        const newSelectGames = this.state.selectGames.map((e) => {
            if (e.gameId === item.gameId) e.checked = !e.checked

            return e
        })
        this.setState({ selectGames: newSelectGames })
    }

    async componentDidMount () {
        const { dispatch } = this.props
        await dispatch(getVideoCacheData())
    }

    render () {
        const { searchValue, selectGames, selectData, loading, deleteVisible, renameVisible, renameValue, sortType } = this.state
        const { intl, main } = this.props
        const { videoCache } = main

        if (!videoCache?.data?.length) {
            return (
                <div className="video-nodata">
                    <div className="video-nodata-main">
                        <div className="video-nodata-img" />
                        <div className="video-nodata-tip1">
                            <FormattedMessage id="tip1" />
                        </div>
                        <div className="video-nodata-tip2">
                            <FormattedMessage id="tip2" />
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <>
                <div
                    className="video-nodata"
                    style={{ display: loading
                        ? "flex"
                        : "none" }}
                >
                    <CommonLoading />
                </div>
                <div className="video-library">
                    <div className="video-library-header">
                        <HorizontalMenu
                            menuTabs={this.menuTabs}
                        />
                        <div className="video-library-header-right">
                            <SearchInput onChange={(val) => this.setState({ searchValue: val })} value={searchValue} />
                            <GameFilter onChange={(val) => this.setState({ selectGames: val })} selectGames={selectGames} />
                            <CommonTooltip
                                align={
                                    {
                                        offset: [ 0, 12 ]
                                    }
                                }
                                overlay={(
                                    <div className="video-list-item-popover-content">
                                        {sortTypes.map((e, i) => (
                                            <div key={e}>
                                                <div
                                                    className={`video-list-item-popover-text ${e === sortType
                                                        ? "video-list-item-popover-active"
                                                        : ""}`}
                                                    onClick={() => this.setState({ sortType: e })}
                                                >
                                                    <FormattedMessage id={e} />
                                                </div>
                                                {i !== sortTypes.length - 1 && <div className="video-list-item-popover-line" />} 
                                            </div>
                                        ))}
                                    </div>
                                )}
                                placement="bottomRight"
                                trigger="click"
                            >
                                <div
                                    className="video-library-search-more"
                                >
                                    <SvgIcon icon="sort" />
                                </div>
                            </CommonTooltip>
                        </div>
                    </div>
                    {selectGames.find((e) => !e.checked)
                        ? (
                            <div className="video-library-games">
                                <HorizontalScrollCard
                                    options={selectGames.filter((e) => e.checked).map((e) => ({ key: e.gameId, ...e }))}
                                >
                                    {
                                        (e) => (
                                            <div
                                                className="video-library-games-item"
                                            >
                                                {e.name}     
                                                <span className="video-library-games-close" onClick={() => this.changeGameSelect(e)}>
                                                    <SvgIcon icon="close" size={15} />
                                                </span>
                                            </div>
                                        )
                                    }
                                </HorizontalScrollCard>
                            </div>
                        )
                        : ""}
                    <Routes>
                        <Route
                            element={
                                <VideoListTemplet
                                    callBack={this.callBack}
                                    loading={loading}
                                    searchValue={searchValue}
                                    selectGames={selectGames}
                                    sortType={sortType}
                                    videoList={videoCache.data}
                                />
                            }
                            index
                        />
                        <Route
                            element={
                                <VideoListTemplet
                                    callBack={this.callBack}
                                    isFavorite
                                    loading={loading}
                                    noDataTip={(
                                        <div className="video-library-no-data-tip">
                                            <div className="video-library-no-data-main">
                                                <div className="video-library-no-favorite" />
                                                <div className="noting-found">
                                                    <FormattedMessage id="NoFavoriteSessionsView" />
                                                </div>
                                                <div className="noting-found-text">
                                                    <FormattedMessage id="nothingFoundTip2" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    searchValue={searchValue}
                                    selectGames={selectGames}
                                    sortType={sortType}
                                    videoList={videoCache.data}
                                />
                            }
                            path="favorites"
                        />
                    </Routes>
                    <Modal
                        okText={intl.formatMessage({ id: "delete" })}
                        onClose={() => this.setState({ deleteVisible: false })}
                        onOk={this.deleteVideo}
                        title={intl.formatMessage({ id: "tipTitle1" })}
                        visible={deleteVisible}
                    >
                        <FormattedMessage id="tip3" />
                    </Modal>
                    <Modal
                        onClose={() => this.setState({ renameVisible: false })}
                        onOk={this.rename}
                        title={intl.formatMessage({ id: "renameSession" })}
                        visible={renameVisible}
                    >
                        <FormattedMessage id="tip4" />
                        <Input
                            className="video-library-input"
                            maxLength={24}
                            onChange={(e) => this.setState({ renameValue: e.target.value })}
                            placeholder={selectData?.showName}
                            value={renameValue}
                        />
                    </Modal>
                </div>
            </>
        )
    }
}

export default connect((state: RootState) => state)(injectIntl(VideoLibrary))