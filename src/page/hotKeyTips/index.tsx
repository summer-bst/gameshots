
import "./index.scss"
import "@assets/icons" // 引入全部svg
import React from "react"
import { FormattedMessage } from "react-intl"
import { OWWindow, OWGames } from "@overwolf/overwolf-api-ts"
import { notification } from "antd"
import { getOverwolfHotkeys } from "@utils/overwolfUtils"
import defaultHotKeys from "@config/defaultHotKeys"
import SvgIcon from "@component/SvgIcon"
import LocaleProvider from "../../i18n/LocaleProvider"
overwolf.windows.getCurrentWindow((res) => {
    const { name, width } = res.window
    overwolf.windows.changePosition("hotKeyTips", window.screen.width - width, 100, async () => {
        const currentGameInfo = await OWGames.getRunningGameInfo()
        const hotKeys = await getOverwolfHotkeys()

        const newHotkeys = defaultHotKeys.map((e) => {
            const global = hotKeys?.globals?.find((v) => v.name === e.name)
            const item = hotKeys?.games?.[currentGameInfo.classId]?.find((v) => v.name === e.name)

            return { ...e, ...global, ...item }
        }).filter((e) => e.name !== "showHideOverlay")
    
        notification.open({
            className: "hot-key-tips",
            message: "",
            // duration: null,
            closeIcon: <SvgIcon icon="close" size={20} />,
            description: (
                <LocaleProvider>
                    <div className="hot-key-tips-main">
                        <div className="hot-key-tips-logo">
                            <SvgIcon icon="logo" size={45} />
                        </div>
                        <div className="hot-key-tips-r">
                            <div className="hot-key-tips-title">
                                <FormattedMessage id="gameshotsIsActive" />
                            </div>
                            {newHotkeys?.map((v) => (
                                <div className="hot-key-tips-item" key={v.name}>
                                    <div className="hot-key-tips-item-title">
                                        {v.title}
                                    </div>
                                    <div className="hot-key-tips-bind">
                                        {v.binding}
                                    </div>
                                </div>
                            ))}
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
