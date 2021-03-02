const spruceSemanticRelease = require('@sprucelabs/semantic-release')

const config = spruceSemanticRelease.default({
	config: spruceSemanticRelease.ReleaseConfiguration.Package,
})
console.log(config)
module.exports = config
