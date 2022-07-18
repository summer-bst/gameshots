
type HeaderParams = {
    gtvUserId: string,
    gtvAuthToken: string
}

type UserConfig = {
    app_name: string,
    client_name: string,
    icon_url: string,
    settings: {
        disk_space_limit: number
    }

}

type UserInfo = {
    avatar: string,
    user_id: string,
    user_name: string
}

type UserClub = {
    club_id: string,
    name: string,
    icon_url: string
}

type UploadMetaData = {
    key: string,
    value: string,
    input_type: string
}

type UploadData = {
    upload_url: string,
    upload_metadata: UploadMetaData[]
}

type requestState = {
    headerParams: HeaderParams,
    userConfig?: UserConfig,
    userInfo?: UserInfo,
    userClubs?: UserClub[],
    userId?: string,
    username?: string,
    machineId?: string,
    gamestatus: Gamestatus,
    updateLogs?: UpdateLogs
}

type ShareContent = {
    sessionId: string,
    clipId: string,
    clipDuration: string,
    clipCaptureType: "auto" | "manual",
    clubId: string,
    description: string,
    tags: string[],
    thumbnailFile: File,
    clipFile: File,
    gameId: string,
    gameName?: string
}

type UserStatsParams = {
    event_type: UserStatsEventType,
    app_launch_source?: "auto_launch" | "desktop_shortcut" | "overwolf",
    overlay_settings?: {
        auto_launch: boolean,
        overwolf_overlay_enabled: boolean
    },
    game_settings?: {
        game_id: string,
        game_name: string,
        is_changed: boolean,
        manual_capture_settings: {
            before_time: string,
            after_time: string
        },
        auto_capture_settings: {
            before_time: string,
            after_time: string,
            capture_events: Record<string, boolean>
        }
    }[],
    capture_settings?: {
        fps: string,
        resolution: string,
        bitrate: string,
        encoder: string,
        preset: string,
        is_customised_settings: boolean,
        capture_system_sound: string,
        system_sound_device: string,
        capture_microphone_sound: string,
        microphone_sound_device: string
    },
    storage_settings?: { 
        disk_space_limit: string,
        drive_name: string
    },
    failure_reason?: {
        type: string,
        [key: string]: string
    } 
}

type UserStatsEventType = "app_install" | "app_launch" | "capture_settings_changed" | "game_settings_changed" | "overlay_settings_changed" | "storage_settings_changed"

type ContentStatsParams = {
    event_type: ContentStatsEventType,
    session_id?: string,
    clip_id?: string,
    clip_duration?: string,
    clip_capture_type?: "auto" | "manual",
    clip_share_tags?: string,
    clip_share_description?: string,
    clip_share_platform?: "Discord" | "game.tv" | "Gfycat" | "Reddit" | "Twitter" | "Youtube",
    game_id?: string,
    game_name?: string,
    session_clips?: {
        clip_id: string,
        clip_duration: string,
 		clip_capture_type: "auto" | "manual" 
    }[],
    failure_reason?: {
        type: string,
        [key: string]: string
    }
}

type ContentStatsEventType = "clip_deleted" | "clip_marked_favourite" | "clip_marked_unfavourite" | "clip_share_fail" | "clip_share_success" | "session_captured" | "session_deleted" | "session_marked_favourite" | "session_marked_unfavourite"

type Gamestatus = {
    game_id: number,
    state: 0 | 1 | 2 | 3,
    disabled: boolean
}[]

type UpdateLogs = {
    versions: {
        important: boolean,
        version: string,
        html: string,
        timestamp: number
    }[],
    meta: {
        perPage: number
    }
}