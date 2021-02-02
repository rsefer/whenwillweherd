const htmlmin = require('html-minifier');
const UglifyJS = require('uglify-js');

module.exports = eleventyConfig => {

	eleventyConfig.setUseGitIgnore(false);

	eleventyConfig.addPassthroughCopy({
		'_src/images' : '/images',
		'./_tmp/style.css' : './style.css'
	});
	eleventyConfig.addWatchTarget('_src/**/*.js');
	eleventyConfig.addWatchTarget('./_tmp/style.css');

	eleventyConfig.addShortcode('version', () => {
		return String(Date.now());
	});

	eleventyConfig.addTransform('htmlmin', function(content, outputPath) {
    if (outputPath.endsWith('.html')) {
			let minified = htmlmin.minify(content, {
				useShortDoctype: true,
				removeComments: true,
				collapseWhitespace: true
			});
			return minified;
		}
		return content;
	});

	eleventyConfig.addNunjucksAsyncFilter('jsmin', async function (code, callback) {
		const minified = await UglifyJS.minify(code);
		callback(null, minified.code);
	});

	if (process.env.SSL_KEY_PATH && process.env.SSL_CRT_PATH) {
		eleventyConfig.setBrowserSyncConfig({
			https: {
				key: process.env.SSL_KEY_PATH,
				cert: process.env.SSL_CRT_PATH
			}
		});
	}

};
