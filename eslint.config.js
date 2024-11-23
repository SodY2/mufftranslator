import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  vue: true,
  typescript: {
    overrides: {
      'ts/consistent-type-definitions': 'off',
    },
  },
})
