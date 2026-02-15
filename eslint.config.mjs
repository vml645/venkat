import nextVitals from 'eslint-config-next/core-web-vitals.js'

export default [
  ...nextVitals,
  {
    rules: {
      'react/no-unescaped-entities': 'off',
    },
  },
]
