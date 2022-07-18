import React, { useState, useCallback, KeyboardEvent, useLayoutEffect, useMemo } from "react"
import { FormattedMessage, useIntl } from "react-intl"
import { gamesConfigs } from "@config/gamesConfigs"
import { useSelector, useDispatch } from "react-redux"
import { setOverwolfHotkeys } from "@utils/overwolfUtils"
import { RootState, AppDispatch } from "../../redux/store"
import Hotkey from "@component/Hotkey"
import { setIsChangeSetting, getHotkeys } from "../../redux/main"
import { getGamestatus } from "../../redux/request"
import useSetting from "../setSetting"
import Message from "@component/Message"
import Button from "@component/Button"
import Input from "@component/Input"
import Switch from "@component/Switch"
import Checkbox from "@component/Checkbox"
import CommonTooltip from "@component/CommonTooltip"
import defaultHotKeys from "@config/defaultHotKeys"
import SvgIcon from "@component/SvgIcon"

const Tips = () => {
    return (
        <CommonTooltip
            align={
                {
                    offset: [ 0, 15 ]
                }
            }
            overlay={(<FormattedMessage id="settingExplain9" />)}
            placement="rightTop"
            trigger="hover"
        >
            <SvgIcon icon="info" />
        </CommonTooltip>
    )
}

const GameStatus = (state: 1 | 2 | 3) => {
    switch (state) {
    case 1:
        return <FormattedMessage id="goodgo" />
    case 2:
        return <FormattedMessage id="partialfunctionality" />
    case 3:
        return <FormattedMessage id="eventsdowntemporarily" />
    default:
        return <FormattedMessage id="goodgo" />
    }

}

const MyGames = () => {

    const dispatch = useDispatch<AppDispatch>()
    const intl = useIntl()
    const setSetting = useSetting()
    const { main: { hotkeys, settingConfig, isChangeSetting }, request: { gamestatus } } = useSelector((state: RootState) => state)

    const games = useMemo(() => gamesConfigs.filter((v) => !v.disabled).map((e) => ({ ...e, state: gamestatus.find((j) => j.game_id === e.gameId)?.state || 1 })), [ gamestatus ])
    const cacheSettingConfig = useMemo(() => JSON.parse(JSON.stringify(settingConfig)), [ settingConfig ]) as SettingConfig
    const [ currentGame, setCurrentGame ] = useState(games[0])
    const currentGameSetting = useMemo(() => cacheSettingConfig?.gameSettings.find((e) => e.gameId === currentGame.gameId), [ cacheSettingConfig, currentGame ])
    const [ nowHotkeys, setNowHotkeys ] = useState<hotKeyItem[]>(defaultHotKeys)
    const [ manualBeforTime, setManualBeforTime ] = useState(currentGameSetting?.manualBeforTime ?? 10)
    const [ manualAfterTime, setManualAfterTime ] = useState(currentGameSetting?.manualAfterTime ?? 10)
    const [ autoBeforTime, setAutoBeforTime ] = useState(currentGameSetting?.autoBeforTime ?? 10)
    const [ autoAfterTime, setAutoAfterTime ] = useState(currentGameSetting?.autoAfterTime ?? 10)
    const [ autoRecordEvents, setAutoRecordEvents ] = useState(!!currentGameSetting?.autoRecordEvents)
    const [ currentEvents, setCurrentEvents ] = useState<GameEvent[]>(currentGameSetting?.events || [])
    const [ gameSettingsChangedValues, setGameSettingsChangedValues ] = useState<number[]>([])
    const [ gameSelectVisible, setGameSelectVisible ] = useState(false)
    useLayoutEffect(() => {
        dispatch(getGamestatus())
    }, [ dispatch ])
    useLayoutEffect(() => {
        if (hotkeys) {
            const newHotkeys = defaultHotKeys.map((e) => {
                const global = hotkeys?.globals?.find((v) => v.name === e.name)
                const item = hotkeys?.games?.[currentGame.gameId]?.find((v) => v.name === e.name)

                return { ...e, ...global, ...item }
            })
            setNowHotkeys(newHotkeys)
        }
    }, [ hotkeys, currentGame ])
    
    useLayoutEffect(() => {
        if (cacheSettingConfig) {
            const currentEvents: GameEvent[] = currentGameSetting?.events || []

            if (currentGameSetting) {
                setManualBeforTime(currentGameSetting.manualBeforTime ?? 10)
                setManualAfterTime(currentGameSetting.manualAfterTime ?? 10)
                setAutoBeforTime(currentGameSetting.autoBeforTime ?? 10)
                setAutoAfterTime(currentGameSetting.autoAfterTime ?? 10)
                setAutoRecordEvents(!!currentGameSetting.autoRecordEvents)
            }
            setCurrentEvents(currentEvents)
        }
    }, [ currentGame, cacheSettingConfig, currentGameSetting ])

    const changeGameSettingsChangedValues = useCallback(
        () => {
            if (currentGameSetting?.gameId) gameSettingsChangedValues.push(currentGameSetting.gameId)
            setGameSettingsChangedValues(gameSettingsChangedValues)
            dispatch(setIsChangeSetting(true))
        },
        [ dispatch, gameSettingsChangedValues, currentGameSetting ]
    )

    const hotkeyChange = useCallback(
        (key: string, event: KeyboardEvent<HTMLInputElement> | undefined, e: hotKeyItem) => {   
            const newHotkeys = nowHotkeys.map((v) => {
                if (v.name === e.name) {
                    if (event?.keyCode) v.virtualKey = event?.keyCode
                    v.gameId = currentGame.gameId
                    v.binding = key
                    v.modifiers = {
                        ctrl: event?.ctrlKey,
                        alt: event?.altKey,
                        shift: event?.shiftKey
                    }
                }

                return v
            })
            changeGameSettingsChangedValues()
            setNowHotkeys(newHotkeys)
        }, [ nowHotkeys, changeGameSettingsChangedValues, currentGame ])

    const eventChange = useCallback((e: GameEvent) => {
        e.enable = !e.enable
        setCurrentEvents(JSON.parse(JSON.stringify(currentEvents)))
        changeGameSettingsChangedValues()
    }, [ currentEvents, changeGameSettingsChangedValues ])

    const saveChanges = useCallback(async () => {
            
        const realHotkeys = nowHotkeys.filter((e) => e?.modifiers?.alt !== undefined)
        const totalAutoTime = autoAfterTime + autoBeforTime
        const totalManualTime = manualAfterTime + manualBeforTime

        if (!currentEvents.filter((v) => v.enable).length && autoRecordEvents) return Message.error(intl.formatMessage({ id: "settingTip5" }))

        if (totalAutoTime > 60 || totalAutoTime < 5 || totalManualTime > 60 || totalManualTime < 5) {
            return Message.error(intl.formatMessage({ id: "settingTip4" }))
        }

        for (let i = 0; i < realHotkeys.length; i++) {
            const v = realHotkeys[i]

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

        if (cacheSettingConfig) {
            const currentGameSetting = cacheSettingConfig.gameSettings.find((e) => e.gameId === currentGame.gameId)

            if (currentGameSetting) {
                currentGameSetting.events = currentEvents
                currentGameSetting.autoAfterTime = autoAfterTime
                currentGameSetting.autoBeforTime = autoBeforTime
                currentGameSetting.autoRecordEvents = autoRecordEvents
                currentGameSetting.manualAfterTime = manualAfterTime
                currentGameSetting.manualBeforTime = manualBeforTime
            }
            setSetting(cacheSettingConfig, "game_settings_changed", false, gameSettingsChangedValues)
                .then(() => {
                    dispatch(getHotkeys())
                    setGameSettingsChangedValues([])
                    Message.success(intl.formatMessage({ id: "saveSuccessTip" }))
                })
        }

    }, [
        nowHotkeys,
        dispatch,
        intl,
        cacheSettingConfig,
        autoAfterTime,
        autoBeforTime,
        autoRecordEvents,
        manualAfterTime,
        manualBeforTime,
        currentGame,
        currentEvents,
        setSetting,
        gameSettingsChangedValues
    ])

    return (
        <div className="setting-content">
            <div className="setting-content-title">
                <FormattedMessage id="games" />
            </div>
            <div className="setting-games-select">
                <CommonTooltip
                    align={
                        {
                            offset: [ 0, 12 ]
                        }
                    }
                    mainClass="setting-games-cur-main"
                    onVisibleChange={setGameSelectVisible}
                    overlay={(
                        <div className="setting-games-cur-body">
                            {games.map((e) => (
                                <div
                                    className="setting-games-item"
                                    key={e.gameId}
                                    onClick={() => {
                                        setCurrentGame(e)
                                        setGameSelectVisible(false)
                                    }}
                                >
                                    <div className="setting-games-item-l">
                                        <img
                                            className="setting-games-img"
                                            draggable={false}
                                            src={e.iconUrl}
                                        />
                                        {e.name} 
                                    </div>
                                    <CommonTooltip
                                        align={
                                            {
                                                offset: [ -10, 0 ]
                                            }
                                        }
                                        mainClass="setting-games-status-main"
                                        overlay={GameStatus(e.state)}
                                        placement="left"
                                        trigger="hover"
                                    >
                                        <span className={`setting-games-status setting-games-status-${e.state}`} />
                                    </CommonTooltip>
                                </div>
                            )) }
                        </div>
                    )}
                    overlayClassName="setting-games-overlay"
                    placement="bottom"
                    trigger="click"
                    visible={gameSelectVisible}
                >
                    <div className="setting-games-cur">
                        <div>
                            <img
                                className="setting-games-img"
                                draggable={false}
                                src={currentGame.iconUrl}
                            />
                            {currentGame.name} 
                        </div>
                        <SvgIcon icon="down" />
                    </div>
                </CommonTooltip>
            </div>
            {currentGame.note && (
                <div className="setting-content-note">
                    <FormattedMessage id={currentGame.note} />
                </div>
            )}
            <div className="setting-content-title">
                <FormattedMessage id="settingTitle2" />
                <Tips />
            </div>
            {
                nowHotkeys?.map((e) => 
                    (
                        <div className="setting-content-item" key={e.name}>
                            {e.title}
                            <Hotkey
                                className="setting-hotkeys"
                                onChange={(key, event) => hotkeyChange(key, event, e)}
                                value={e.binding}
                            />
                        </div>
                    )
                )
            }
            <div className="setting-content-item">
                <FormattedMessage id="settingExplain5" />
                <div>
                    <FormattedMessage id="secs" />
                    <Input
                        className="setting-hotkeys"
                        max={60}
                        min={0}
                        onChange={(val) => {
                            changeGameSettingsChangedValues()
                            setManualBeforTime(val)
                        }}
                        type="number"
                        value={manualBeforTime}
                    />
                </div>
            </div>
            <div className="setting-content-item">
                <FormattedMessage id="settingExplain6" />
                <div>
                    <FormattedMessage id="secs" />
                    <Input
                        className="setting-hotkeys"
                        max={60}
                        min={0}
                        onChange={
                            (val) => {
                                changeGameSettingsChangedValues()
                                setManualAfterTime(val)
                            }
                        }
                        type="number"
                        value={manualAfterTime}
                    />
                </div>
            </div>
            <div className="setting-content-title">
                <FormattedMessage id="settingTitle3" />
                <Tips />
            </div>
            <div className="setting-content-item">
                <FormattedMessage id="settingExplain7" />
                <Switch
                    checked={autoRecordEvents}
                    onChange={(check) => {
                        changeGameSettingsChangedValues()
                        setAutoRecordEvents(check)
                    }}
                />
            </div>
    
            <div className="setting-content-item">
                <FormattedMessage id="settingExplain5" />
                <div>
                    <FormattedMessage id="secs" />
                    <Input
                        className="setting-hotkeys"
                        max={60}
                        min={0}
                        onChange={
                            (val) => {
                                changeGameSettingsChangedValues()
                                setAutoBeforTime(val)
                            }
                        }
                        type="number"
                        value={autoBeforTime}
                    />
                </div>
            </div>
            <div className="setting-content-item">
                <FormattedMessage id="settingExplain6" />
                <div>
                    <FormattedMessage id="secs" />
                    <Input
                        className="setting-hotkeys"
                        max={60}
                        min={0}
                        onChange={
                            (val) => {
                                changeGameSettingsChangedValues()
                                setAutoAfterTime(val)
                            }
                        }
                        type="number"
                        value={autoAfterTime}
                    />
                </div>
            </div>
            <div className="setting-content-item">
                <FormattedMessage id="settingExplain8" />
            </div>
            {
                autoRecordEvents && currentEvents.map((e) => (
                    <div
                        className="setting-content-event"
                        key={e.key}
                        onClick={() => eventChange(e)}
                    >
                        <FormattedMessage id={e.formattedMessage} />
                        <Checkbox checked={e.enable} />
                    </div>
                ))
            }
            <Button
                className="setting-content-save"
                disable={!isChangeSetting}
                onClick={saveChanges}
                theme="yellow"
            >
                <FormattedMessage id="saveChanges" />
            </Button>
        </div>
    )
}

export default MyGames