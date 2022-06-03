module.exports = {
    "extends": "eslint:recommended",
    "root": true,
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true,
        "node": true
    },
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    "rules": {
      "no-useless-escape": 0,
      "no-prototype-builtins": 0,
      "no-empty": 0,
      "no-control-regex": 0
    }
}
