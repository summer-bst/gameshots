
import React from "react"
import { FormattedMessage } from "react-intl"
import Button from "@component/Button"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { changeEnterStatus } from "../redux/main"

const Step6 = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const goHome = () => {
        dispatch(changeEnterStatus(false))
        navigate("/")
    }

    return (
        <div className="step6">
            <div className="step6-content">
                <div className="step6-title">
                    <FormattedMessage id="step6Title" />
                </div>
                <div className="step6-explain">
                    <FormattedMessage id="explain15" />
                </div>
                <div className="step6-img" />
            </div>
            <div className="guide-footer">
                <Button onClick={goHome} theme="yellow">
                    <FormattedMessage id="letsGo" />
                </Button>
            </div>
        </div>
    )
}

export default Step6
