import React, { useEffect, useState } from "react"
import Button from "@component/Button"
import { useDispatch } from "react-redux"
// import { RootState } from "../redux/store"
import { useNavigate } from "react-router-dom"
import { changeEnterStatus } from "../redux/main"
// import Message from "@component/Message"
import { openWindowsExplorer, getOverwolfVideosFolder, getStoragePath /* getPlugins */ /* moveFileOrDir, */ /* createDirectory  *//* deleteFileOrDir */ } from "@utils/overwolfUtils"
// import axios from "axios"

const Home = () => {
    const [ url, setUrl ] = useState("")
    const [ url1, setUrl1 ] = useState("")
    const navigate = useNavigate()
    const dispatch = useDispatch()
    // const { isFirstEnter, routerPath } = useSelector((state: RootState) => state.main)
    useEffect(() => {
        getOverwolfVideosFolder().then((url) => {
            console.log("videourl", url)
            
            setUrl(url)
        })
        getStoragePath().then((url) => {
            setUrl1(url)
        })
        // overwolf.streaming.getAudioDevices((res) => console.log(6666, res))
        // overwolf.utils.getSystemInformation((res) => console.log(1111, res))
        // overwolf.media.videos.getVideos((res) => console.log(222222222, res))
        // console.log(4555, moment().format("MMM DD"))
        
    }, [])

    const goguide = () => {
        dispatch(changeEnterStatus(true))
        navigate("/")
    }

    const openLogFolder = () => {
        openWindowsExplorer(`${overwolf.io.paths.localAppData}\\Overwolf\\Log\\Apps\\Gameshots`)
    }

    // const moveFileOrDir11 = () => {
    //     // overwolf.profile.getCurrentUser((res) => console.log(5555, res))
    //     overwolf.profile.openLoginDialog()
    // }
    const test = async () => {
        // overwolf.extensions.current.getExtraObject("bluestacks-io-plugin", (result) => {
        //     console.log(444, result)
        //     const a = result.object.GetHardDiskFreeSpace("c")
        //     console.log(55, a)
            
        //     // result.object.SetOverwolfFFMPEGPath(overwolf.io.paths.obsBin, (s: any, t: any) => {
        //     //     console.log(2123, s, t)
                
        //     //     result.object.GenerateThumbnail(
        //     //         "C:\\Users\\50524\\Videos\\Overwolf\\Gameshots\\Session7\\Clip1.mp4",
        //     //         "C:\\Users\\50524\\Videos\\Overwolf\\Gameshots\\Session7\\2333.jpg",
        //     //         380,
        //     //         (res: any, a: any) => {
        //     //             console.log(5555555, res, a)
                    
        //     //         })
        //     // })
        // })
        // overwolf.log.info("22222222")
        // const Plugin = await getProcessManagerPlugin()
        // console.log(4444, Plugin)
        // Plugin.onProcessExited.addListener((res: any) => {
        //     console.log(55555555555555, res)
        
        // })
        // Plugin.launchProcess(`${overwolf.io.paths.obsBin}\\ffmpeg.exe`, 
        //     "-i C:\\Users\\黄炜雄\\Videos\\Overwolf\\Gameshots\\Session109\\Clip1.mp4 -c:v libx264 -b:v 4M -x264-params keyint=24:bframes=2 C:\\Users\\黄炜雄\\Videos\\Overwolf\\Gameshots\\Session109\\aaaa.mp4", 
        //     JSON.stringify({}), 
        //     true, 
        //     false, // if we close the app, don't close notepad
        //     ({ error, data }: any) => {
        //         if (error) {
        //             console.error(22222, error)
        //         }

        //         if (data) {
        //             console.log(111111111111111, data)
        //         }
        //     })

    }

    return (
        <div>
            <Button onClick={() => openWindowsExplorer(url)}>openWindowsExplorer</Button>
            <Button onClick={() => openWindowsExplorer(url1)}>opencache</Button>
            <Button onClick={() => goguide()}>goguide</Button>
            <Button onClick={() => openLogFolder()}>openLogFolder</Button>
            <Button onClick={() => test()}>test</Button>
            {/* <button onClick={() => turnOn()}>turnOn</button>
            <button onClick={() => turnOff()}>turnOff</button>
            <button onClick={() => capture()}>capture</button> */}
            
            {/* <iframe
                frameBorder="0"
                src={"https://overwolf.github.io/"}
            /> */}
        </div>
    )
}

export default Home
