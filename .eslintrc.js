module.exports = {
    parser: "@typescript-eslint/parser",
    extends: [
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    plugins: [
        "@typescript-eslint",
        "react",
        "react-hooks"
    ],
    env: {
        browser: true,
        node: true
    },
    settings: {
        // 告诉eslint自动检测React的版本
        react: {
            pragma: "React",
            version: "detect"
        }
    },
    parserOptions: {
        // 指定ESLint可以解析JSX语法
        ecmaVersion: 2021,
        sourceType: "module",
        ecmaFeatures: { jsx: true }
    },
    rules: {
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/no-this-alias": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/array-type": "error", // 使用[]定义数组元素
        "space-before-function-paren": "off",
        "@typescript-eslint/space-before-function-paren": [ "error" ],
        "@typescript-eslint/ban-ts-comment": "off",
        "keyword-spacing": "off",
        "@typescript-eslint/keyword-spacing": [ "error" ], // 关键词前后要有空格
        "@typescript-eslint/lines-between-class-members": [ "error", "always", { exceptAfterOverload: false } ],
        "@typescript-eslint/indent": [ "error", 4, { ignoredNodes: [ "JSXElement" ] } ],
        "@typescript-eslint/no-unused-vars": "warn",
        "@typescript-eslint/no-use-before-define": [ "error", { functions: false } ], // 方法可以后置定义使用
        "padding-line-between-statements": "off",
        "@typescript-eslint/type-annotation-spacing": "error", // ts类型冒号前后空格
        // "@typescript-eslint/require-await": "error", 
        // "@typescript-eslint/typedef": [ "error", {
        //     "arrowParameter": true,
        //     "variableDeclaration": true
        // } ],
        "react/display-name": "off",
        "@typescript-eslint/padding-line-between-statements": [ 
            "error", 
            { blankLine: "always", 
                prev: "*", 
                next: [
                    "interface",
                    "type",
                    "return",
                    "function",
                    "multiline-let",
                    "multiline-const",
                    "export",
                    "if",
                    "for",
                    "block-like"
                ] } 
        ],
        "func-call-spacing": "off",
        "no-unneeded-ternary": "error", // 存在更简单方式时禁用三元表达式
        "no-useless-return": "error", // 禁用无效的return
        "prefer-arrow-callback": "error", // 能用箭头函数用箭头
        "no-dupe-class-members": "off",
        "quote-props": [ "error", "as-needed" ], // 对象属性尽量不用引号
        "@typescript-eslint/no-dupe-class-members": [ "error" ], // 禁止class内重复的变量
        "@typescript-eslint/func-call-spacing": [ "error" ],
        "no-multiple-empty-lines": [ "error", { max: 1 } ], // 最大空行数量
        "key-spacing": [ "error", { afterColon: true } ],
        "multiline-ternary": [ "error", "always" ],
        "arrow-parens": "error",
        "arrow-spacing": "error",
        "no-lone-blocks": "error",
        "no-whitespace-before-property": "error", // 禁止对象点前面有空格
        "no-multi-spaces": "error", // 禁止多个空格
        "no-duplicate-imports": "off",
        "no-constant-binary-expression": "error", // 不允许操作不影响值的表达式。
        "@typescript-eslint/no-duplicate-imports": [ "error" ], // 禁止重复导入
        "no-duplicate-case": "error",
        "vars-on-top": "error",
        "brace-style": "off",
        "@typescript-eslint/brace-style": [ "error" ],
        "no-irregular-whitespace": "error",
        "no-dupe-keys": "error", // 禁止对象中重复键值
        "template-curly-spacing": "error",
        "prefer-template": "error",
        "no-use-before-define": "off",
        "no-undef": "off",
        "no-unused-vars": "off", 
        "space-in-parens": [ "error", "never" ], // 括号内禁止空格
        "object-curly-spacing": "off",
        "@typescript-eslint/object-curly-spacing": [ "error", "always" ], // 大括号加空格
        "array-bracket-spacing": [ "error", "always" ], // 中括号加空格
        "explicit-member-accessibility": "off",
        "comma-spacing": "off",
        "@typescript-eslint/comma-spacing": [ "error" ],
        "spaced-comment": [ "error", "always" ], // 注释后面加空格
        "space-infix-ops": "off",
        "@typescript-eslint/space-infix-ops": [ "error", { int32Hint: true } ], //
        "space-unary-ops": "error", // 关键词要有空格
        "jsx-a11y/anchor-is-valid": "off",
        // "sort-imports": [ "error", { "ignoreDeclarationSort": false , "memberSyntaxSortOrder": [  'none', 'multiple' , 'all','single' ] } ],
        "block-spacing": "error", // 禁止或强制在代码块中开括号前和闭括号后有空格
        "react/jsx-handler-names": "off",
        "react-hooks/rules-of-hooks": "error",
        "react/jsx-fragments": "error",
        "react/jsx-no-constructed-context-values": "error", // 强制使用usememo定义hook常量
        "react-hooks/exhaustive-deps": "warn",
        "react/jsx-closing-tag-location": "error",
        "react/jsx-props-no-multi-spaces": "error",
        "react/jsx-key": "error", // 数组dom一定要使用key
        "react/jsx-equals-spacing": [ 2, "never" ],
        "react/jsx-curly-spacing": [ 2, "never" ],
        "react/jsx-wrap-multilines": [ 2, {
            declaration: "parens",
            assignment: "parens",
            return: "parens",
            arrow: "parens",
            condition: "ignore",
            logical: "ignore",
            prop: "ignore"
        } ],
        "react/jsx-sort-props": "error", // 属性按字母顺序排列
        "react/jsx-indent": [ "error", 4 ],
        "react/jsx-indent-props": [ "error", 4 ],
        "react/jsx-pascal-case": "error",
        "react/jsx-tag-spacing": [ "error", {
            closingSlash: "never",
            beforeSelfClosing: "always",
            afterOpening: "never",
            beforeClosing: "never"
        } ],
        "react/jsx-closing-bracket-location": "error",
        "react/no-render-return-value": "error",
        "react/no-adjacent-inline-elements": "error",
        "react/jsx-curly-newline": "error",
        "react/react-in-jsx-scope": "error", // 必须引入react
        "react/no-string-refs": "error", // 禁止ref使用字符串定义
        "react/no-children-prop": "error", // 禁止通过props传递children
        "react/no-deprecated": "error", // 禁止使用已弃用的方法
        "react/no-array-index-key": "error", // 禁止key用索引表示
        "react/function-component-definition": [ 2, { namedComponents: "arrow-function" } ], // 使用箭头函数定义组件
        "space-before-blocks": "error",
        "one-var": [ "error", "never" ],
        "newline-per-chained-call": "error",
        "rest-spread-spacing": [ "error", "never" ],
        "no-extra-parens": "off", 
        "@typescript-eslint/no-extra-parens": [ "error", "all", { ignoreJSX: "all" } ], // 删除不必要的括号
        "react/jsx-boolean-value": "error", // 如果 prop 的值是 true 可以忽略这个值，直接写 prop 名就可以
        "react/self-closing-comp": "error", // 当没有子元素时，最好用自闭合标签
        "react/no-unused-state": "warn", // 禁止state中定义的参数未使用
        "no-extra-semi": "off",
        "@typescript-eslint/no-extra-semi": [ "error" ], // 禁止不必要的分号
        "no-debugger": process.env.NODE_ENV === "production"
            ? "error"
            : "warn",
        "@typescript-eslint/comma-dangle": [ "error", "never" ], // 强制尾部不加逗号
        "computed-property-spacing": [ "error", "never" ],
        "comma-dangle": "off",
        // "max-len": [ "error", 300 ],
        "react/jsx-first-prop-new-line": "error", // 第一个props强制换行
        "react/jsx-max-props-per-line": [ "error", { maximum: { single: 2, multi: 1 } } ], // 属性超过2个换行
        "react/jsx-one-expression-per-line": [ "error", { allow: "literal" } ],
        semi: [ "error", "never" ], // 不允许末尾加分号
        eqeqeq: [ "error", "always" ], // 要求使用 === 和 !==
        camelcase: "off",
        quotes: "off",
        "@typescript-eslint/quotes": [ "error", "double" ], // 尽量使用双引号
        indent: "off",
        "@typescript-eslint/sort-type-union-intersection-members": "error",
        "@typescript-eslint/consistent-indexed-object-style": "error",
        "@typescript-eslint/member-delimiter-style": [ "error", {
            multiline: {
                delimiter: "comma",
                requireLast: false
            },
            singleline: {
                delimiter: "comma",
                requireLast: false
            },
            multilineDetection: "brackets"
        } ]
        // "@typescript-eslint/consistent-type-exports": "error"
    }
}
