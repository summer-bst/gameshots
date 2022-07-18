import "./ShareGameTv.scss"
import React, { useState, useEffect, useCallback, memo, useMemo } from "react"
import Modal from "@component/Modal"
import { useIntl, FormattedMessage } from "react-intl"
import { useSelector } from "react-redux"
import { RootState } from "../../redux/store"
import { Thumbnail } from "./VideoThumbnail"
import Button from "@component/Button"
import { Select as Sel, Progress } from "antd"
import Message from "@component/Message"
import Select from "@component/Select"
import SvgIcon from "@component/SvgIcon"
import { loginSocial, LogoutSocial } from "@utils/overwolfUtils"
import defaultImg from "@assets/image/userlogo.png"

import Subreddit = overwolf.social.reddit.Subreddit

const socialType = "Reddit"

const ShareReddit = (props: {
    proscessNum: number,
    setProscessNum: (proscessNum: number) => void,
    activeClip: VideoClipItem,
    videoDetailData: VideoCacheData,
    visible: boolean,
    onChange: (visible: boolean) => any
}) => {
    const intl = useIntl()
    const { socialsInfo } = useSelector((state: RootState) => state.main)
    const socialInfo = useMemo(() => socialsInfo.find((e) => e.type === socialType), [ socialsInfo ])
    const { visible, onChange, videoDetailData, activeClip, proscessNum, setProscessNum } = props
    const [ description, setDescription ] = useState("")
    const isShow = useMemo(() => !!socialsInfo.find((e) => e.type === socialType && e.username) && visible, [ visible, socialsInfo ])
    const [ searchVal, setSearchVal ] = useState("")
    const [ searchSubredditVal, setSearchSubredditVal ] = useState("")
    const [ subreddits, setSubreddits ] = useState<Subreddit[]>([])
    const [ tags, setTags ] = useState<string[]>([])
    
    const handleSearch = useCallback(
        (val?: string) => {
            if (val) {
                overwolf.social.reddit.searchSubreddits(val, (res) => {
                    setSubreddits(res.subreddits || [])
                })
            } else {
                setSubreddits([])
            }
        },
        []
    )

    useEffect(() => {
        handleSearch(searchVal)
    }, [ searchVal, handleSearch ])
    
    useEffect(() => {
        if ((!socialInfo || !socialInfo?.username) && visible) {
            setTimeout(() => {
                // 官方存在bug需要延迟调用
                loginSocial({ type: socialType })
            }, 100)
        }
    }, [ socialInfo, visible ])
    
    const shareContent = useCallback(
        () => {
            let newTags: string[] = []
            
            if (videoDetailData.gameName) {
                newTags = [
                    videoDetailData.gameName,
                    "gameshots",
                    "game.tv",
                    intl.formatMessage({ id: activeClip.eventType }),
                    ...tags
                ]
            }

            const shareParams = {
                tags: newTags,
                useOverwolfNotifications: true,
                file: activeClip.filePath,
                id: socialInfo?.username,
                gameClassId: videoDetailData.gameId,
                description,
                title: videoDetailData.gameName || "",
                gameTitle: videoDetailData.gameName,
                metadata: {},
                privateMode: false,
                subreddit: searchVal
                // trimming: {
                //     startTime: 0,
                //     endTime: 60000
                // }
            }
            console.log("shareParams", shareParams)
            setProscessNum(1)
            overwolf.social.reddit.shareEx(
                shareParams,
                (res) => {
                    if (res.success) {
                        onChange(false)
                        setDescription("")
                        setProscessNum(0)
                    } else {
                        Message.warn(res.error || "")  
                        setProscessNum(0)
                    }
                },
                (res) => {
                    if (res.progress) setProscessNum(res.progress)
                }
            )
        },
        [ intl, activeClip, description, videoDetailData, onChange, socialInfo, setProscessNum, searchVal, tags ]
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
            onOkDisable={!subreddits.length}
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
            top="calc(50% - 280px)"
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
                        <Sel
                            className="share-social-tags"
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
                        <div className="share-social-club">
                            <FormattedMessage id="chooseSubreddit" />
                            <div className="share-social-select">
                                <Select
                                    data={subreddits.map((e) => ({
                                        value: e.displayName,
                                        render: (
                                            <>
                                                <img className="share-social-select-icon" src={e.communityIcon || defaultImg} />
                                                {e.displayName}
                                            </>
                                        )
                                    }))}
                                    disabled={proscessNum !== 0}
                                    notFoundContent={null}
                                    onChange={setSearchSubredditVal}
                                    onSearch={handleSearch}
                                    placeholder={intl.formatMessage({ id: "chooseCommunity" })}
                                    showSearch
                                    value={searchSubredditVal}
                                />
                            </div>
                        </div>
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

export default memo(ShareReddit)