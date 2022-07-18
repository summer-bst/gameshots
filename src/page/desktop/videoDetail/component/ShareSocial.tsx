
import "./ShareSocial.scss"
import React, { useState, useEffect, useCallback, useMemo, memo } from "react"
import CommonTooltip from "@component/CommonTooltip"
import { loginSocial } from "@utils/overwolfUtils"
import { FormattedMessage, useIntl } from "react-intl"
import { useSelector } from "react-redux"
import { RootState } from "../../redux/store"
import SvgIcon from "@component/SvgIcon"
import Message from "@component/Message"
import Modal from "@component/Modal"
import ShareTwitter from "./ShareTwitter"
import ShareDiscord from "./ShareDiscord"
import ShareGfycat from "./ShareGfycat"
import ShareReddit from "./ShareReddit"
import ShareYoutube from "./ShareYoutube"

const ShareSocial = (props: {
    activeClip: VideoClipItem,
    videoDetailData: VideoCacheData
}) => {
    const intl = useIntl()
    const { activeClip, videoDetailData } = props
    const { socialsInfo } = useSelector((state: RootState) => state.main)
    const [ visible, setVisible ] = useState(false)
    const [ disabledSocials, setDisabledSocials ] = useState<string[]>([])
    const allSocialsInfo: SocialUser[] = useMemo(() => socialsInfo.map((e) => ({ ...e, disabled: !!disabledSocials.find((v) => v === e.type.toLowerCase()) })), [ socialsInfo, disabledSocials ])
    const [ twitterVisible, setTwitterVisible ] = useState(false)
    const [ discordVisible, setDiscordVisible ] = useState(false)
    const [ gfycatVisible, setGfycatVisible ] = useState(false)
    const [ redditVisible, setRedditVisible ] = useState(false)
    const [ youtubeVisible, setYoutubeVisible ] = useState(false)
    const [ proscessNum, setProscessNum ] = useState(0)
    const [ showShareTip, setShowShareTip ] = useState(false)
    const [ currentType, setCurrentType ] = useState<SocialUser["type"] | "">("")
    useEffect(() => {
        overwolf.social.getDisabledServices((res) => res.disabled_services && setDisabledSocials(res.disabled_services))
    }, [])

    const handleModal = useCallback(
        (type: SocialUser["type"], visible: boolean) => {
            switch (type) {
            case "Twitter":
                setTwitterVisible(visible)
                break
            case "Discord":
                setDiscordVisible(visible)
                break
            case "Gfycat":
                setGfycatVisible(visible)
                break
            case "Reddit":
                setRedditVisible(visible)
                break
            case "Youtube":
                setYoutubeVisible(visible)
                break
                    
            default:
                break
            }

            if (proscessNum && !visible)setShowShareTip(true)
        },
        [ proscessNum ]
    )

    const openSocialModal = useCallback(
        ({ type, disabled }: SocialUser) => {
            setVisible(false)

            if (disabled) return Message.warn(intl.formatMessage({ id: "socialDisabelTip" }, { type }))
            const socialInfo = socialsInfo.find((e) => e.type === type && (e.id || e.username))

            if (!socialInfo) loginSocial({ type })
            setCurrentType(type)
            handleModal(type, true)
        },
        [ intl, socialsInfo, handleModal ]
    )

    return (
        <>
            <CommonTooltip
                mainClass="share-social-cur-main"
                onVisibleChange={setVisible}
                overlay={(
                    <div className="share-social-link">
                        <div className="share-social-t">
                            <FormattedMessage id="shareThisLinkVia" />
                        </div>
                        {
                            allSocialsInfo.map((e) => (
                                <CommonTooltip
                                    key={e.type}
                                    mainClass="share-social-cur-tip"
                                    overlay={e.type}
                                    placement="bottom"
                                    trigger="hover"
                                >
                                    <span
                                        className="share-social-icon"
                                    >
                                        <SvgIcon
                                            icon={e.type}
                                            onClick={() => openSocialModal(e)}
                                            size={40}
                                        />
                                    </span>
                                </CommonTooltip>
                            ))
                        }
                    </div>
                )}
                placement="topRight"
                trigger="click"
                visible={visible}
            >
                <SvgIcon
                    className="share-social-icon"
                    icon="shareLink"
                    size={48}
                />
            </CommonTooltip>
            <ShareTwitter
                activeClip={activeClip}
                onChange={(visible) => handleModal("Twitter", visible)}
                proscessNum={proscessNum}
                setProscessNum={setProscessNum}
                videoDetailData={videoDetailData}
                visible={twitterVisible}
            />
            <ShareDiscord
                activeClip={activeClip}
                onChange={(visible) => handleModal("Discord", visible)}
                proscessNum={proscessNum}
                setProscessNum={setProscessNum}
                videoDetailData={videoDetailData}
                visible={discordVisible}
            />
            <ShareGfycat
                activeClip={activeClip}
                onChange={(visible) => handleModal("Gfycat", visible)}
                proscessNum={proscessNum}
                setProscessNum={setProscessNum}
                videoDetailData={videoDetailData}
                visible={gfycatVisible}
            />
            <ShareReddit
                activeClip={activeClip}
                onChange={(visible) => handleModal("Reddit", visible)}
                proscessNum={proscessNum}
                setProscessNum={setProscessNum}
                videoDetailData={videoDetailData}
                visible={redditVisible}
            />
            <ShareYoutube
                activeClip={activeClip}
                onChange={(visible) => handleModal("Youtube", visible)}
                proscessNum={proscessNum}
                setProscessNum={setProscessNum}
                videoDetailData={videoDetailData}
                visible={youtubeVisible}
            />
            <Modal
                className="share-social-tip-modal"
                okText={intl.formatMessage({ id: "Okay" })}
                onOk={() => {
                    setShowShareTip(false)

                    if (currentType) openSocialModal({ type: currentType })
                }}
                showCancle={false}
                title={intl.formatMessage({ id: "sharingInProgress" })}
                visible={showShareTip}
            >
                <FormattedMessage id="sharingInProgressText1" values={{ type: currentType }} />
            </Modal>
        </>
    )
}

export default memo(ShareSocial)