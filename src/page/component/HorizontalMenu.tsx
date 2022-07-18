import "./css/HorizontalMenu"
import React, { memo } from "react"
import { NavLink } from "react-router-dom"

type menuProps = {
    menuTabs: {
        key: string,
        content: React.ReactNode
    }[]
}

const HorizontalMenu = (props: menuProps) => {
    const { menuTabs } = props

    return (
        <div className="horizontal-mnenu">
            {menuTabs.map((e) => 
                (
                    <NavLink
                        className={
                            ({ isActive }) =>
                                `horizontal-tab ${isActive
                                    ? "horizontal-tab-active"
                                    : ""}`
                        }
                        draggable={false}
                        end
                        key={e.key}// 严格模式
                        to={e.key}
                    >
                        {e.content}
                        <div className="horizontal-tab-border" />
                    </NavLink>
                )
            )}
        </div>
    )
}

export default memo(HorizontalMenu)
