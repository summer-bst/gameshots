import "./index.scss"
import React, { useState, memo, useEffect } from "react"
import { FormattedMessage } from "react-intl"
import Svgicon from "@component/SvgIcon"

const Faqs = () => {
    
    const [ faqs, setFaqs ] = useState<{
        title: string,
        content: string[],
        isActive: boolean,
        values?: Record<string, React.ReactNode>
    }[]>()

    useEffect(() => {
        // 获取视频存放路径
        overwolf.settings.getOverwolfVideosFolder((result) => {
            if (result.success) {
                setFaqs([
                    {
                        title: "faqTitle1",
                        content: [ "faqExplain1" ],
                        isActive: false
                    },
                    {
                        title: "faqTitle2",
                        content: [ "faqExplain2", "faqExplain2-1" ],
                        isActive: false
                    },
                    {
                        title: "faqTitle3",
                        content: [ "faqExplain3" ],
                        isActive: false
                    },
                    {
                        title: "faqTitle4",
                        content: [ "faqExplain4" ],
                        isActive: false
                    },
                    {
                        title: "faqTitle5",
                        content: [ "faqExplain5" ],
                        isActive: false
                    },
                    {
                        title: "faqTitle6",
                        content: [ "faqExplain6" ],
                        isActive: false
                    },
                    {
                        title: "faqTitle7",
                        content: [ "faqExplain7" ],
                        isActive: false
                    },
                    {
                        title: "faqTitle8",
                        content: [ "faqExplain8" ],
                        isActive: false
                    },
                    {
                        title: "faqTitle9",
                        content: [ "faqExplain9" ],
                        isActive: false
                    },
                    {
                        title: "faqTitle10",
                        content: [ "faqExplain10" ],
                        values: { path: result.path.Value },
                        isActive: false
                    },
                    {
                        title: "faqTitle11",
                        content: [ "faqExplain11" ],
                        isActive: false
                    },
                    {
                        title: "faqTitle12",
                        content: [ "faqExplain12" ],
                        isActive: false
                    },
                    {
                        title: "faqTitle13",
                        content: [ "faqExplain13" ],
                        isActive: false
                    },
                    {
                        title: "faqTitle14",
                        content: [ "faqExplain14" ],
                        isActive: false
                    },
                    {
                        title: "faqTitle15",
                        content: [ "faqExplain15" ],
                        isActive: false,
                        values: {
                            a: (chunks: string) => (
                                <a
                                    className="external_link"
                                    href="https://www.game.tv/privacy-policy"
                                    rel="noreferrer"
                                    target="_blank"
                                >
                                    {chunks}
                                </a>
                            )
                        }
                    }
                ])
            }
        })
    }, [])

    return (
        <>
            {
                faqs?.map((e) => 
                    (
                        <div
                            className={
                                `faq-content-item ${e.isActive
                                    ? "faq-content-item-active"
                                    : ""}`
                            }
                            key={e.title}
                            onClick={() => {
                                e.isActive = !e.isActive
                                setFaqs([ ...faqs ])
                            }}
                        >
                            <div className="faq-content-title">
                                <FormattedMessage id={e.title} />
                                <Svgicon className="faq-content-icon" icon="down" />
                            </div>
                            {e.isActive &&
                            e.content.map((v) => (
                                <div
                                    className="faq-content-text"
                                    key={v}
                                >
                                    <FormattedMessage id={v} values={e.values} />
                                </div>
                            ))} 
                        </div>
                    )
                )
            }
        </>
    )
}

export default memo(Faqs)
