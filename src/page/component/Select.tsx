import "./css/Select"
import React, { memo, ReactNode } from "react"
import { Select as Sel, SelectProps as SelProps } from "antd"
const { Option } = Sel

interface SelectProps extends SelProps<any>{
    optionstitle?: string,
    data?: {
        value: number | string,
        render?: ReactNode,
        disabled?: boolean
    }[]
}
 
const Select = (props: SelectProps) => {
    const { data, optionstitle } = props

    return (
        <Sel
            className="select-common"
            dropdownClassName="select-dropdown"
            {...props}
            getPopupContainer={(triggerNode) => triggerNode.parentElement}
        >
            {data?.map((e) => (
                <Option
                    disabled={e.disabled}
                    key={e.value}
                    title={optionstitle}
                    value={e.value}
                >
                    {e.render || e.value}
                </Option>
            ))}
        </Sel>
    )
}

export default memo(Select)
