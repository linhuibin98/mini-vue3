module.exports = {
  parser: "babel-eslint",
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  plugins: ['prettier'],
  includes: ['src/**'],
  settings: {
    "import/resolver": "node"
  }
}
