import React, { memo, KeyboardEvent } from "react"
import Input from "./Input"

const specialValue: Record<string, string> = {
    "!": "1",
    "@": "2",
    "#": "3",
    $: "4",
    "%": "5",
    "^": "6",
    "&": "7",
    "(": "9",
    ")": "0",
    _: "-",
    "+": "=",
    ":": ";",
    "\"": "'",
    "?": "/",
    "<": ",",
    ">": ".",
    "{": "[",
    "}": "]",
    Escape: "Esc",
    ContextMenu: "Apps",
    Control: "Ctrl"
}

const Hotkey = (props: {
    className?: string,
    value: number | string,
    onChange: (key: string, event: KeyboardEvent<HTMLInputElement> | undefined) => any
}) => {
    const { className, value, onChange } = props

    return (
        <Input
            className={className}
            onKeyDown={(e) => {
                
                e.preventDefault()

                let key = e.key.length === 1
                    ? e.key.toUpperCase()
                    : e.key

                if (specialValue?.[e.key])key = specialValue?.[e.key]

                if (e.key === "*") {
                    if (e.code === "NumpadMultiply") {
                        key = "Num *"
                    } else {
                        key = "8"
                    }
                }

                if (e.key === "/" && e.code === "NumpadDivide") {
                    key = "Num /"
                }

                if (e.code === "Space")key = `${key}Space`

                if (e.altKey && e.key !== "Alt")key = `Alt + ${key}`

                if (e.shiftKey && e.key !== "Shift")key = `Shift + ${key}`

                if (e.ctrlKey && e.key !== "Control")key = `Ctrl + ${key}`

                if (e.key === "Process") key = ""// 表示非英文输入
                onChange(key, e)
            }}
            type="text"
            value={value}
        />
    )
}

export default memo(Hotkey)
