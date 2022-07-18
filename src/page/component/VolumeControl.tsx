import "./css/VolumeControl"
import React, { memo, useState, useEffect, useRef, useCallback } from "react"
import SvgIcon from "./SvgIcon"
let isDrag = false

const VolumeControl = (props: {
    value: number,
    onChange: (value: number) => any
}) => {
    const { value, onChange } = props
    const [ volume, setVolume ] = useState(100)
    const [ mute, setMute ] = useState(false)// 是否静音
    const [ cacheVolume, setCacheVolume ] = useState(100)
    const containerRef = useRef(null)

    const drag = useCallback((e: MouseEvent | React.MouseEvent) => {

        if (isDrag && containerRef.current) {
            const currenDom = containerRef.current as HTMLDivElement
            const { width: bodyWidth } = document.body.getBoundingClientRect()
            const clientRect = currenDom.getBoundingClientRect()

            const volume = e.pageX / (
                bodyWidth < 1440
                    ? 1280 / 1440
                    : 1
            ) - clientRect.left
            let value = volume / currenDom.clientWidth * 100

            if (value < 0) value = 0

            if (value > 100) value = 100

            onChange(Math.floor(value))
        }
    }, [ onChange ])
    
    const onMouseDown = useCallback((e: React.MouseEvent) => {
        isDrag = true
        drag(e)

        document.body.onmousemove = (ev: MouseEvent) => {
            drag(ev)
        }
        document.body.onmouseup = () => isDrag = false
        document.body.onmouseleave = () => isDrag = false
    }, [ drag ])
    
    const changeMute = useCallback(() => {
        if (!mute) {
            setCacheVolume(value)
            onChange(0)
        } else {
            onChange(cacheVolume)
        }
        setMute(!mute)
    }, [ onChange, mute, cacheVolume, value ])
    
    useEffect(() => {
        const currenDom = containerRef.current
        let volume: number
 
        if (currenDom) {
            const { clientWidth } = currenDom as HTMLDivElement
            volume = clientWidth * value / 100
            setVolume(volume)
        }
        setMute(value === 0)
    }, [ value ])

    return (
        <div className="volume-control">
            <SvgIcon
                icon={
                    mute
                        ? "mute"
                        : "voice"
                }
                onClick={changeMute}
                size={30}
            />
            <div
                className="volume-control-main"
                onMouseDown={onMouseDown}
                ref={containerRef}
            >
                <div
                    className="volume-control-active"
                    style={
                        { width: `${volume}px` }
                    }
                />
                <div className="volume-control-body" />
            </div>
            <div
                className="volume-control-round"
                style={
                    { left: `${volume + 28}px` }
                }
            />
        </div>
    )
}

export default memo(VolumeControl)
