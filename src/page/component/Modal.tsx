import "./css/Modal"
import React, { memo } from "react"
import { useIntl } from "react-intl"
import { Modal as Dialog } from "antd"
import Button from "./Button"

export type ModalProps = {
    top?: string,
    visible: boolean,
    showCancle?: boolean,
    showOk?: boolean,
    closable?: boolean,
    title?: React.ReactNode,
    onClose?: () => any,
    onOk?: () => any,
    width?: number,
    cancleText?: string,
    okText?: string,
    children: React.ReactNode,
    className?: string,
    onOkDisable?: boolean
}

const Modal = (props: ModalProps) => {
    const intl = useIntl()

    const {
        visible,
        title,
        children,
        top = "240px",
        showCancle = true,
        showOk = true,
        closable = false,
        width = 515,
        cancleText = intl.formatMessage({ id: "cancleText" }),
        okText = intl.formatMessage({ id: "okText" }),
        onClose,
        onOk,
        className = "",
        onOkDisable = false
    } = props

    return (
        <Dialog
            closable={closable}
            footer={null}
            onCancel={onClose}
            style={
                {
                    top
                }
            }
            visible={visible}
            width={width}
            wrapClassName={`modal-common ${className}`}
            zIndex={5000}
        >
            <div className="modal-common-title">
                {title}
            </div>
            <div className="modal-common-content">
                {children}
            </div>
            {(showCancle || showOk) && 
                <div className="modal-common-footer">
                    {showCancle
                        ? 
                            <Button onClick={onClose}>
                                {cancleText}
                            </Button>
                        : ""}
                    {showCancle && showOk && <div className="modal-common-kong" />}
                    {showOk
                        ? (
                            <Button
                                disable={onOkDisable}
                                onClick={onOk}
                                theme="yellow"
                            >
                                {okText}
                            </Button>
                        )
                        : ""}
                </div>}
        </Dialog>
    )
}

export default memo(Modal)
