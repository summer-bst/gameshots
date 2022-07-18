import moment from "moment"
import { useCallback } from "react"

const useMoment = (locale: string) => {
    return useCallback((time: number | string | undefined, format: string) => {
        if (locale === "zh") {
            moment.locale("zh-cn")
        } else {
            moment.locale(locale)
        }

        return moment(time).format(format)
    }, [ locale ]) 
}

export default useMoment