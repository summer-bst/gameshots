import "./css/SelectCard"
import React, { memo } from "react"

const SelectCard = (props: {
    data: (number | string)[],
    value: number | string,
    onChange: (params: any) => any
}) => {
    const { data, value, onChange } = props

    return (
        <div className="select-card-common">
            {data.map((e) => (
                <div
                    className={`select-card-common-child ${value === e
                        ? "select-card-common-active"
                        : ""}`}
                    key={e}
                    onClick={() => onChange(e)}
                >
                    <div className="select-card-common-item">
                        {e}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default memo(SelectCard)
