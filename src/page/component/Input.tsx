import React, { HTMLInputTypeAttribute, KeyboardEventHandler, memo } from "react"
import "./css/Input"

const Input = (props: {
    value: number | string,
    className?: string,
    maxLength?: number,
    max?: number,
    min?: number,
    type?: HTMLInputTypeAttribute,
    onKeyDown?: KeyboardEventHandler<HTMLInputElement> | undefined,
    onKeyUp?: KeyboardEventHandler<HTMLInputElement> | undefined,
    onChange?: (value: any) => any
}) => {
    const { className, value, maxLength, max, min, type = "number", onChange, onKeyDown, onKeyUp } = props

    return (
        <input
            className={`common-input ${className}`}
            maxLength={maxLength}
            onChange={(e) => {
                const inputVal = e.target.value
                const numVal = Number(inputVal)

                if (onChange) {
                    if (type === "number") {
                        if (isNaN(numVal)) {
                            onChange(0)
                        } else if (max !== undefined && max < Number(inputVal)) {
                            onChange(max)
                        } else if (min !== undefined && min > Number(inputVal)) {
                            onChange(min)
                        } else {
                            onChange(numVal)
                        }

                    } else {
                        onChange(inputVal)
                    }
                }
            }}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
            spellCheck={false}
            value={value}
        />
    )
}

export default memo(Input)
