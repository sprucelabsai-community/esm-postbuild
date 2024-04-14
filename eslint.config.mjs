import { buildEsLintConfig } from 'eslint-config-spruce'

export default buildEsLintConfig({
	ignores: [
		'build/**',
		'node_modules/**',
		'src/__tests__/testDirsAndFiles/**',
	]
})