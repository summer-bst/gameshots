import React, { useState, useCallback, useMemo, useEffect } from "react"
import { FormattedMessage, useIntl } from "react-intl"
import { useSelector, useDispatch } from "react-redux"
import Button from "@component/Button"
import SvgIcon from "@component/SvgIcon"
import Modal from "@component/Modal"
import Message from "@component/Message"
import { RootState } from "../../redux/store"
import { deleteUserInfo } from "../../redux/request"
import QrCodeModal from "../../component/QrCodeModal"
import { loginSocial, LogoutSocial } from "@utils/overwolfUtils"

const Accounts = () => {
    const intl = useIntl()
    const dispatch = useDispatch()
    const { headerParams } = useSelector((state: RootState) => state.request)
    const { socialsInfo } = useSelector((state: RootState) => state.main)
    const [ showModal, setShowModal ] = useState(false)
    const [ showQrCodeModal, setShowQrCodeModal ] = useState(false)
    const [ loading, setLoading ] = useState(false)
    const [ disabledSocials, setDisabledSocials ] = useState<string[]>([])

    const allSocialsInfo: SocialUser[] = useMemo(() => [
        {
            type: "game.tv",
            id: headerParams.gtvUserId
        },
        ...socialsInfo.map((e) => ({ ...e, disabled: !!disabledSocials.find((v) => v === e.type.toLowerCase()) }))
    ], [ socialsInfo, headerParams, disabledSocials ])

    const removeAccount = useCallback(({ type }: SocialUser) => {
        if (type === "game.tv") {
            setShowModal(true)        
        } else {
            LogoutSocial({ type })
        }
    }, [])

    const removeGameTvAccount = useCallback(async () => {
        if (loading) return
        setLoading(true)
        await dispatch(deleteUserInfo())
        setShowModal(false)
        setLoading(false)
    },
    [ dispatch, loading ]
    )
    
    const loginAllSocial = useCallback(({ type, disabled }: SocialUser) => {
        if (disabled) return Message.warn(intl.formatMessage({ id: "socialDisabelTip" }, { type }))
 
        if (type === "game.tv") {
            setShowQrCodeModal(true)
        } else {
            loginSocial({ type })
        }
    }, [ intl ])
    useEffect(() => {
        overwolf.social.getDisabledServices((res) => res.disabled_services && setDisabledSocials(res.disabled_services))
    }, [])
    
    return (
        <div className="setting-content">
            <div className="setting-content-title">
                <FormattedMessage id="linkedAccounts" />
            </div>
            {
                allSocialsInfo.map((e) => 
                    e.username || e.id ?
                        (
                            <div className="setting-content-item" key={e.type}>
                                <div>
                                    <SvgIcon
                                        className="setting-social-icon"
                                        icon={e.type}
                                        size={24}
                                    />
                                    {e.type}
                                    <div className="setting-content-item-path">
                                        {e.username || e.id}
                                    </div>
                                </div>
                                <div className="setting-content-item-remove" onClick={() => removeAccount(e)}>
                                    <FormattedMessage id="removeAccount" />
                                </div>
                            </div>
                        )
                        : (
                            <div className="setting-content-item" key={e.type}>
                                <div>
                                    <SvgIcon
                                        className="setting-social-icon"
                                        icon={e.type}
                                        size={24}
                                    />
                                    {e.type}
                                </div>
                                <Button
                                    before={<SvgIcon className="setting-content-link-icon" icon="link" />}
                                    // disable={e?.disabled}
                                    onClick={() => loginAllSocial(e)}
                                    small
                                >
                                    <FormattedMessage id="linkAccount" />
                                </Button>
                            </div>
                        )
                )
            }
            <Modal
                onClose={() => setShowModal(false)}
                onOk={removeGameTvAccount}
                title={intl.formatMessage({ id: "removeAccountTitle" })}
                visible={showModal}
            >
                <FormattedMessage id="tip14" />
            </Modal>
            <QrCodeModal onClose={() => setShowQrCodeModal(false)} visible={showQrCodeModal} />
        </div>
    )
}

export default Accounts