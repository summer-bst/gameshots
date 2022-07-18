// import "./index.scss"
// import React, { useEffect, useState, useCallback } from "react"
// import { FormattedMessage, useIntl } from "react-intl"
// import { writeFileContents, deleteFileOrDir, moveFileOrDir } from "@utils/overwolfUtils"
// import { VideoCacheFileName, AppName, AppFavoriteName } from "@config/baseConfig"
// import { Input } from "antd"
// import { Routes, Route } from "react-router-dom"
// import { useDispatch, useSelector } from "react-redux"
// import { getVideoCacheData, setVideoCache } from "../redux/main"
// import { RootState } from "../redux/store"
// import Message from "@component/Message"
// import Modal from "@component/Modal"
// import HorizontalMenu from "@component/HorizontalMenu"
// import SvgIcon from "@component/SvgIcon"
// import SearchInput from "@component/SearchInput"
// import CommonTooltip from "@component/CommonTooltip"
// import VideoListTemplet from "./VideoListTemplet"
// import CommonLoading from "@component/CommonLoading"
// import MessageReceivedEvent= overwolf.windows.MessageReceivedEvent

// const menuTabs = [
//     {
//         key: "/videoLibrary",
//         content: <FormattedMessage id="mySessions" />
//     },
//     {
//         key: "favorites",
//         content: <FormattedMessage id="favorites" />
//     }
// ]

// const VideoLibrary = () => {
//     const intl = useIntl()
//     const dispatch = useDispatch()
//     const [ searchValue, setSearchValue ] = useState<string>("")
//     const [ isShort, setIsShort ] = useState<boolean>(false)
//     // 操作选中的数据块
//     const [ selectData, setSelectData ] = useState<VideoCacheData>()
//     const [ renameValue, setRenameValue ] = useState<string>("")
//     // 以下弹框的设置
//     const [ deleteVisible, setDeleteVisible ] = useState<boolean>(false)
//     const [ renameVisible, setRenameVisible ] = useState<boolean>(false)
//     const { videoCache, videoFolderPath } = useSelector((state: RootState) => state.main)
//     const [ loading, setloading ] = useState(false)
//     useEffect(() => {
//         const getData = (message: MessageReceivedEvent) => {
//             if (message.id === "restData") {
//                 dispatch(getVideoCacheData())
//             }
//         }
//         overwolf.windows.onMessageReceived.addListener(getData)
//         dispatch(getVideoCacheData())

//         return () => {
//             overwolf.windows.onMessageReceived.removeListener(getData)
//         }
//     }, [ dispatch ])

//     const callBack = async (type: string, item: VideoCacheData) => {
//         setSelectData(item)

//         switch (type) {
//         case "delete":
//             setDeleteVisible(true)
//             break
//         case "rename":
//             setRenameValue("")
//             setRenameVisible(true)
//             break
//         case "changeFavorite":
//             setloading(true)
//             const newVideoCache = JSON.parse(JSON.stringify(videoCache)) as VideoCache
//             const itemData = newVideoCache?.data.find((e) => e.time === item?.time)

//             if (itemData) {
//                 itemData.isFavorite = !itemData.isFavorite
//                 itemData.clips.forEach((e) => {
//                     e.isFavorite = itemData.isFavorite 
//                 })

//                 const folderName = itemData.isFavorite
//                     ? AppFavoriteName
//                     : AppName

//                 const destPath = `${videoFolderPath}\\${folderName}\\${itemData.folderName}`

//                 try {
//                     await moveFileOrDir(itemData.folderPath, destPath)
//                     itemData.folderPath = destPath
//                     itemData.clips.forEach((e) => {
//                         e.filePath = `${itemData.folderPath}\\${e.fileName}.mp4`
//                         e.overwolfPath = `overwolf://media/replays/${folderName}/${itemData.folderName}/${e.fileName}.mp4`
//                     })
//                 } catch (error) {
//                     setloading(false)

//                     return Message.error(intl.formatMessage({ id: "tip18" }))
//                 }
//             }
                
//             await writeFileContents(VideoCacheFileName, JSON.stringify(newVideoCache))

//             if (newVideoCache) dispatch(setVideoCache(newVideoCache))
//             Message.success(
//                 selectData?.isFavorite
//                     ? intl.formatMessage({ id: "tip6" })
//                     : intl.formatMessage({ id: "tip7" })
//             )
//             setloading(false)
//             break
//         default:
//             break
//         }
//     }

//     const rename = useCallback(
//         async () => {
//             // 相同文件名返回
//             setloading(true)

//             if (!renameValue || videoCache?.data.find((e) => e.folderName === renameValue)) {
//                 return Message.error(intl.formatMessage({ id: "tip15" }))
//             }

//             if (selectData) {
//                 const newVideoCache = JSON.parse(JSON.stringify(videoCache)) as VideoCache
//                 const itemData = newVideoCache?.data.find((e) => e.time === selectData?.time)

//                 if (itemData) {
//                     const folderName = itemData.isFavorite
//                         ? AppFavoriteName
//                         : AppName
//                     itemData.folderName = renameValue
//                     itemData.folderPath = `${videoFolderPath}\\${folderName}\\${renameValue}` 
//                     itemData.clips.forEach((e) => {
//                         e.filePath = `${itemData.folderPath}\\${e.fileName}.mp4`
//                         e.overwolfPath = `overwolf://media/replays/${AppName}/${renameValue}/${e.fileName}.mp4`
//                     })

//                     try {
//                         await moveFileOrDir(selectData.folderPath, itemData.folderPath)
//                     } catch (error) {
//                         setloading(false)

//                         return Message.error(intl.formatMessage({ id: "tip18" }))
//                     }
//                 }
                    
//                 await writeFileContents(VideoCacheFileName, JSON.stringify(newVideoCache))

//                 if (newVideoCache) dispatch(setVideoCache(newVideoCache))
//                 Message.success(intl.formatMessage({ id: "tip5" }))
//                 setRenameVisible(false)
//                 setloading(false)
//             }
//         },
//         [ dispatch, intl, renameValue, selectData, videoCache, videoFolderPath ]
//     )

//     const deleteVideo = useCallback(async () => {
//         if (selectData?.folderPath) await deleteFileOrDir(selectData.folderPath)
//         const newVideoCache = JSON.parse(JSON.stringify(videoCache)) as VideoCache
    
//         if (newVideoCache?.data)newVideoCache.data = newVideoCache?.data.filter((e) => e.folderPath !== selectData?.folderPath)
                            
//         await writeFileContents(VideoCacheFileName, JSON.stringify(newVideoCache))
    
//         if (newVideoCache) dispatch(setVideoCache(newVideoCache))
//         Message.warn(intl.formatMessage({ id: "tip10" }))
//         setDeleteVisible(false)
//     }, [ dispatch, intl, selectData, videoCache ])

//     if (loading) return (
//         <div className="video-nodata">
//             <CommonLoading />
//         </div>
//     )

//     if (!videoCache) return <div />

//     if (!videoCache?.data?.length) {
//         return (
//             <div className="video-nodata">
//                 <div className="video-nodata-main">
//                     <div className="video-nodata-img" />
//                     <div className="video-nodata-tip1">
//                         <FormattedMessage id="tip1" />
//                     </div>
//                     <div className="video-nodata-tip2">
//                         <FormattedMessage id="tip2" />
//                     </div>
//                 </div>
//             </div>
//         )
//     }

//     return (
//         <div className="video-library">
//             <div className="video-library-header">
//                 <HorizontalMenu
//                     menuTabs={menuTabs}
//                 />
//                 <div className="video-library-header-right">
//                     <SearchInput onChange={setSearchValue} value={searchValue} />
//                     <CommonTooltip
//                         overlay={(
//                             <FormattedMessage id="sortByDate" />
//                         )}
//                         placement="bottomLeft"
//                         trigger="hover"
//                     >
//                         <div
//                             className="video-library-search-more"
//                             onClick={() => setIsShort(!isShort)}
//                         >
//                             <SvgIcon icon="filter" />
//                         </div>
//                     </CommonTooltip>
//                 </div>
//             </div>
//             <Modal
//                 okText={intl.formatMessage({ id: "delete" })}
//                 onClose={() => setDeleteVisible(false)}
//                 onOk={deleteVideo}
//                 title={intl.formatMessage({ id: "tipTitle1" })}
//                 visible={deleteVisible}
//             >
//                 <FormattedMessage id="tip3" />
//             </Modal>
//             <Modal
//                 onClose={() => setRenameVisible(false)}
//                 onOk={rename}
//                 title={intl.formatMessage({ id: "renameSession" })}
//                 visible={renameVisible}
//             >
//                 <FormattedMessage id="tip4" />
//                 <Input
//                     className="video-library-input"
//                     maxLength={24}
//                     onChange={(e) => setRenameValue(e.target.value)}
//                     placeholder={selectData?.folderName}
//                     value={renameValue}
//                 />
//             </Modal>
//             <Routes>
//                 <Route
//                     element={
//                         <VideoListTemplet
//                             callBack={callBack}
//                             isShort={isShort}
//                             noDataTip={(
//                                 <div className="video-library-no-data-tip">
//                                     <div className="video-library-no-data-main">
//                                         <div className="video-library-no-search" />
//                                         <div className="noting-found">
//                                             <FormattedMessage id="nothingFound" />
//                                         </div>
//                                         <div className="noting-found-text">
//                                             <FormattedMessage id="nothingFoundTip1" />
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}
//                             searchValue={searchValue}
//                             videoList={videoCache.data}
//                         />
//                     }
//                     index
//                 />
//                 <Route
//                     element={
//                         <VideoListTemplet
//                             callBack={callBack}
//                             isFavorite
//                             isShort={isShort}
//                             noDataTip={(
//                                 <div className="video-library-no-data-tip">
//                                     <div className="video-library-no-data-main">
//                                         <div className="video-library-no-favorite" />
//                                         <div className="noting-found">
//                                             <FormattedMessage id="NoFavoriteSessionsView" />
//                                         </div>
//                                         <div className="noting-found-text">
//                                             <FormattedMessage id="nothingFoundTip2" />
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}
//                             searchValue={searchValue}
//                             videoList={videoCache.data}
//                         />
//                     }
//                     path="favorites"
//                 />
//             </Routes>
//         </div>
//     )
// }

// export default VideoLibrary
