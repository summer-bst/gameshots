import "./css/CommonTooltip"
import React, { memo, useRef } from "react"
import Tooltip from "rc-tooltip"
import { TooltipProps } from "rc-tooltip/lib/Tooltip.d"
import "rc-tooltip/assets/bootstrap_white.css"

interface CommonTooltipProps extends TooltipProps {
    mainClass?: string
}

const CommonTooltip = (props: CommonTooltipProps) => {
    
    const { children, mainClass } = props
    const ref = useRef<HTMLDivElement>(null)

    return (
        <Tooltip
            destroyTooltipOnHide
            getTooltipContainer={() => ref.current as HTMLElement}
            overlayClassName="common-tooltip"
            {...props}
        >
            <div className={`common-tooltip-item ${mainClass}`} ref={ref}>
                {children}
            </div>
        </Tooltip>
    )
}

export default memo(CommonTooltip)
