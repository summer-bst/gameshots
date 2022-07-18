import React from "react"
import Notification from "rc-notification"
import { NotificationInstance } from "rc-notification/es/Notification"
import "./css/Message"
import SvgIcon from "./SvgIcon"
let notificationInstance: NotificationInstance

Notification.newInstance({
    prefixCls: "message-common",
    style: { zIndex: 8000 }
}, (n) => {
    notificationInstance = n
})

const NOTICE = {
    duration: 1.5
}

const Message = {
    success: (content: string) => notificationInstance.notice({
        ...NOTICE,
        prefixCls: "message-common-success",
        content: 
    <div className="message-common-main">
        <div className="message-common-icon">
            <SvgIcon icon="msgIcon" size={25} />
        </div>
        {content}
    </div>
        
    }),
    error: (content: string) => notificationInstance.notice({
        ...NOTICE,
        prefixCls: "message-common-error",
        content: 
    <div className="message-common-main">
        <div className="message-common-icon">
            <SvgIcon icon="info" size={25} />
        </div>
        {content}
    </div>
        
    }),
    warn: (content: string) => notificationInstance.notice({
        ...NOTICE,
        prefixCls: "message-common-error",
        content: 
    <div className="message-common-main">
        <div className="message-common-icon">
            <SvgIcon icon="msgIcon" size={25} />
        </div>
        {content}
    </div>
        
    })
}

export default Message
