import "./index.scss"
import React, { useState } from "react"
import { FormattedMessage } from "react-intl"
import SvgIcon from "@component/SvgIcon"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { RootState } from "../redux/store"
import QrCodeModal from "../component/QrCodeModal"

const Home = () => {
    const { headerParams } = useSelector((state: RootState) => state.request)
    const [ isShowModal, setIsShowModal ] = useState(false)

    return (
        <div className="home">
            <div className="home-logo">
                <FormattedMessage id="record" />
                .
                {" "}
                <FormattedMessage id="review" />
                .
                {" "}
                <span className="home-relive">
                    <FormattedMessage id="relive" />
                </span>
            </div>
            <div className="home-main">
                <div className="home-body">
                    <div className="home-item">
                        <div className="home-item-title">
                            <FormattedMessage id="homeTitle1" />
                        </div>
                        <ul>
                            <li>
                                <FormattedMessage id="explain23" />
                            </li>
                            <li>
                                <FormattedMessage id="explain24" />
                            </li>
                            <li>
                                <FormattedMessage id="explain25" />
                            </li>
                        </ul>
                        <Link to="/help/faqs">
                            <div className="home-button">
                                <FormattedMessage id="learnMore" />
                                <SvgIcon icon="arrow" size={30} />
                            </div>
                        </Link>
                    </div>
                    <div className="home-item">
                        <div className="home-item-title">
                            <FormattedMessage id="homeTitle2" />
                        </div>
                        <ul>
                            <li>
                                <FormattedMessage id="explain26" />
                            </li>
                            <li>
                                <FormattedMessage id="explain27" />
                            </li>
                            <li>
                                <FormattedMessage id="explain28" />
                            </li>
                        </ul>
                        {
                            headerParams.gtvUserId ?
                                <Link to="/videoLibrary">
                                    <div className="home-button">
                                        <FormattedMessage id="shareNow" />
                                        <SvgIcon icon="arrow" size={30} />
                                    </div>
                                </Link> :
                                <div className="home-button" onClick={() => setIsShowModal(true)}>
                                    <FormattedMessage id="logInGameTv" />
                                    <SvgIcon icon="arrow" size={30} />
                                </div>
                        }
                    </div>
                    <div className="home-item">
                        <div className="home-item-title">
                            <FormattedMessage id="homeTitle3" />
                        </div>
                        <ul>
                            <li>
                                <FormattedMessage id="explain29" />
                            </li>
                            <li>
                                <FormattedMessage id="explain30" />
                            </li>
                            <li>
                                <FormattedMessage id="explain31" />
                            </li>
                        </ul>
                        <Link to="/setting">
                            <div className="home-button">
                                <FormattedMessage id="settings" />
                                <SvgIcon icon="arrow" size={30} />
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
            <QrCodeModal
                onClose={() => setIsShowModal(false)}
                visible={isShowModal}
            />
        </div>
    )
}

export default Home
