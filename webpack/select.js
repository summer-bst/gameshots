const fs = require("fs")
const inquirer = require("inquirer")
const allModules = require("./modules.config.json")
const choices = []
const devPageCfg = []

for (const key in allModules) {
    const element = allModules[key]
    choices.push({
        name: `${element.title}(${element.entry.match(/src\/(\S*)/)[1]})`,
        value: element.entry,
        key: key
    })
}

const promptList = [
    {
        type: "checkbox",
        message: "请选择需要加载的模块",
        name: "fileList",
        choices: choices,
        validate: function (answers) {
            const done = this.async()

            if (answers.length === 0) {
                done("至少选择一个模块")

                return
            }
            done(null, true)
        }
    }
]

const confirmList = [
    {
        type: "list",
        message: "",
        name: "isConfirm",
        choices: [ "Yes", "No" ]
    }
]

function dealChoices (name) {
    return choices.find((e) => e.value === name).key
}
inquirer.prompt(promptList).then((answers) => {
    confirmList[0].message = `确定加载[${answers.fileList}]模块吗？`
    inquirer.prompt(confirmList).then((res) => {
        if (res.isConfirm === "Yes") {
            console.log(answers)
            answers.fileList.forEach((e) => {
                const key = dealChoices(e)
                devPageCfg.push({ name: key, ...allModules[key] })
            })
            fs.writeFileSync(
                "webpack/development.config.json",
                JSON.stringify(devPageCfg)
            )
        }
    })
})
