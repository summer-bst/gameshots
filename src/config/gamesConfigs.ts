import { OWGames } from "@overwolf/overwolf-api-ts"
import ApexUrl from "../assets/image/gameIcon/apex.png"
import LoLUrl from "../assets/image/gameIcon/lol.png"
import Dota2Url from "../assets/image/gameIcon/dota2.png"
import ValorantUrl from "../assets/image/gameIcon/valorant.png"
import CStUrl from "../assets/image/gameIcon/cs.png"
import PUBGUrl from "../assets/image/gameIcon/pubg.png"
import WarzoneUrl from "../assets/image/gameIcon/warzone.png"
import RocketLeagueUrl from "../assets/image/gameIcon/rocket_league.png"
import StarCraftIIUrl from "../assets/image/gameIcon/sc2.png"
import FortniteUrl from "../assets/image/gameIcon/fortnite.png"
import RainbowSixSiegeUrl from "../assets/image/gameIcon/rainbow_six_siege.png"

const gamesConfigs: GamesConfig[] = [
    {
        disabled: false,
        gameId: 21566,
        name: "Apex Legends",
        iconUrl: ApexUrl,
        registerEndEvent: [
            "kill", // 击杀信息(包含 kill knockdown assist)
            "death", // 死亡信息（knocked_out death）
            "revive", // 复活信息 （respawn）
            "match_state", // 匹配状态 （包含 match_start match_end）
            "rank" // 结算时是否获胜 （victory ）
            // "me", // 玩家信息
            // "team", // 团队信息
            // "damage", // 总伤害量
            // "match_info", // 匹配信息
            // "match_summary", // 结算信息
            // 'kill_feed' // 攻击信息
            // 'location', // 位置坐标
            // 'inventory', // 物品使用信息
            // 'roster', // 所有玩家信息
        ],
        events: [
            {
                key: "kill",
                eventFormattedId: "kill",
                formattedMessage: "kill",
                enable: true
            },
            {
                key: "assist",
                eventFormattedId: "assist",
                formattedMessage: "assist",
                enable: true
            },
            {
                key: "knockdown",
                eventFormattedId: "knockDown",
                formattedMessage: "event3",
                enable: true
            },
            {
                key: "victory",
                eventFormattedId: "victory",
                formattedMessage: "victory",
                enable: true
            },
            {
                key: "death",
                eventFormattedId: "death",
                formattedMessage: "death",
                enable: true
            },
            {
                key: "knocked_out",
                eventFormattedId: "knockedDown",
                formattedMessage: "event6",
                enable: true
            },
            {
                key: "healed_from_ko", // 被队友复苏
                eventFormattedId: "revived",
                formattedMessage: "event7",
                enable: true
            },
            {
                key: "respawn", // 重生
                eventFormattedId: "respawned",
                formattedMessage: "event8",
                enable: true
            }
        ]
    }, {
        disabled: false,
        gameId: 7314,
        name: "Dota 2",
        iconUrl: Dota2Url,
        registerEndEvent: [
            "game_state_changed",
            "match_state_changed", // 匹配状态DOTA_GAMERULES_STATE_PRE_GAME比赛开始 DOTA_GAMERULES_STATE_POST_GAME 比赛结束
            "match_ended", // 游戏结束
            "kill", // 击杀
            "assist", // 助攻
            "death", // 死亡
            "me", // 个人信息包含哪个队伍
            "match_info"
            // "gep_internal",
            // "match_detected",
            // "daytime_changed",
            // "clock_time_changed",
            // "ward_purchase_cooldown_changed",
            // "cs",//补兵的信息
            // "xpm",
            // "gpm",
            // "gold",
            // "hero_leveled_up",
            // "hero_buyback_info_changed",
            // "hero_boughtback",
            // "hero_health_mana_info",
            // "hero_status_effect_changed",debuff发送变化
            // "hero_attributes_skilled",
            // "hero_respawned", // 复活
            // "hero_ability_skilled",
            // "hero_ability_used",
            // "hero_ability_cooldown_changed",
            // "hero_ability_changed",
            // "hero_item_cooldown_changed",
            // "hero_item_changed",
            // "hero_item_used",
            // "hero_item_consumed",
            // "hero_item_charged",
            // "roster",
            // "party",
            // "error",//插件未初始化会触发
            // "hero_pool",
            // "game"
        ],
        events: [
            {
                key: "kill",
                eventFormattedId: "kill",
                formattedMessage: "kill",
                enable: true
            },
            {
                key: "death",
                eventFormattedId: "death",
                formattedMessage: "death",
                enable: true
            },
            {
                key: "assist",
                eventFormattedId: "assist",
                formattedMessage: "assist",
                enable: true
            },
            {
                key: "victory",
                eventFormattedId: "victory",
                formattedMessage: "victory",
                enable: true
            }
        ]
    }, {
        disabled: false,
        gameId: 5426,
        name: "League of Legends",
        iconUrl: LoLUrl,
        registerEndEvent: [
            "death", // 死亡信息
            "kill", // 击杀信息
            "assist", // 助攻信息
            "announcer" // 击杀信息看官方文档
            // "matchState", // 比赛状态
            // "respawn", // 复活信息
            // "summoner_info", // 玩家信息
            // "match_info",
            // 'live_client_data', // 客户端收到的游戏内数据。
            // 'gold', // 金币数量
            // 'abilities',
            // 'minions', // 小兵信息
            // 'teams',
            // 'level',
            // 'counters',
            // 'damage', // 总伤害
            // 'heal' // 治疗信息
        ],
        events: [
            {
                key: "kill",
                eventFormattedId: "kill",
                formattedMessage: "kill",
                enable: true
            },
            {
                key: "death",
                eventFormattedId: "death",
                formattedMessage: "death",
                enable: true
            },
            {
                key: "assist",
                eventFormattedId: "assist",
                formattedMessage: "assist",
                enable: true
            },
            {
                key: "victory",
                eventFormattedId: "victory",
                formattedMessage: "victory",
                enable: true
            },
            {
                key: "double_kill",
                eventFormattedId: "doubleKills",
                formattedMessage: "doubleKills",
                enable: true
            },
            {
                key: "triple_kill",
                eventFormattedId: "tripleKills",
                formattedMessage: "tripleKills",
                enable: true
            },
            {
                key: "quadra_kill",
                eventFormattedId: "quadraKills",
                formattedMessage: "quadraKills",
                enable: true
            },
            {
                key: "penta_kill",
                eventFormattedId: "pentaKills",
                formattedMessage: "pentaKills",
                enable: true
            }
        ]
    }, {
        disabled: true,
        gameId: 10902, // 英雄联盟客户端，唯一特殊的游戏
        name: "League of Legends Launcher",
        iconUrl: LoLUrl,
        registerEndEvent: [],
        events: []
    }, {
        disabled: false,
        gameId: 21640, 
        name: "Valorant",
        iconUrl: ValorantUrl,
        registerEndEvent: [
            "game_info",
            "match_info",
            "kill",
            "death"
        ],
        events: [
            {
                key: "kill",
                eventFormattedId: "kill",
                formattedMessage: "kill",
                enable: true
            },
            {
                key: "assist",
                eventFormattedId: "assist",
                formattedMessage: "assist",
                enable: true
            }, {
                key: "death",
                eventFormattedId: "death",
                formattedMessage: "death",
                enable: true
            }, {
                key: "headshot",
                eventFormattedId: "headshots", // 爆头
                formattedMessage: "headshots",
                enable: true
            },
            {
                key: "victory",
                eventFormattedId: "victory",
                formattedMessage: "victory",
                enable: true
            }
        ]
    }, {
        disabled: false,
        gameId: 7764, 
        name: "CS:GO",
        iconUrl: CStUrl,
        note: "gameNote1",
        registerEndEvent: [
            "match_start",
            "match_end",
            "headshot",
            "assist",
            "kill",
            "death",
            "match_info"
        ],
        events: [
            {
                key: "kill",
                eventFormattedId: "kill",
                formattedMessage: "kill",
                enable: true
            },
            {
                key: "assist",
                eventFormattedId: "assist",
                formattedMessage: "assist",
                enable: true
            },
            {
                key: "death",
                eventFormattedId: "death",
                formattedMessage: "death",
                enable: true
            },
            {
                key: "headshot",
                eventFormattedId: "headshots", // 爆头
                formattedMessage: "headshots",
                enable: true
            },
            {
                key: "victory",
                eventFormattedId: "victory",
                formattedMessage: "victory",
                enable: true
            }
        ]
    },
    {
        disabled: false,
        gameId: 10906, 
        name: "PUBG",
        iconUrl: PUBGUrl,
        registerEndEvent: [
            "kill",
            "match",
            "death",
            "revived",
            "rank"
            // "killer"
        ],
        events: [
            {
                key: "kill",
                eventFormattedId: "kill",
                formattedMessage: "kill",
                enable: true
            },
            {
                key: "assist",
                eventFormattedId: "assist",
                formattedMessage: "assist",
                enable: true
            },
            {
                key: "death",
                eventFormattedId: "death",
                formattedMessage: "death",
                enable: true
            },
            {
                key: "knockout", // 被你击倒
                eventFormattedId: "knockDown",
                formattedMessage: "event3",
                enable: true
            },
            {
                key: "headshot",
                eventFormattedId: "headshots", // 爆头
                formattedMessage: "headshots",
                enable: true
            },
            {
                key: "knockedout",
                eventFormattedId: "knockedDown", // 被击倒
                formattedMessage: "event6",
                enable: true
            },
            {
                key: "revived", // 被队友复活
                eventFormattedId: "revived",
                formattedMessage: "event7",
                enable: true
            },
            {
                key: "chickenDinner", // 吃鸡了，即胜利
                eventFormattedId: "chickenDinner",
                formattedMessage: "chickenDinner",
                enable: true
            }
        ]
    },
    {
        disabled: false,
        gameId: 21626, 
        name: "Call of Duty: Warzone",
        iconUrl: WarzoneUrl,
        note: "gameNote1",
        registerEndEvent: [
            "kill",
            "death",
            "match_info",
            "game_info"
        ],
        events: [
            {
                key: "kill",
                eventFormattedId: "kill",
                formattedMessage: "kill",
                enable: true
            },
            {
                key: "assist",
                eventFormattedId: "assist",
                formattedMessage: "assist",
                enable: true
            }, {
                key: "death",
                eventFormattedId: "death",
                formattedMessage: "death",
                enable: true
            }
        ]
    },
    {
        disabled: false,
        gameId: 10798, 
        name: "Rocket League",
        iconUrl: RocketLeagueUrl,
        registerEndEvent: [
            // "gep_internal",
            // "roster",
            "game_info",
            "stats",
            "me",
            "match",
            "match_info",
            "death"
        ],
        events: [
            {
                key: "teamGoal", // 队伍的进球
                eventFormattedId: "teamGoal",
                formattedMessage: "teamGoal",
                enable: true
            },
            {
                key: "opposingTeamGoal", // 对手进球
                eventFormattedId: "opposingTeamGoal",
                formattedMessage: "opposingTeamGoal",
                enable: true
            },
            {
                key: "Assist",
                eventFormattedId: "assist",
                formattedMessage: "assist",
                enable: true
            },
            {
                key: "Save",
                eventFormattedId: "save",
                formattedMessage: "save",
                enable: true
            },
            {
                key: "Epic Save",
                eventFormattedId: "epicSave",
                formattedMessage: "epicSave",
                enable: true
            },
            {
                key: "Pool Shot",
                eventFormattedId: "poolShot",
                formattedMessage: "poolShot",
                enable: true
            },
            {
                key: "death",
                eventFormattedId: "death",
                formattedMessage: "death",
                enable: true
            },
            {
                key: "victory",
                eventFormattedId: "victory",
                formattedMessage: "victory",
                enable: true
            }
        ]
    },
    {
        disabled: false,
        gameId: 5855, 
        name: "StarCraft II",
        iconUrl: StarCraftIIUrl,
        registerEndEvent: [
            "match_info"
        ],
        events: [
            {
                key: "victory",
                eventFormattedId: "victory",
                formattedMessage: "victory",
                enable: true
            }
        ]
    },
    {
        disabled: false,
        gameId: 21216, 
        name: "Fortnite",
        iconUrl: FortniteUrl,
        registerEndEvent: [
            "kill",
            "death",
            "revived",
            "match",
            // "match_info",
            "rank"
        ],
        events: [
            {
                key: "kill",
                eventFormattedId: "kill",
                formattedMessage: "kill",
                enable: true
            },
            {
                key: "death",
                eventFormattedId: "death",
                formattedMessage: "death",
                enable: true
            },
            {
                key: "knockout",
                eventFormattedId: "knockDown",
                formattedMessage: "event3",
                enable: true
            },
            {
                key: "knockedout",
                eventFormattedId: "knockedDown",
                formattedMessage: "event6",
                enable: true
            },
            {
                key: "headshot",
                eventFormattedId: "headshots", // 爆头
                formattedMessage: "headshots",
                enable: true
            },
            {
                key: "victory",
                eventFormattedId: "victory",
                formattedMessage: "victory",
                enable: true
            }
        ]
    },
    {
        disabled: false,
        gameId: 10826, 
        name: "Rainbow Six: Siege",
        iconUrl: RainbowSixSiegeUrl,
        registerEndEvent: [
            "game_info",
            "match",
            "match_info",
            // "roster",
            "kill",
            "death",
            // "me",
            "defuser"
        ],
        events: [
            {
                key: "kill",
                eventFormattedId: "kill",
                formattedMessage: "kill",
                enable: true
            },
            {
                key: "death",
                eventFormattedId: "death",
                formattedMessage: "death",
                enable: true
            },
            {
                key: "knockedout",
                eventFormattedId: "knockedDown", // 被击倒
                formattedMessage: "event6",
                enable: true
            },
            {
                key: "headshot",
                eventFormattedId: "headshots", // 爆头
                formattedMessage: "headshots",
                enable: true
            },
            {
                key: "roundVictory", // 轮次胜利
                eventFormattedId: "roundVictory",
                formattedMessage: "roundVictory",
                enable: true
            },
            {
                key: "defuser_planted",
                eventFormattedId: "defuserPlanted", // 安装拆弹器
                formattedMessage: "defuserPlanted",
                enable: true
            },
            {
                key: "defuser_disabled",
                eventFormattedId: "defuserDisabled", // 安装拆弹器被拆除
                formattedMessage: "defuserDisabled",
                enable: true
            },
            {
                key: "victory",
                eventFormattedId: "victory",
                formattedMessage: "victory",
                enable: true
            }
        ]
    }
].sort((a, b) => a.name > b.name // 按首字母排序
    ? 1
    : -1)

// RainbowSixSiegeUrl
async function getCurrentGame () {
    const info = await OWGames.getRunningGameInfo()

    return gamesConfigs.find((e) => e.gameId === info.classId)
}

export { gamesConfigs, getCurrentGame }
