import "./css/Checkbox"
import React, { memo } from "react"
import SvgIcon from "./SvgIcon"

const Checkbox = (props: {
    checked?: boolean
}) => {
    const { checked } = props

    return (
        <div
            className="checkbox-common"
        >
            <SvgIcon icon={checked
                ? "check"
                : "nocheck"}
            />
        </div>
    )
}

export default memo(Checkbox)
