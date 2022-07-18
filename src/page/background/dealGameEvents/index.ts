import { gamesConfigs } from "@config/gamesConfigs"
import Apex from "./Apex"
import Dota2 from "./Dota2"
import LOL from "./LOL"
import Valorant from "./Valorant"
import CS from "./CS"
import PUBG from "./PUBG"
import Warzone from "./Warzone"
import RocketLeague from "./RocketLeague"
import StarCraftII from "./StarCraftII"
import Fortnite from "./Fortnite"
import RainbowSixSiege from "./RainbowSixSiege"

const dealGameEvents = [
    Apex,
    Dota2,
    LOL,
    Valorant,
    CS,
    PUBG,
    Warzone,
    RocketLeague,
    StarCraftII,
    Fortnite,
    RainbowSixSiege
]

gamesConfigs.forEach((e) => {
    e.gameEventFunction = dealGameEvents.find((v) => e.gameId === v.gameId)
})

export default gamesConfigs