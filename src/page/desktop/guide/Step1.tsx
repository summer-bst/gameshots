import "swiper/scss"
import "swiper/scss/navigation"
import React, { useCallback } from "react"
import { FormattedMessage } from "react-intl"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Navigation } from "swiper"
import Button from "@component/Button"
import SvgIcon from "@component/SvgIcon"
import { useNavigate } from "react-router-dom"

const Step1 = () => {
    const navigate = useNavigate()

    const nextStep = useCallback(
        () => {
            navigate("/step2")
        },
        [ navigate ]
    )

    return (
        <div className="step1">
            <div className="step1-title">
                <FormattedMessage id="welcome" />
            </div>
            <div className="step1-tip">
                <FormattedMessage id="tip8" />
            </div>
            <div className="step1-logo" />
            <div className="step1-title1">
                <FormattedMessage id="tip9" />
            </div>
            <div className="step1-swiper">
                <Swiper
                    autoplay={{
                        delay: 1000,
                        pauseOnMouseEnter: true,
                        disableOnInteraction: false
                    }}
                    loop
                    modules={[ Autoplay, Navigation ]}
                    navigation
                >
                    <SwiperSlide className="step1-item">
                        <div className="step1-item-icon">
                            <SvgIcon icon="hotkey" />
                        </div>
                        <div className="step1-item-explain">
                            <FormattedMessage id="explain1" />
                        </div>
                    </SwiperSlide>
                    <SwiperSlide className="step1-item">
                        <div className="step1-item-icon">
                            <SvgIcon icon="capture" />
                        </div>
                        <div className="step1-item-explain">
                            <FormattedMessage id="explain2" />
                        </div>
                    </SwiperSlide>
                    <SwiperSlide className="step1-item">
                        <div className="step1-item-icon">
                            <SvgIcon icon="share" />
                        </div>
                        <div className="step1-item-explain">
                            <FormattedMessage id="explain3" />
                        </div>
                    </SwiperSlide>
                    <SwiperSlide className="step1-item">
                        <div className="step1-item-icon">
                            <SvgIcon icon="recording" />
                        </div>
                        <div className="step1-item-explain">
                            <FormattedMessage id="explain4" />
                        </div>
                    </SwiperSlide>
                    <SwiperSlide className="step1-item">
                        <div className="step1-item-icon">
                            <SvgIcon icon="coustomize" />
                        </div>
                        <div className="step1-item-explain">
                            <FormattedMessage id="explain5" />
                        </div>
                    </SwiperSlide>

                </Swiper>
            </div>
            <Button
                className="step1-button"
                onClick={nextStep}
                theme="yellow"
            >
                <FormattedMessage id="setup" />
            </Button>
        </div>
    )
}

export default Step1
