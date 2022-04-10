module.exports = {
    "extends": ["react-app"],
    "rules": {
    },
    "overrides": [
      {
        "files": ["**/*.ts?(x)"],
        "rules": {
          "jsx-a11y/anchor-is-valid": "off",
        }
      }
    ]
  }