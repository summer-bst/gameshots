import React, { memo, useEffect, useCallback } from "react"
import { setHeaderParams } from "../redux/request"
import { clientId } from "@config/baseConfig"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "../redux/store"
import { useIntl } from "react-intl"
import Message from "@component/Message"

const QrCode = (props: {
    className?: string,
    callBack?: () => any
}) => {
    const intl = useIntl()
    const { username, machineId } = useSelector((state: RootState) => state.request)
    const { callBack, className } = props
    const dispatch = useDispatch()

    const getIframeMessage = useCallback(
        (event: MessageEvent<{ gtv_user_id: string, gtv_auth_token: string }>) => {
            const { gtv_user_id: gtvUserId, gtv_auth_token: gtvAuthToken } = event.data

            if (gtvAuthToken && gtvUserId) {
                dispatch(setHeaderParams({ gtvUserId, gtvAuthToken }))
                Message.success(intl.formatMessage({ id: "tip20" }))
                callBack && callBack()
            } else {
                Message.error(intl.formatMessage({ id: "tip21" }))
            }
        },
        [ dispatch, callBack, intl ]
    )
    
    useEffect(() => {
        window.addEventListener("message", getIframeMessage)

        return () => {
            window.removeEventListener("message", getIframeMessage)
        }
    }, [ getIframeMessage ])

    return (
        <iframe
            className={className}
            frameBorder="0"
            src={`${QRCODE_URL}?client_id=${clientId}&client_user_id=${username}&machine_id=${machineId}`}
        />
    )
}

export default memo(QrCode)
