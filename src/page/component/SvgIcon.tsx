import React, { CSSProperties, memo } from "react"

type SvgProps = {
    icon: string,
    className?: string,
    size?: number,
    style?: CSSProperties,
    onClick?: () => any
}

const SvgIcon = (props: SvgProps) => {
    const { style, className, icon, size, onClick } = props

    return (
        <svg
            aria-hidden="true"
            className={className}
            onClick={onClick}
            style={{
                fontSize: `${size}px`,
                width: "1em",
                height: "1em",
                verticalAlign: "middle",
                fill: "currentColor",
                ...style
            }}
        >
            <use xlinkHref={`#icon-${icon}`} />
        </svg>
    )
}

export default memo(SvgIcon)
