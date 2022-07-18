import React, { memo } from "react"
import ReactSwitch from "react-switch"

const Switch = (props: { checked: boolean, onChange: ((check: boolean) => any) }) => {
    const { checked = false, onChange } = props

    return (
        <ReactSwitch
            activeBoxShadow="0px 0px 1px 2px #FFCC48"
            checked={checked}
            checkedIcon={false}
            handleDiameter={20}
            height={11}
            offColor="#585B76"
            onChange={onChange}
            onColor="#FFCC48"
            onHandleColor="#ffffff"
            uncheckedIcon={false}
            width={30}
        />
    )
}

export default memo(Switch)
