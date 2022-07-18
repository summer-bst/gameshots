import React from "react"
import ReactDOM from "react-dom"
// import { OWWindow } from '@overwolf/overwolf-api-ts'
import "@assets/icons" // 引入全部svg
import "./index.scss"
import Router from "./Router"
import { HashRouter } from "react-router-dom"
import { Provider } from "react-redux"
import { store } from "./redux/store"

ReactDOM.render(
    <Provider store={store}>
        <HashRouter>
            <Router />
        </HashRouter>
    </Provider>,
    document.getElementById("root")
)
