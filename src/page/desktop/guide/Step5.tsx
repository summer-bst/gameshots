
import React, { useState } from "react"
import { FormattedMessage } from "react-intl"
import { Link, useNavigate } from "react-router-dom"
import Button from "@component/Button"
import SvgIcon from "@component/SvgIcon"
import QrCode from "../component/QrCode"
import CommonTooltip from "@component/CommonTooltip"

const Step5 = () => {
    const navigate = useNavigate()
    const [ disable, setDisable ] = useState(true)

    const nextStep = () => {
        navigate("/step6")
    }

    return (
        <div className="step5">
            <div className="step5-skip" onClick={nextStep}>
                <FormattedMessage id="skip" />
            </div>
            <div className="step5-content">
                <div className="step5-title">
                    <FormattedMessage id="step5Title" />
                </div>
                <div className="step5-explain">
                    <FormattedMessage id="explain14" />
                    <CommonTooltip
                        align={
                            {
                                offset: [ 5, 10 ]
                            }
                        }
                        overlay={(
                            <div className="step5-explain-info">
                                <div> 
                                    1. 
                                    {" "}
                                    <FormattedMessage id="explain38" />
                                </div>
                                <div> 
                                    2. 
                                    {" "}
                                    <FormattedMessage id="explain39" />
                                </div>
                                <div> 
                                    3. 
                                    {" "}
                                    <FormattedMessage id="explain40" />
                                </div>
                                <div> 
                                    4. 
                                    {" "}
                                    <FormattedMessage id="explain41" />
                                </div>
                            </div>
                        )}
                        placement="rightTop"
                        trigger="hover"
                    >
                        <SvgIcon className="step5-info" icon="info" />
                    </CommonTooltip>
                </div>
                <QrCode callBack={() => setDisable(false)} className="step5-content-qrcode" />
            </div>
            <div className="guide-footer">
                <Link to="/step4">
                    <Button>
                        <FormattedMessage id="back" />
                    </Button>
                </Link>
                <Button
                    disable={disable}
                    onClick={nextStep}
                    theme="yellow"
                >
                    <FormattedMessage id="done" />
                </Button>
            </div>
        </div>
    )
}

export default Step5
