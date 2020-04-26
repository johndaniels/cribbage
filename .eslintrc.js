module.exports = {
    "parser": "babel-eslint",
    "plugins": ["jest"],
    extends: [
        "eslint:recommended",
        "plugin:react/recommended",
    ],
    "parserOptions": {
        "ecmaVersion": 2017,
        sourceType: 'module',
        "ecmaFeatures": {
            "jsx": true
        }
    },
    env: { es6: true, browser: true, "jest/globals": true},
    "ignorePatterns": ["webpack.config.js", "node_modules/"],
    "settings": {
        "react": {
            "version": "detect",
        }
    }
};