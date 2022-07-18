import React from "react"
import { Routes, Route } from "react-router-dom"
import Step1 from "./Step1"
import Step2 from "./Step2"
import Step3 from "./Step3"
import Step4 from "./Step4"
import Step5 from "./Step5"
import Step6 from "./Step6"
import "./index.scss"

const Guide = () => {
    return (
        <div className="guide">
            <div className="guide-main">
                <Routes>
                    <Route
                        element={<Step1 />}
                        index
                    />
                    <Route
                        element={<Step2 />}
                        path="step2"
                    />
                    <Route
                        element={<Step3 />}
                        path="step3"
                    />
                    <Route
                        element={<Step4 />}
                        path="step4"
                    />
                    <Route
                        element={<Step5 />}
                        path="step5"
                    />
                    <Route
                        element={<Step6 />}
                        path="step6"
                    />
                </Routes>
            </div>
        </div>
    )
}

export default Guide
