
import React, { useState, useEffect, KeyboardEvent, useCallback } from "react"
import { FormattedMessage, useIntl } from "react-intl"
import Button from "@component/Button"
import { Link, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "../redux/store"
import Hotkey from "@component/Hotkey"
import defaultHotKeys from "@config/defaultHotKeys"
import { setOverwolfHotkeys } from "@utils/overwolfUtils"
import { getHotkeys } from "../redux/main"
import Message from "@component/Message"
import { gamesConfigs } from "@config/gamesConfigs"

const Step2 = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const intl = useIntl()
    const hotkeys = useSelector((state: RootState) => state.main.hotkeys)
    const [ nowHotkeys, setNowHotkeys ] = useState<hotKeyItem[]>(defaultHotKeys)

    const hotkeyChange = useCallback(
        (key: string, event: KeyboardEvent<HTMLInputElement> | undefined, e: hotKeyItem) => {
            const newHotkeys = nowHotkeys.map((v) => {
                if (v.name === e.name) {
                    if (event?.keyCode) v.virtualKey = event?.keyCode
                    v.binding = key
                    v.modifiers = {
                        ctrl: event?.ctrlKey,
                        alt: event?.altKey,
                        shift: event?.shiftKey
                    }
                }

                return v
            })
            setNowHotkeys(newHotkeys)
        },
        [ nowHotkeys ]
    )

    const nextStep = useCallback(async () => {
  
        const realHotkeys = nowHotkeys.filter((e) => e?.modifiers?.alt !== undefined)

        for await (const k of gamesConfigs.filter((e) => !e.disabled)) {
    
            for await (const v of realHotkeys) {
                v.gameId = k.gameId

                if (!v.binding) return Message.error(intl.formatMessage({ id: "settingTip2" }))
    
                try {
                    await setOverwolfHotkeys(v)
                        
                } catch (error) {
                    Message.error(intl.formatMessage({ id: "settingTip1" }))
                    console.log(error)
                    dispatch(getHotkeys())
        
                    return
                }
            }
        }

        dispatch(getHotkeys())
        navigate("/step3")
    }, [ navigate, dispatch, nowHotkeys, intl ])
    
    useEffect(() => {
        if (hotkeys?.globals?.length) {
            const newHotkeys = defaultHotKeys.map((e) => {
                const item = hotkeys.globals.find((v) => v.name === e.name)

                return { ...e, ...item }
            })
            setNowHotkeys(newHotkeys)
        }
    }, [ hotkeys ])

    return (
        <div className="step2">
            <div className="step2-content">
                <div className="step2-title">
                    <FormattedMessage id="step2Title" />
                </div>
                <div className="step2-explain">
                    <FormattedMessage id="explain6" />
                </div>
                {
                    nowHotkeys?.map((e) => 
                        (
                            <div className="step2-hotkey" key={e.title}>
                                <span className="step2-hotkey-title">
                                    {e.title}
                                </span>
                                <Hotkey
                                    className="step2-hotkey-key"
                                    onChange={(key, event) => hotkeyChange(key, event, e)}
                                    value={e.binding}
                                />
                            </div>
                        )
                    )
                }
            </div>
            <div className="guide-footer">
                <Link to="/">
                    <Button>
                        <FormattedMessage id="back" />
                    </Button>
                </Link>
                <Button onClick={nextStep} theme="yellow">
                    <FormattedMessage id="next" />
                </Button>
            </div>
        </div>
    )
}

export default Step2
