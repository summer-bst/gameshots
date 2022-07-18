import "./ShareGameTv.scss"
import React, { useState, useEffect, useCallback, memo, useMemo } from "react"
import Modal from "@component/Modal"
import { useIntl, FormattedMessage } from "react-intl"
import { useSelector } from "react-redux"
import { RootState } from "../../redux/store"
import { Thumbnail } from "./VideoThumbnail"
import Button from "@component/Button"
import { Progress } from "antd"
import Message from "@component/Message"
import SvgIcon from "@component/SvgIcon"
import CommonLoading from "@component/CommonLoading"
import Select from "@component/Select"
import defaultImg from "@assets/image/userlogo.png"
import { loginSocial, LogoutSocial } from "@utils/overwolfUtils"

import Guild = overwolf.social.discord.Guild
import Channel = overwolf.social.discord.Channel
const socialType = "Discord"

const ShareDiscord = (props: {
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
    const [ loading, setLoading ] = useState(false)
    const [ description, setDescription ] = useState("")
    const [ guilds, setGuilds ] = useState<Guild[]>([])
    const [ guidId, setGuidId ] = useState("")
    const [ channels, setChannels ] = useState<Channel[]>([])
    const [ channelId, setChannelId ] = useState("")
    const isShow = useMemo(() => !!socialsInfo.find((e) => e.type === socialType && e.id) && visible, [ visible, socialsInfo ])

    const selectGuidData = useMemo(() => guilds?.map((e) => ({
        value: e.id,
        render: (
            <div className="share-social-select-i">
                <img draggable={false} src={e.icon || defaultImg} />
                {e.name}
            </div>
        )
    })), [ guilds ])

    const selectChannelData = useMemo(() => channels?.map((e) => ({
        value: e.id,
        render: (
            <div className="share-social-select-i">
                {e.name}
            </div>
        )
    })), [ channels ])

    useEffect(() => {
        if (guidId) {
            setLoading(true)
            overwolf.social.discord.getChannels(guidId, (res) => {
                setLoading(false)

                if (res?.channels?.length) {
                    setChannels(res.channels)
                    setChannelId(res.channels[0].id)
                }
            })
        }
    }, [ guidId ])
    
    useEffect(() => {
        if (socialInfo?.id) {
            overwolf.social.discord.getGuilds((res) => {
                if (res?.guilds?.length) {
                    setGuilds(res.guilds)
                    setGuidId(res.guilds[0].id)
                }
               
            })
        }
    }, [ socialInfo ])
    
    useEffect(() => {
        if ((!socialInfo || !socialInfo?.id) && visible) {
            setTimeout(() => {
                // 官方存在bug需要延迟调用
                loginSocial({ type: socialType })
            }, 100)
        }
    }, [ socialInfo, visible ])
    
    const shareContent = useCallback(
        () => {
            const shareParams = {
                useOverwolfNotifications: true,
                file: activeClip.filePath,
                message: description,
                channelId,
                events: [],
                id: guidId,
                gameClassId: videoDetailData.gameId,
                gameTitle: videoDetailData.gameName || "",
                metadata: {}
                // trimming: {
                //     startTime: 0,
                //     endTime: 60000
                // }
            }
            setProscessNum(1)
            console.log("shareParams", shareParams)
            overwolf.social.discord.shareEx(
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
                    if (res.progress)setProscessNum(res.progress)
                }
            )
        },
        [ activeClip, description, videoDetailData, channelId, guidId, onChange, setProscessNum ]
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
            showOk={!loading && !proscessNum}
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
            {
                loading
                    ? (
                        <div className="share-social-loading"> 
                            <CommonLoading />
                        </div>
                    )
                    : (
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
                                    <div className="share-social-club">
                                        <FormattedMessage id="server" />
                                        <div className="share-social-select">
                                            <Select
                                                data={selectGuidData}
                                                disabled={proscessNum !== 0}
                                                onChange={setGuidId}
                                                value={guidId}
                                            />
                                        </div>
                               
                                    </div>
                                    <div className="share-social-club">
                                        <FormattedMessage id="channel" />
                                        <div className="share-social-select">
                                            <Select
                                                data={selectChannelData}
                                                disabled={proscessNum !== 0}
                                                onChange={setChannelId}
                                                value={channelId}
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
                    )
            }
        </Modal>
    )
}

export default memo(ShareDiscord)