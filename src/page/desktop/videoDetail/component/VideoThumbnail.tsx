import React, { useState, useEffect, memo, useRef } from "react"
import { getVideoUrl } from "@utils/utils"
import "./VideoThumbnail.scss"
import HorizontalScrollCard, { HorizontalScrollCardRef } from "@component/HorizontalScrollCard"

export const Thumbnail = memo((props: {
    className?: string,
    videoUrl?: string,
    overwolfPath?: string,
    currentTime?: number,
    onClick?: (currentTime: number) => void,
    getPlayerDom?: (player: HTMLVideoElement) => void
}) => {
    const { currentTime = 0, videoUrl, overwolfPath, className, getPlayerDom: callBack, onClick } = props
    const videoRef = useRef<HTMLVideoElement>(null)
    
    useEffect(() => {
        const { current: videoDom } = videoRef

        if (videoDom) {
            videoDom.currentTime = currentTime
            callBack && callBack(videoDom)
        }

    }, [ videoRef, currentTime, callBack ])

    return (
        <video
            className={className}
            muted
            onClick={() => onClick && onClick(currentTime)}
            preload="metadata"
            ref={videoRef}
            src={getVideoUrl({
                filePath: videoUrl,
                overwolfPath
            })}
        />
    )
})
 
export const VideoThumbnail = memo((props: {
    videoUrl?: string,
    overwolfPath?: string,
    videoDuration: number,
    currentTime: number,
    disabled?: boolean,
    callBack: (currentTime: number) => void
}) => {
    const { videoUrl, overwolfPath, callBack, videoDuration, currentTime, disabled } = props
    const horizontalRef = useRef<HorizontalScrollCardRef>(null)
    const [ currentTimes, setCurrentTimes ] = useState<number[]>([])

    useEffect(() => {
        const count = 8
        const currentTimes = []

        if (videoDuration) {
            const diff = Math.floor(videoDuration / count)
            let currentTime = 0

            for (let i = 0; i < count; i++) {
                currentTimes.push(currentTime)
                currentTime += diff
            }
            setCurrentTimes(currentTimes)
        }
    }, [ videoUrl, videoDuration ])

    return (
        <div className="video-thumbnail">
            <HorizontalScrollCard
                key={videoUrl}
                options={currentTimes.map((e) => ({ key: e }))}
                ref={horizontalRef}
            >
                {
                    (e) =>
                        (
                            <div className="video-thumbnail-item">
                                {e.key === currentTime && <div className="video-thumbnail-active" />}
                                <Thumbnail
                                    currentTime={e.key}
                                    onClick={(currentTime) => {
                                        if (!disabled) callBack(currentTime)
                                    }}
                                    overwolfPath={overwolfPath}
                                    videoUrl={videoUrl}
                                />
                            </div>
                        )
                }
            </HorizontalScrollCard>
        </div> 
    )
})
