import React, { memo, ReactNode, useMemo } from "react"
import MyPopover from "./component/MyPopover"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { useIntl, FormattedMessage } from "react-intl"
import { setVideoDetailData } from "../redux/main"
import { gamesConfigs } from "@config/gamesConfigs" 
import { getVideoUrl } from "@utils/utils"
import useMoment from "@utils/momentHooks"
import { GameFilterCheck } from "./component/GameFilter"

const VideoListTemplet = memo((props: {
    videoList: VideoCacheData[],
    callBack: (type: string, item: VideoCacheData) => void,
    isFavorite?: boolean,
    searchValue: string,
    noDataTip?: ReactNode,
    loading: boolean,
    sortType: SortType,
    selectGames: GameFilterCheck[]
}) => {
    const { videoList, callBack, isFavorite = false, searchValue, noDataTip, loading, sortType, selectGames } = props
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const intl = useIntl()

    const searchVal = useMemo(() => searchValue.length > 2
        ? searchValue.toUpperCase()
        : "", [ searchValue ])
    const moment = useMoment(intl.locale)

    const showVideoList: ShowVideoList[] = useMemo(() => {
        let newShowVideoList: ShowVideoList[] = []

        let newVideoList = videoList.filter((e) => (
            e.isFavorite || !isFavorite) && (
            e.showName.toUpperCase().includes(searchVal) ||
            e?.gameName?.toUpperCase().includes(searchVal) ||
            e.clips.find(
                (e) => {
                    return e.fileName.toUpperCase().includes(searchVal)
                        || e.eventType.toUpperCase().includes(searchVal)
                }
            )) 
        
        ).sort((a, b) => {
            const time1 = a.time || 0
            const time2 = b.time || 0

            return sortType === "sortDateAsc"
                ? time1 - time2 
                : time2 - time1
        })

        newVideoList = newVideoList.filter((e) => selectGames.find((v) => v.gameId === e.gameId && v.checked))

        if (sortType === "sortDateAsc" || sortType === "sortDateDesc") {
            // 时间排序
            newVideoList.forEach((e) => {
                const formatTime = moment(e.time, "MMMM， YYYY")
                const item = newShowVideoList.find((v) => v.title === formatTime)

                if (item) {
                    item.data.push(e)
                } else {
                    newShowVideoList.push({
                        sortTime: parseInt(moment(e.time, "YYYYMM")),
                        title: formatTime,
                        data: [ e ]
                    })
                }
            })

            newShowVideoList = newShowVideoList.sort((a, b) => sortType === "sortDateAsc"
                ? a.sortTime - b.sortTime
                : b.sortTime - a.sortTime)
        } else {
            // 首字母排序
            newVideoList.forEach((e) => {
                const item = newShowVideoList.find((v) => v.title === e.gameName)

                if (item) {
                    item.data.push(e)
                } else {
                    newShowVideoList.push({
                        sortTime: parseInt(moment(e.time, "YYYYMM")),
                        title: e.gameName || "",
                        data: [ e ]
                    })
                }
            })

            newShowVideoList = newShowVideoList.sort((a, b) => sortType === "sortAZ" 
                ? a.title > b.title
                    ? 1
                    : -1
                : a.title < b.title
                    ? 1
                    : -1)

        }

        return newShowVideoList
    }, [ videoList, isFavorite, searchVal, moment, sortType, selectGames ])

    const goDetail = (item: VideoCacheData) => {
        dispatch(setVideoDetailData(item))
        navigate(`/videoLibrary/detail/${isFavorite}`)
    }

    if (!showVideoList.length && (searchVal || selectGames.length)) return (
        <div className="video-library-no-data-tip">
            <div className="video-library-no-data-main">
                <div className="video-library-no-search" />
                <div className="noting-found">
                    <FormattedMessage id="nothingFound" />
                </div>
                <div className="noting-found-text">
                    <FormattedMessage id="nothingFoundTip1" />
                </div>
            </div>
        </div>
    )

    if (!showVideoList.length && noDataTip) return (
        <>
            {noDataTip}
        </>
    )

    return (
        <div className="video-list">
            {showVideoList.map((e) => 
                (
                    <div className="video-list-item" key={e.title}>
                        <div className="video-list-item-title">
                            {e.title}
                        </div>
                        <div className="video-list-item-main">
                            {
                                e.data.map((v) => 
                                    (
                                        <div className="video-list-item-card" key={v.time}>
                                            <video
                                                className="video-list-item-img"
                                                muted
                                                onClick={() => goDetail(v)}
                                                preload="metadata"
                                                src={loading
                                                    ? ""
                                                    : getVideoUrl(v.clips[0])}
                                            />
                                            <div className="video-list-item-text">
                                                <img
                                                    className="video-list-item-icon"
                                                    draggable={false}
                                                    src={gamesConfigs.find((o) => o.gameId === v.gameId)?.iconUrl}
                                                />
                                                <div className="video-list-item-right">
                                                    <div className="video-list-item-right-top">
                                                        <span className="video-list-item-right-name">
                                                            <span className="video-list-item-right-title">
                                                                {v.showName}
                                                            </span>
                                                            <span className="video-list-item-point">
                                                                {"•"}
                                                            </span>
                                                            {"Clips : "}
                                                            {v.clips.filter((e) => e.isFavorite && isFavorite || !isFavorite).length}
                                                        </span>
                                                        <MyPopover callBack={callBack} item={v} />
                                                    </div>
                                                    <div className="video-list-item-right-bottom">
                                                        {v.gameName}
                                                        {" "}
                                                        |
                                                        {" "}
                                                        {moment(v?.time, "MMM DD")}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )
                            }
                        </div>
                    </div>
                )
            )}
        </div>
    )
})

export default VideoListTemplet
