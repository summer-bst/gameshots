import React, { memo } from "react"
import animationData from "@assets/animation.json"
import { Player } from "@lottiefiles/react-lottie-player"

const CommonLoading = () => {
    return (
        <Player
            autoplay
            background="transparent"
            loop
            src={animationData}
            style={{ width: "113px", height: "113px" }}
        />
    )
}

export default memo(CommonLoading)