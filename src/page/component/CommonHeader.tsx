import "./css/CommonHeader.scss"
import { OWWindow } from "@overwolf/overwolf-api-ts"
import React, { memo } from "react"
import SvgIcon from "./SvgIcon"
import { WindowStateEx, windowNames } from "@config/baseConfig"

type HeaderState = {
    windowName: string,
    isMaximize: boolean,
    currentWindow?: OWWindow
}

class CommonHeader extends React.Component<unknown, HeaderState> {
    constructor (props: unknown) {
        super(props)
        this.state = {
            windowName: "",
            isMaximize: false,
            currentWindow: undefined
        }
    }

    componentDidMount () {
        overwolf.windows.getCurrentWindow((res) => {
            const { name, width, height } = res.window
            
            if (name === "inGame") overwolf.windows.changePosition(name, (window.screen.width - width) / 2, (window.screen.height - height) / 2, console.log)
            this.setState({
                windowName: name,
                currentWindow: new OWWindow(name)
            }, () => this.setDrag())
        })
    }

    // 设置拖拽
    setDrag = async () => {
        const { currentWindow } = this.state

        if (!currentWindow) return
        const commonHeader = document.getElementById("commonHeader")

        if (commonHeader) currentWindow.dragMove(commonHeader)
        const windowStateInfo = await currentWindow.getWindowState()
        this.setState({ isMaximize: windowStateInfo.window_state === WindowStateEx.MAXIMIZED })
    }

    closeWindow = () => {
        const { currentWindow, windowName } = this.state

        if (!currentWindow) return

        if (windowName === "desktop") {
            const background = new OWWindow(windowNames.background)
            background.close()
        } else {
            currentWindow.minimize()
        }
    }

    minimize = () => {
        const { currentWindow } = this.state

        if (!currentWindow) return
        currentWindow.minimize()
    }

    maximize = () => {
        const { currentWindow, isMaximize } = this.state

        if (!currentWindow) return
        isMaximize
            ? currentWindow.restore()
            : currentWindow.maximize()
        this.setState({ isMaximize: !isMaximize })
    }

    render () {
        const { isMaximize } = this.state

        return (
            <div
                className="common-header"
                id="commonHeader"
            >
                <div className="common-logo" />
                <div className="common-header-actions">
                    <div
                        className="common-header-button"
                        onClick={this.minimize}
                    >
                        <SvgIcon icon="minimize" />
                    </div>
                    <div
                        className="common-header-button"
                        onClick={this.maximize}
                    >
                        <SvgIcon icon={isMaximize
                            ? "maximize"
                            : "normal"}
                        />
                    </div>
                    <div
                        className="common-header-button"
                        onClick={this.closeWindow}
                    >
                        <SvgIcon icon="close" />
                    </div>
                </div>
            </div>
        )
    }
}

export default memo(CommonHeader)
