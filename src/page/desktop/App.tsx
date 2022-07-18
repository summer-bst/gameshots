import React, { useState, useEffect, useMemo, useCallback } from "react"
import SvgIcon from "@component/SvgIcon"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { FormattedMessage, useIntl } from "react-intl"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "./redux/store"
import { setRouterPath } from "./redux/main"
import { getHardDiskFreeSpace } from "@utils/overwolfUtils"
import CommonTooltip from "@component/CommonTooltip"
import Modal from "@component/Modal"

const App = () => {
    const menus = useMemo(() => {
        const m = [ "home", "videoLibrary", "setting", "help" ]

        if (NODE_ENV === "local")m.push("test")

        return m
    }, [])
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const intl = useIntl()
    const [ showTip1, setShowTip1 ] = useState(false)
    const [ showTip2, setShowTip2 ] = useState(false)
    const { isChangeSetting, videoFolderPath, settingConfig, checkForUpdateResult } = useSelector((state: RootState) => state.main)
    const { userConfig } = useSelector((state: RootState) => state.request)
    const [ activeMenu, setActiveMenu ] = useState<string | undefined>("")
    const [ showUpdateTip, setShowUpdateTip ] = useState(true)
    useEffect(() => {
        setActiveMenu(menus.find((e) => location.pathname === "/" && e === "home" || location.pathname.includes(e)))
    }, [ location, menus ])

    const pushRouter = useCallback((path: string) => {
        const routerPath = `${path === "home"
            ? "/"
            : `/${path}`}?r=${new Date().getTime()}`

        if (isChangeSetting) {
            dispatch(setRouterPath(routerPath))
        } else {
            navigate(routerPath)
        }
    }, [ isChangeSetting, dispatch, navigate ])
    
    useEffect(() => {
        // 磁盘容量不足的提示
        new Promise<void>(async () => {
            const diskFreeSize = await getHardDiskFreeSpace(videoFolderPath)

            const videoFolderSize = await new Promise<number>((resolve, reject) => {
                overwolf.media.getAppVideoCaptureFolderSize((res) => {
                    if (res.success) {
                        resolve((res.totalVideosSizeMB || 0) / 1024)
                    } else {
                        reject()
                    }
                })
            })

            if (userConfig && settingConfig.videoSapceLimit - videoFolderSize < userConfig.settings.disk_space_limit / 1024 ** 3) {
                return setShowTip1(true)
            }

            if (settingConfig.videoSapceLimit > diskFreeSize + videoFolderSize) {
                return setShowTip2(true)
            }
        })
    }, [userConfig]) // eslint-disable-line

    return (
        <>
            <div className="desktop-left">
                {menus.map((e) => 
                    (
                        <div
                            className={activeMenu === e
                                ? "desktop-active"
                                : ""}
                            key={e}
                            onClick={() => pushRouter(e)}
                        >
                            {checkForUpdateResult?.state && checkForUpdateResult?.state !== "UpToDate" && e === "help" 
                                ? (
                                    <CommonTooltip
                                        onVisibleChange={setShowUpdateTip}
                                        overlay={(
                                            <>
                                                <SvgIcon
                                                    className="desktop-download"
                                                    icon="download"
                                                    size={24}
                                                />    
                                                <FormattedMessage id="updateTip" />
                                            </>
                                        )}
                                        overlayClassName="desktop-update"
                                        placement="right"
                                        trigger="hover"
                                        visible={showUpdateTip}
                                    >
                                        <div className="desktop-item">
                                            <div className="desktop-item-main">
                                                <div className="desktop-item-boder" />
                                                <SvgIcon icon={e} />
                                                {!showUpdateTip && <div className="desktop-item-update" />}
                                            </div>
                                        </div>
                                    </CommonTooltip>
                                )
                                : (
                                    <CommonTooltip
                                        overlay={(<FormattedMessage id={e} />)}
                                        placement="right"
                                        trigger="hover"
                                    >
                                        <div className="desktop-item">
                                            <div className="desktop-item-main">
                                                <div className="desktop-item-boder" />
                                                <SvgIcon icon={e} />
                                            </div>
                                        </div>
                                    </CommonTooltip>
                                )}
                        </div>
                    )
                )}
            </div>
            <div className="desktop-right">
                <Outlet />
            </div>
            <Modal
                cancleText={intl.formatMessage({ id: "Later" })}
                okText={intl.formatMessage({ id: "manageStorage" })}
                onClose={() => {
                    setShowTip1(false)
                }}
                onOk={() => {
                    navigate("setting/storage")
                    setShowTip1(false)
                }}
                title={<FormattedMessage id="diskPopupTitle1" />}
                visible={showTip1}
            >
                <FormattedMessage id="diskPopupContent1" />
            </Modal>
            <Modal
                cancleText={intl.formatMessage({ id: "Later" })}
                okText={intl.formatMessage({ id: "chooseFolder" })}
                onClose={() => {
                    setShowTip2(false)
                }}
                onOk={() => {
                    navigate("setting/storage")
                    setShowTip2(false)
                }}
                title={<FormattedMessage id="diskPopupTitle2" />}
                visible={showTip2}
            >
                <FormattedMessage id="diskPopupContent2" />
            </Modal>
        </>
    )
}

export default App
