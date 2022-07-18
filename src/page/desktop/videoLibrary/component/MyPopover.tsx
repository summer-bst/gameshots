import React, { useState } from "react"
import { FormattedMessage } from "react-intl"
import SvgIcon from "@component/SvgIcon"
import CommonTooltip from "@component/CommonTooltip"

const MyPopover = (props: {
    item: VideoCacheData,
    callBack: (type: string, item: VideoCacheData) => void
}) => {
    const { item, callBack } = props
    const [ visible, setVisible ] = useState(false)

    return (
        <CommonTooltip
            align={
                {
                    offset: [ -12, 2 ]
                }
            }
            onVisibleChange={setVisible}
            overlay={(
                <div className="video-list-item-popover-content">
                    <div
                        className="video-list-item-popover-text"
                        onClick={() => {
                            setVisible(false)
                            callBack("changeFavorite", item)
                        }}
                    >
                        { item.isFavorite
                            ? <FormattedMessage id="removeFavorite" />
                            : <FormattedMessage id="markFavorite" />}
                    </div>
                    <div className="video-list-item-popover-line" />
                    <div
                        className="video-list-item-popover-text"
                        onClick={() => {
                            setVisible(false)
                            callBack("rename", item)
                        }}
                    >
                        <FormattedMessage id="renameSession" />
                    </div>
                    <div className="video-list-item-popover-line" />
                    <div
                        className="video-list-item-popover-text"
                        onClick={() => {
                            setVisible(false)
                            callBack("delete", item)
                        }}
                    >
                        <FormattedMessage id="deleteSession" />
                    </div>
                </div>
            )}
            placement="rightBottom"
            trigger="click"
            visible={visible}
        >
            <div className="video-list-item-right-icon" onClick={() => setVisible(true)}>
                <SvgIcon icon="menuVertical" />
            </div>
        </CommonTooltip>
    )
}

export default MyPopover
