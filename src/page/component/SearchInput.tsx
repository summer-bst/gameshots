import "./css/SearchInput"
import React, { memo, useState, useCallback } from "react"
import SvgIcon from "./SvgIcon"
import { useIntl } from "react-intl"

const SearchInput = (props: {
    value: number | string,
    onChange: (val: string) => any
}) => {
    const { value, onChange } = props
    const intl = useIntl()
    const [ isFocus, setIsFocus ] = useState(false)

    const clearAll = useCallback(
        () => {
            onChange("")
        },
        [ onChange ]
    )

    return (
        <div
            className={`search-input-common ${isFocus
                ? "search-input-active"
                : ""}`}
        >
            {!isFocus && (
                <div>
                    <SvgIcon icon="searchs" />
                </div>
            )}
            <input
                maxLength={24}
                onBlur={() => setIsFocus(false)}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocus(true)}
                placeholder={intl.formatMessage({ id: "search" })}
                spellCheck={false}
                value={value}
            />
            {isFocus && value && (
                <div
                    className="search-input-close"
                    onClick={clearAll}
                    onMouseDown={(e) => e.preventDefault()}
                >
                    <SvgIcon icon="close" />
                </div>
            )}
        </div>
    )
}

export default memo(SearchInput)
