
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
            className: "record-error",
            message: "",
            // duration: null,
            closeIcon: <SvgIcon icon="close" size={20} />,
            description: (
                <LocaleProvider>
                    <div className="record-error-main">
                        <div className="record-error-logo">
                            <SvgIcon icon="warning" size={45} />
                        </div>
                        <div className="record-error-r">
                            <div className="record-error-title">
                                <FormattedMessage id="recordErrorTitle" />
                            </div>
                            <div className="record-error-text">
                                <FormattedMessage id="recordErrorText" />
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
