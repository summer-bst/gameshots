import React, { useEffect, useState } from "react"
import { IntlProvider } from "react-intl"
import languages from "./index"

const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
    const [ locale, setLocale ] = useState("en")
    useEffect(() => {
        // 首次获取语言信息
        overwolf.settings.language.get(({ language }) => {
            setLocale(language)
        })
        // 语言变化监听
        overwolf.settings.language.onLanguageChanged.addListener(({ language }) => {
            setLocale(language)
        })
    }, [])

    return (
        <IntlProvider
            locale={locale}
            messages={languages[locale] || languages.en}
        >
            {children}
        </IntlProvider>
    )
}

export default LocaleProvider
