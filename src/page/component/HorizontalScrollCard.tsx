import "./css/HorizontalScrollCard"
import React, {
    memo,
    ReactNode,
    useEffect,
    useRef,
    useState,
    useCallback,
    useImperativeHandle,
    forwardRef,
    ForwardedRef,
    MouseEvent as MEvent
} from "react"

export type HorizontalScrollCardRef = {
    changeLeft: (i: number) => void 
}
let isDrag = false

const HorizontalScrollCard: <T extends { key: number | string }>(
    props: {
        options: T[],
        children: (item: T, i: number) => ReactNode,
        afterDom?: ReactNode,
        maskDom?: ReactNode
    },
    ref?: ForwardedRef<HorizontalScrollCardRef>
) => JSX.Element = (props, ref) => {
    const { options, children, afterDom, maskDom } = props
    const mainRef = useRef<HTMLDivElement>(null)
    const refBody = useRef<HTMLDivElement>(null)
    const [ left, setLeft ] = useState(0)
    const [ startX, setStartX ] = useState(0)
    const [ maxLeft, setMaxLeft ] = useState(0)

    const onMouseMove = useCallback(
        (e: MouseEvent) => {
            if (isDrag && refBody.current && mainRef.current) {
                const { width: bodyWidth } = document.body.getBoundingClientRect()

                let currentLeft = left - (e.clientX - startX) / (
                    bodyWidth < 1440
                        ? 1280 / 1440
                        : 1
                )
                
                if (currentLeft > maxLeft) currentLeft = maxLeft
                
                if (currentLeft < 0) currentLeft = 0
                
                setLeft(currentLeft)
                setStartX(e.clientX)
            }
        },
        [ startX, left, refBody, maxLeft, mainRef ]
    )

    const onMouseUp = useCallback(
        () => {
            setStartX(0)
            isDrag = false
        },
        []
    )

    const onMouseDown = useCallback(
        (e: MEvent<HTMLDivElement, MouseEvent>) => {
            setStartX(e.clientX)
            isDrag = true
        },
        []
    )
    useEffect(() => {
        document.addEventListener("mouseup", onMouseUp)
        document.addEventListener("mousemove", onMouseMove)

        return () => {
            document.removeEventListener("mouseup", onMouseUp)
            document.removeEventListener("mousemove", onMouseMove)
        }
    }, [ onMouseMove, onMouseUp ])
    
    useEffect(() => {
        if (refBody.current && mainRef.current) {
            const maxLeft = refBody.current.getBoundingClientRect().width - mainRef.current.getBoundingClientRect().width
            setMaxLeft(maxLeft)
        }
    }, [ options ])
    useImperativeHandle(ref, () => {
        return {
            changeLeft: (i) => {
                let currentLeft = i * 122

                if (currentLeft > maxLeft) currentLeft = maxLeft
                setLeft(currentLeft)
            }
        }    
    }
    )

    return (
        <div className="horizontal-scroll-card">
            <div
                className="horizontal-scroll-main"
                ref={mainRef}
            >
                <div
                    className="horizontal-scroll-body"
                    onMouseDown={onMouseDown}
                    ref={refBody}
                    style={{
                        left: `${-left}px`
                    }}
                >
                    {
                        options.map((e, i) => (
                            <div
                                className="horizontal-scroll-item"
                                key={e.key}
                            >
                                
                                {
                                    children(e, i)
                                }
                            </div>
                        ))
                    }
                </div>
                {maxLeft !== left && maskDom}
            </div>
            {afterDom}
        </div>
    )
}

export default memo(forwardRef(HorizontalScrollCard)) as <T extends { key: number | string }>(
    props: {
        options: T[],
        children: (item: T, i: number) => ReactNode,
        afterDom?: ReactNode,
        maskDom?: ReactNode,
        ref?: ForwardedRef<HorizontalScrollCardRef>
    },
) => JSX.Element
