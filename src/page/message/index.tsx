
import "./index.scss"
import "@assets/icons" // 引入全部svg
import React from "react"
import { FormattedMessage } from "react-intl"
import { OWWindow } from "@overwolf/overwolf-api-ts"
import { notification } from "antd"
import SvgIcon from "@component/SvgIcon"
import LocaleProvider from "../../i18n/LocaleProvider"
overwolf.windows.getCurrentWindow((res) => {
    const { name, width } = res.window
    overwolf.windows.changePosition(name, window.screen.width - width, 100, () => {
        notification.open({
            top: 0,
            className: "message-tips",
            message: "",
            // duration: null,
            closeIcon: <span />,
            description: (
                <LocaleProvider>
                    <div className="message-tips-main">
                        <div className="message-tips-logo">
                            <SvgIcon icon={name} size={30} />
                        </div>
                        <div className="message-tips-r">
                            <div className="message-tips-title">
                                <FormattedMessage id={name} />
                            </div>
                        </div>
                    </div>
                </LocaleProvider>
            ),
            onClose: () => {
                new OWWindow(name).close()
            }
        })
    })
})
