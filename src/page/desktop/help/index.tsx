import "./index.scss"
import React, { useCallback } from "react"
import { FormattedMessage } from "react-intl"
import { Routes, Route } from "react-router-dom"
import HorizontalMenu from "@component/HorizontalMenu"
import About from "./About"
import Faqs from "./Faqs"

const menuTabs = [
    {
        key: "/help",
        content: <FormattedMessage id="about" />

    },
    {
        key: "faqs",
        content: <FormattedMessage id="faqs" />
    }
]

const Help = () => {
    const openUrl = useCallback(
        (url: string) => overwolf.utils.openUrlInDefaultBrowser(url),
        []
    )
    
    return (
        <div className="faq">
            <div className="faq-main">
                <div className="faq-header">
                    <HorizontalMenu
                        menuTabs={menuTabs}
                    />
                </div>
                <div className="faq-content">
                    <Routes>
                        <Route
                            element={<About />}
                            index
                        />
                        <Route
                            element={<Faqs />}
                            path="faqs"
                        />
                    </Routes>
                </div>
                <div className="faq-footer">
                    <span>
                        <FormattedMessage id="explain46" />
                        <span className="faq-footer-link" onClick={() => openUrl("https://support.game.tv/en/support/solutions/82000473147")}> 
                            support.game.tv
                        </span>
                    </span>
                    <span>
                        <span className="faq-footer-link" onClick={() => openUrl("https://www.game.tv/terms-of-use")}> 
                            <FormattedMessage id="explain34" />
                        </span>
                        <span className="faq-footer-link faq-footer-privacy" onClick={() => openUrl("https://www.game.tv/privacy-policy")}> 
                            <FormattedMessage id="Privacy" />
                        </span>
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Help
