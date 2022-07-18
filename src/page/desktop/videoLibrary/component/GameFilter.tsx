import "./css/GameFilter"
import React, { useState, useCallback, useEffect } from "react"
import { FormattedMessage } from "react-intl"
import SvgIcon from "@component/SvgIcon"
import CommonTooltip from "@component/CommonTooltip"
import SearchInput from "@component/SearchInput"
import Checkbox from "@component/Checkbox"
import { useLocation } from "react-router-dom"

export interface GameFilterCheck extends GamesConfig{
    checked: boolean
}

const GameFilter = (props: {
    selectGames: GameFilterCheck[],
    onChange: (val: GameFilterCheck[]) => any
}) => {
    const location = useLocation()
    const { selectGames, onChange } = props
    const [ visible, setVisible ] = useState(false)
    const [ searchValue, setSearchValue ] = useState("")
    const [ allGameCheck, setAllGameCheck ] = useState(true)

    const changeAllSelect = useCallback(
        (isCheck = allGameCheck) => {
            const newSelectGames = selectGames.map((e) => {
                e.checked = !isCheck

                return e
            })
            onChange(newSelectGames)
        },
        [ selectGames, onChange, allGameCheck ]
    )

    const changeItemSelect = useCallback(
        ({ gameId, checked }: { gameId: number, checked: boolean }) => {
            const newSelectGames = selectGames.map((e) => {
                if (e.gameId === gameId) e.checked = !checked

                return e
            })
            onChange(newSelectGames)
        },
        [ selectGames, onChange ]
    )

    useEffect(() => {
        setAllGameCheck(!selectGames.find((e) => !e.checked))
    }, [ selectGames ])
    
    useEffect(() => {
        setSearchValue("")
        setAllGameCheck(true)
        changeAllSelect(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ location ])

    return (
        <CommonTooltip
            align={
                {
                    offset: [ 0, 12 ]
                }
            }
            mainClass="game-filter"
            onVisibleChange={setVisible}
            overlay={(
                <div className="game-filter-main">
                    <div className="game-filter-header" onClick={() => setVisible(false)}>
                        <FormattedMessage id="filters" />
                        <SvgIcon icon="up" size={30} />
                    </div>
                    <div className="game-filter-search">
                        <SearchInput
                            onChange={setSearchValue}
                            value={searchValue}
                        />
                    </div>
                    <div className="game-filter-body">
                        {!searchValue && (
                            <div className="game-filter-item" onClick={() => changeAllSelect(allGameCheck)}>
                                <FormattedMessage id="allGames" />
                                <Checkbox checked={allGameCheck} />
                            </div>
                        )}
                        {selectGames.filter((v) => v?.name?.toUpperCase().includes(searchValue.toUpperCase())).map((e) => (
                            <div
                                className="game-filter-item"
                                key={e.gameId}
                                onClick={() => changeItemSelect(e)}
                            >
                                <div>
                                    <img src={e.iconUrl} />
                                    {e.name}
                                </div>
                                <Checkbox checked={e.checked} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
            placement="bottomRight"
            trigger="click"
            visible={visible}
        >
            <div
                className="video-library-search-more"
            >
                <SvgIcon icon="filter" />
                {selectGames.find((e) => !e.checked)
                    ? <div className="game-filter-active" />
                    : ""}
            </div>
        </CommonTooltip>
    )
}

export default GameFilter
