import "./css/Button"
import React, { memo, ReactNode } from "react"

const Button = (props: {
    theme?: "default" | "yellow",
    className?: string,
    before?: ReactNode,
    onClick?: () => any,
    disable?: boolean,
    small?: boolean,
    children: ReactNode
}) => {
    const { theme = "default", children, onClick, className = "", before, disable = false, small = false } = props

    return (
        <div
            className={`button-common button-common-${theme}${disable
                ? "-disable"
                : ""} ${className} ${small
                ? "button-common-small"
                : ""}`}
            onClick={onClick}
        >
            {before}
            {children}
        </div>
    )
}

export default memo(Button)
