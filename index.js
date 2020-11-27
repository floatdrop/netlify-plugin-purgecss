const purgecss = require('purgecss')
const fs = require('fs').promises

module.exports = {
    onPostBuild: async ({ inputs, constants, utils }) => {
        const purgeCSSResults = await new purgecss.PurgeCSS().purge({
            content: [constants.PUBLISH_DIR + '/**/*.html'],
            css: [constants.PUBLISH_DIR + '/**/*.css']
        })

        for (const cssFile of purgeCSSResults) {
            if (cssFile.rejected) {
                return utils.build.failBuild('Failed to inline critical CSS.', { error: cssFile.rejected })
            }
            try {
		const stats = await fs.stat(cssFile.file)
                console.log("Purged " + cssFile.file + ": " + stats.size + " bytes -> " + cssFile.css.length + " bytes (" + (100.0 * cssFile.css.length / stats.size) + "%)");
                await fs.writeFile(cssFile.file, cssFile.css)
            } catch (error) {
                return utils.build.failBuild('Failed to inline critical CSS.', { error })
            }
        }
    }
}
