let ws: WebSocket

async function initSocket (getSocketLog?: (params: any) => void): Promise<void> {
    ws = new WebSocket("ws://localhost:4000")

    return new Promise<void>((resolve, reject) => {
        ws.onopen = () => {
            resolve(console.log("连接websocket成功"))
        }

        ws.onerror = (e) => {
            reject(console.log(e))
        }

        ws.onmessage = (params: { data: Blob }) => {
            const reader = new FileReader()
            reader.readAsText(params.data)

            reader.onload = function () {
                if (getSocketLog && typeof reader.result === "string") getSocketLog(JSON.parse(reader.result)) // 内容就在这里
            }
        }
    })
}

async function sendLog (message?: number | string, params?: any): Promise<void> {
    ws.send(JSON.stringify({ message, params }))
}

export { initSocket, sendLog }
