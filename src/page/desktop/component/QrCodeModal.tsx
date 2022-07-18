import "./QrCodeModal.scss"
import React, { memo } from "react"
import Modal from "@component/Modal"
import QrCode from "./QrCode"
import { FormattedMessage } from "react-intl"
import SvgIcon from "@component/SvgIcon"
import { Link } from "react-router-dom"
import CommonTooltip from "@component/CommonTooltip"

const QrCodeModal = (props: {
    visible: boolean,
    callBack?: () => any,
    onClose: () => any
}) => {
    const { onClose, visible, callBack } = props

    return (
        <Modal
            closable
            onClose={onClose}
            showCancle={false}
            showOk={false}
            title={
                <div className="qr-code-modal-title">
                    <div className="qr-code-modal-logo" />
                    <span>
                        <FormattedMessage
                            id="step5Title"
                        />
                    </span>
                </div>
            }
            top="calc(50% - 300px)"
            visible={visible}
            width={952}
        >
            <div className="qr-code-modal-link">
                <div className="qr-code-modal-link-l" />
                <div className="qr-code-modal-link-r">
                    <QrCode
                        callBack={() => {
                            onClose()
                            callBack && callBack()
                        }}
                        className="qr-code-modal-link-qrcode"
                    />
                    <div className="qr-code-modal-link-explain">
                        <FormattedMessage id="explain14" />
                        <CommonTooltip
                            align={
                                {
                                    offset: [ 5, 10 ]
                                }
                            }
                            overlay={(
                                <div className="qr-code-modal-explain">
                                    <div> 
                                        1. 
                                        {" "}
                                        <FormattedMessage id="explain38" />
                                    </div>
                                    <div> 
                                        2. 
                                        {" "}
                                        <FormattedMessage id="explain39" />
                                    </div>
                                    <div> 
                                        3. 
                                        {" "}
                                        <FormattedMessage id="explain40" />
                                    </div>
                                    <div> 
                                        4. 
                                        {" "}
                                        <FormattedMessage id="explain41" />
                                    </div>
                                </div>
                            )}
                            placement="rightTop"
                            trigger="hover"
                        >
                            <SvgIcon className="qr-code-modal-info" icon="info" />
                        </CommonTooltip>
                    </div>
                    <div className="qr-code-modal-text">
                        <FormattedMessage id="explain43" />
                        <Link className="qr-code-modal-link-install" to="/help">
                            <FormattedMessage id="explain44" />
                        </Link>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default memo(QrCodeModal)
