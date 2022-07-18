import "./index.scss"
import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useNavigate, useLocation, Outlet } from "react-router-dom"
import { FormattedMessage } from "react-intl"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "../redux/store"
import { setRouterPath } from "../redux/main"

const Setting = () => {
    const menus = useMemo(() => [ "overlay", "capture", "myGames", "storage", "accounts" ], [])
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { isChangeSetting } = useSelector((state: RootState) => state.main)
    const [ activeMenu, setActiveMenu ] = useState<string | undefined>("")
    
    useEffect(() => {
        setActiveMenu(menus.find((e) => location.pathname === "/setting" && e === "overlay" || location.pathname.includes(e)))
    }, [ location, menus ])

    const pushRouter = useCallback((path: string) => {
        const routerPath = `${path === "overlay"
            ? "/setting"
            : `/setting/${path}`}?r=${new Date().getTime()}`

        if (isChangeSetting) {
            dispatch(setRouterPath(routerPath))
        } else {
            navigate(routerPath)
        }
    }, [ isChangeSetting, dispatch, navigate ])

    return (
        <div className="setting">
            <div className="setting-left">
                {menus.map((e) => 
                    (
                        <div
                            className={
                                activeMenu === e
                                    ? "setting-menu-active"
                                    : ""
                            }
                            key={e}
                            onClick={() => pushRouter(e)}

                        >
                            <div className="setting-menu-item">
                                <div className="setting-menu-boder" />
                                <FormattedMessage id={e} />
                            </div>
                        </div>
                    )
                )}
            </div>
            <div className="setting-right">
                <Outlet />
            </div>
        </div>
    )
}

export default Setting
