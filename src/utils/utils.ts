
// 将base64转换为文件
function dataURLtoFile (dataurl: string, filename = ""): File {
    const arr = dataurl.split(",")
    const mime = arr?.[0]?.match(/:(.*?);/)?.[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }

    return new File([ u8arr ], filename, { type: mime })
}

// 获取可显示的video url
function getVideoUrl (e: {
    filePath?: string,
    overwolfPath?: string
}) {
    return NODE_ENV === "local" ?
        e.filePath?.replace(/\//g, "\\")?.replace(`${overwolf.io.paths.videos}\\Overwolf`, "")
            .replace(/#/g, "%23")
        : e.filePath?.replace(/#/g, "%23")
}

const capitalize = (str: string) => {
    return str[0].toUpperCase() + str.slice(1)
}

export { dataURLtoFile, getVideoUrl, capitalize }