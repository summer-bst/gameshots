import StreamDeviceVolume = overwolf.streaming.StreamDeviceVolume
import AssignHotkeyObject = overwolf.settings.hotkeys.AssignHotkeyObject
import StreamEncoder = overwolf.streaming.enums.StreamEncoder
import RunningGameInfo = overwolf.games.RunningGameInfo

type VideoCache = {
    isWriting: boolean, // 是否锁定写入
    sessionCount: number,
    data: VideoCacheData[]
}

type ShowVideoList = {
    sortTime: numebr,
    title: string,
    data: VideoCacheData[]
}

type VideoCacheData = {
    sessionId: string,
    iconUrl?: string,
    gameName?: string,
    gameId: number,
    folderName: string,
    showName: string,
    time?: number, // 时间戳
    isFavorite: boolean,
    clips: VideoClip,
    folderPath: string// 文件夹地址
}

type VideoClip = VideoClipItem[]

type VideoClipItem = {
    clipDuration: number,
    clipId: string,
    showName: string,
    fileName: string,
    filePath: string,
    overwolfPath: string, // overwolf协议的地址能快速访问
    isFavorite: boolean,
    eventType: string // 事件类型
}

type Resolution = 480 | 720 | 1080

type SettingConfig = {
    videoFolders: string[], // 视频路径，可能存在历史路径
    videoSapceLimit: number, // 视频文件夹最大空间
    enableOverlay: boolean, // 是否启用游戏中覆盖层
    resolution: Resolution, // 分辨率overwolf.settings.enums.ResolutionSettings
    fps: number,
    kbps: number,
    isCaptureCustom: boolean, // 录制界面自定义开关
    mic?: StreamDeviceVolume, // 麦克风音量
    game?: StreamDeviceVolume, // 录制流的音量变量为overwolf定义的
    gameTvId: number, // gameTvId
    endoderName?: StreamEncoder,
    preset?: string,
    gameSettings: GameSetting[]
}

type GameSetting = {
    gameId: number,
    manualBeforTime: number, // 手动录制往前时间
    manualAfterTime: number, // 手动录制往后时间
    autoBeforTime: number, // 自动录制往前时间
    autoAfterTime: number, // 自动录制往后时间
    autoRecordEvents: boolean, // 是否开启自动录制
    events: GameEvent[]
}

type GameEvent = {
    key: string,
    eventFormattedId: string,
    formattedMessage: string,
    enable?: boolean// 事件是否启用
}

type Quality = {
    resolution: Resolution,
    abbreviation: string,
    fps: number,
    type: string,
    id: string
}

type GamesConfig = {
    gameId: number,
    name: string,
    iconUrl: string,
    registerEndEvent: string[],
    events: GameEvent[],
    gameInfoListener?: any,
    gameEventFunction?: GameEventFunction,
    note?: string,
    disabled: boolean
}

interface hotKeyItem extends AssignHotkeyObject {
    binding: string,
    title: string,
    actionType?: string
}

type GameEventFunction = {
    gameId: number,
    onInfoUpdates: (result: any, currentGameSetting: GameSetting | undefined) => any,
    onNewEvents: (
        result: any,
        currentGameSetting: GameSetting | undefined,
        gameConfig: GamesConfig,
        currentGameInfo: RunningGameInfo
    ) => any
}

type SortType = "sortAZ" | "sortDateAsc" | "sortDateDesc" | "sortZA"

type SocialUser = {
    type: "all" | "Discord" | "game.tv" | "Gfycat" | "Reddit" | "Twitter" | "Youtube",
    id?: string,
    avatar?: string,
    username?: string,
    disabled?: boolean
}